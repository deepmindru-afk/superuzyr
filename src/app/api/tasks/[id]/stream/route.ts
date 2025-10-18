import { NextRequest, NextResponse } from 'next/server';
import { taskStore } from '@/lib/store';
import { mcpBrowserExecutor } from '@/lib/mcp-browser-executor';
import { localBrowserExecutor } from '@/lib/local-browser-executor';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = taskStore.getTask(id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await request.json();
    const { paramValues = {}, executionMode = 'streaming' } = body;

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial message
          const initialMessage = {
            type: 'start',
            message: 'Starting task execution...',
            timestamp: new Date().toISOString(),
            task: {
              id: task.id,
              name: task.name,
              website: task.website
            }
          };
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(initialMessage)}\n\n`)
          );

          // Execute task with appropriate executor based on mode
          let result;
          if (executionMode === 'local') {
            // Use local browser executor for local execution
            result = await localBrowserExecutor.executeTaskWithLocalBrowser(
              task,
              paramValues,
              (update) => {
                // Send real-time updates to the client
                const streamMessage = {
                  type: 'update',
                  ...update,
                  taskId: task.id
                };
                
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(streamMessage)}\n\n`)
                );
              }
            );
          } else {
            // Use MCP streaming execution for cloud/streaming modes
            result = await mcpBrowserExecutor.executeTaskWithStreaming(
              task,
              paramValues,
              (update) => {
                // Send real-time updates to the client
                const streamMessage = {
                  type: 'update',
                  ...update,
                  taskId: task.id
                };
                
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(streamMessage)}\n\n`)
                );
              }
            );
          }

          // Send completion message with proper structure
          const completionMessage = {
            type: 'complete',
            message: 'Task execution completed',
            timestamp: new Date().toISOString(),
            result: {
              success: result?.success ?? true, // Default to true if undefined
              screenshots: result?.screenshots?.length || 0,
              logs: result?.logs?.length || 0,
              error: result?.error || null
            }
          };
          
          console.log('Sending completion message:', completionMessage); // Debug log
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(completionMessage)}\n\n`)
          );

          // Close the stream
          controller.close();

        } catch (error) {
          // Send error message
          const errorMessage = {
            type: 'error',
            message: `Task execution failed: ${error}`,
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error)
          };
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`)
          );
          controller.close();
        }
      }
    });

    // Return the stream as Server-Sent Events
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });

  } catch (error) {
    console.error('Streaming API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
