import { NextRequest, NextResponse } from 'next/server';
import { taskStore } from '@/lib/store';
import { CreateTaskRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskRequest = await request.json();
    
    // Validate required fields
    if (!body.name || !body.website || !body.llm || !body.instructions) {
      return NextResponse.json(
        { error: 'Missing required fields: name, website, llm, instructions' },
        { status: 400 }
      );
    }

    const task = taskStore.createTask(body);
    
    // Generate share link and embed code
    const baseUrl = request.nextUrl.origin;
    const shareLink = `${baseUrl}/r/${task.id}`;
    const embedCode = `<script src="${baseUrl}/cdn/button.js?task=${task.id}"></script>`;

    return NextResponse.json({
      task,
      shareLink,
      embedCode
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tasks = taskStore.getAllTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
