import { nanoid } from 'nanoid';
import { Task, CreateTaskRequest } from './types';
import { seedTasks } from './seeds';

class TaskStore {
  private tasks: Map<string, Task> = new Map();

  constructor() {
    // Initialize with seed tasks
    this.initializeSeeds();
  }

  private initializeSeeds() {
    seedTasks.forEach(task => {
      this.tasks.set(task.id, task);
    });
  }

  createTask(taskData: CreateTaskRequest): Task {
    const task: Task = {
      id: `tsk_${nanoid(8)}`,
      ...taskData,
      createdAt: new Date().toISOString(),
    };
    
    this.tasks.set(task.id, task);
    return task;
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  getPublishedTasks(): Task[] {
    return this.getAllTasks().filter(task => task.status === 'published');
  }
}

// Export singleton instance
export const taskStore = new TaskStore();
