import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { taskStore } from '@/lib/store';
import { generatePlan } from '@/lib/planner';
import { mcpBrowserExecutor } from '@/lib/mcp-browser-executor';
import { localBrowserExecutor } from '@/lib/local-browser-executor';
import { RunTaskRequest, RunTaskResponse } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = taskStore.getTask(id);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const body: RunTaskRequest = await request.json();
    const paramValues = body.paramValues || {};

    // Generate execution ID
    const executionId = `exec_${nanoid(8)}`;

    // Generate plan
    const plan = await generatePlan(task, paramValues);
    
    // Execute using MCP Browser Use (much simpler and more powerful!)
    const { shouldUseRealAutomation } = await import('@/lib/config');
    
    let result;
    if (shouldUseRealAutomation()) {
      const executionMode = request.headers.get('execution-mode') || 'cloud';
      
      if (executionMode === 'streaming') {
        // Use MCP streaming execution (real-time updates)
        result = await mcpBrowserExecutor.executeTaskWithStreaming(task, paramValues);
      } else if (executionMode === 'local') {
        // Use actual Browser Use library for local execution
        result = await localBrowserExecutor.executeTaskWithLocalBrowser(task, paramValues);
      } else {
        // Use MCP session-based execution (default)
        result = await mcpBrowserExecutor.executeTaskWithSession(task, paramValues);
      }
    } else {
      // Use mock execution
      result = await mcpBrowserExecutor.executePlan(plan);
    }

    const response: RunTaskResponse = {
      executionId,
      plan,
      status: result.success ? 'completed' : 'failed',
      result
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error running task:', error);
    return NextResponse.json(
      { error: 'Failed to run task' },
      { status: 500 }
    );
  }
}
