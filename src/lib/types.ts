export type LlmChoice = 'gpt-4o-mini' | 'claude-haiku' | 'llama-3.1-8b';

export interface TaskParam {
  name: string;
  value?: string;
  required?: boolean;
}

export interface Task {
  id: string;              // tsk_xxx
  name: string;
  website: string;
  llm: LlmChoice;
  instructions: string;    // Can include {{param}} tokens
  params?: TaskParam[];
  status: 'draft' | 'published';
  createdAt: string;
}

export interface PlanStep {
  type: 'navigate' | 'click' | 'type' | 'wait' | 'assertText' | 'capture';
  selector?: string;
  value?: string;
  text?: string;
  timeout?: number;
}

export interface Plan {
  steps: PlanStep[];
  estimatedDuration: number;
}

export interface ExecutionResult {
  success: boolean;
  plan: Plan;
  screenshots?: string[];
  error?: string;
  logs: string[];
}

export interface CreateTaskRequest {
  name: string;
  website: string;
  llm: LlmChoice;
  instructions: string;
  params?: TaskParam[];
  status: 'draft' | 'published';
}

export interface RunTaskRequest {
  paramValues?: Record<string, string>;
}

export interface RunTaskResponse {
  executionId: string;
  plan: Plan;
  status: 'running' | 'completed' | 'failed';
  result?: ExecutionResult;
}
