import { spawn } from 'child_process';
import { Plan, ExecutionResult, Task } from './types';
import * as path from 'path';
import { BrowserUseClient } from 'browser-use-sdk';

export class BrowserExecutor {
  private scriptPath: string;

  constructor() {
    this.scriptPath = path.join(process.cwd(), 'scripts', 'browser_executor.py');
  }

  async executePlanWithBrowserUseCloud(plan: Plan): Promise<ExecutionResult> {
    const { config } = await import('./config');
    const apiKey = config.browser.browserUseCloudApiKey;

    if (!apiKey) {
      throw new Error('Browser Use Cloud API key not configured');
    }

    try {
      console.log('Attempting Browser Use Cloud execution with SDK...');
      console.log('API Key:', apiKey.substring(0, 10) + '...');
      console.log('Plan:', JSON.stringify(plan, null, 2));

      // Initialize the Browser Use Cloud client
      const client = new BrowserUseClient({
        apiKey: apiKey,
      });

      // Convert our plan to Browser Use Cloud task format
      const taskInstructions = this.convertPlanToInstructions(plan);

      // Create and execute the task
      const task = await client.tasks.createTask({
        llm: "gpt-4o", // Use a reliable model
        task: taskInstructions,
      });

      console.log('Task created, waiting for completion...');
      const result = await task.complete();
      console.log('Browser Use Cloud execution completed:', result);

      return {
        success: true,
        plan,
        screenshots: [],
        logs: [
          'Browser Use Cloud task created',
          'Task execution completed',
          `Output: ${result.output || 'No output provided'}`,
        ],
        error: undefined,
      };

    } catch (error) {
      console.error('Browser Use Cloud execution error:', error);
      return {
        success: false,
        plan,
        error: `Browser Use Cloud execution failed: ${error}`,
        logs: [`Browser Use Cloud error: ${error}`],
      };
    }
  }

  private convertPlanToInstructions(plan: Plan): string {
    const steps = plan.steps.map((step, index) => {
      switch (step.type) {
        case 'navigate':
          return `${index + 1}. Navigate to ${step.value}`;
        case 'click':
          return `${index + 1}. Click on ${step.selector || 'the specified element'}`;
        case 'type':
          return `${index + 1}. Type "${step.value}" into ${step.selector || 'the input field'}`;
        case 'wait':
          return `${index + 1}. Wait for ${step.timeout || 2000}ms`;
        case 'assertText':
          return `${index + 1}. Verify that ${step.selector || 'the element'} contains the text "${step.text}"`;
        case 'capture':
          return `${index + 1}. Take a screenshot`;
        default:
          return `${index + 1}. Execute ${step.type}`;
      }
    }).join('\n');

    return `Execute the following browser automation steps:\n\n${steps}\n\nPlease complete each step carefully and take screenshots when requested.`;
  }

  async executeTaskWithBrowserUseCloud(task: Task, paramValues: Record<string, string> = {}, enableLiveView: boolean = false): Promise<ExecutionResult> {
    const { config } = await import('./config');
    const apiKey = config.browser.browserUseCloudApiKey;

    if (!apiKey) {
      throw new Error('Browser Use Cloud API key not configured');
    }

    try {
      console.log('Executing task with Browser Use Cloud SDK...');
      console.log('API Key:', apiKey.substring(0, 10) + '...');
      console.log('Task:', task.name);
      console.log('Website:', task.website);
      console.log('Live view enabled:', enableLiveView);

      // Initialize the Browser Use Cloud client
      const client = new BrowserUseClient({
        apiKey: apiKey,
      });

      // Replace parameter placeholders in instructions
      let instructions = task.instructions;
      task.params?.forEach(param => {
        const value = paramValues[param.name] || param.value || '';
        instructions = instructions.replace(new RegExp(`\\{\\{${param.name}\\}\\}`, 'g'), value);
      });

      // Create the task instructions
      const taskInstructions = `Website: ${task.website}

Instructions: ${instructions}

Please execute these instructions on the specified website. Take screenshots at key moments and provide a summary of what was accomplished.`;

      console.log('Task instructions:', taskInstructions);

      // Create and execute task
      const browserTask = await client.tasks.createTask({
        llm: "gpt-4o", // Use a reliable model
        task: taskInstructions,
      });

      console.log('Task created, starting execution...');

      const logs = [
        `Browser Use Cloud task: ${task.name}`,
        `Website: ${task.website}`,
        'Task execution started...',
      ];

      // Execute the task
      const result = await browserTask.complete();
      console.log('Task execution completed:', result);

      logs.push('Task execution completed');
      logs.push(`Output: ${result.output || 'No output provided'}`);
      logs.push('Session cleaned up');

      return {
        success: true,
        plan: { steps: [], estimatedDuration: 0 },
        screenshots: [],
        logs,
        error: undefined,
      };

    } catch (error) {
      console.error('Browser Use Cloud execution error:', error);
      return {
        success: false,
        plan: { steps: [], estimatedDuration: 0 },
        error: `Browser Use Cloud execution failed: ${error}`,
        logs: [`Browser Use Cloud error: ${error}`],
      };
    }
  }

  async executeTaskWithLocalBrowser(task: Task, paramValues: Record<string, string> = {}, enableLiveView: boolean = false): Promise<ExecutionResult> {
    const { config } = await import('./config');
    const apiKey = config.browser.browserUseCloudApiKey;

    if (!apiKey) {
      throw new Error('Browser Use Cloud API key not configured');
    }

    try {
      console.log('Executing task with Local Browser via Browser Use SDK...');
      console.log('API Key:', apiKey.substring(0, 10) + '...');
      console.log('Task:', task.name);
      console.log('Website:', task.website);
      console.log('Live view enabled:', enableLiveView);

      // Initialize the Browser Use Cloud client for local execution
      const client = new BrowserUseClient({
        apiKey: apiKey,
      });

      // Replace parameter placeholders in instructions
      let instructions = task.instructions;
      task.params?.forEach(param => {
        const value = paramValues[param.name] || param.value || '';
        instructions = instructions.replace(new RegExp(`\\{\\{${param.name}\\}\\}`, 'g'), value);
      });

      // Create the task instructions for local execution
      const taskInstructions = `Website: ${task.website}

Instructions: ${instructions}

Please execute these instructions on the specified website using a local browser window. This should open a visible browser window on your computer. Take screenshots at key moments and provide a summary of what was accomplished.`;

      console.log('Task instructions for local execution:', taskInstructions);

      // Create the task with local browser configuration
      const browserTask = await client.tasks.createTask({
        llm: "gpt-4o", // Use a reliable model
        task: taskInstructions,
      });

      console.log('Local browser task created, starting execution...');

      let result;
      const logs = [
        `Local Browser task: ${task.name}`,
        `Website: ${task.website}`,
        'Local browser execution started...',
        'A browser window should open on your computer',
      ];

      // Execute the task
      result = await browserTask.complete();

      console.log('Local browser execution completed:', result);

      logs.push('Local browser execution completed');
      logs.push(`Output: ${result.output || 'No output provided'}`);

      return {
        success: true,
        plan: { steps: [], estimatedDuration: 0 }, // We don't have a plan for this approach
        screenshots: [],
        logs,
        error: undefined,
      };

    } catch (error) {
      console.error('Local browser execution error:', error);
      return {
        success: false,
        plan: { steps: [], estimatedDuration: 0 },
        error: `Local browser execution failed: ${error}`,
        logs: [`Local browser error: ${error}`],
      };
    }
  }

  async executeTaskWithCDPBrowser(task: Task, paramValues: Record<string, string> = {}): Promise<ExecutionResult> {
    const { config } = await import('./config');
    const apiKey = config.browser.browserUseCloudApiKey;

    if (!apiKey) {
      throw new Error('Browser Use Cloud API key not configured');
    }

    try {
      console.log('Executing task with CDP-style Browser Session...');
      console.log('API Key:', apiKey.substring(0, 10) + '...');
      console.log('Task:', task.name);
      console.log('Website:', task.website);

      // Initialize the Browser Use Cloud client
      const client = new BrowserUseClient({
        apiKey: apiKey,
      });

      // Replace parameter placeholders in instructions
      let instructions = task.instructions;
      task.params?.forEach(param => {
        const value = paramValues[param.name] || param.value || '';
        instructions = instructions.replace(new RegExp(`\\{\\{${param.name}\\}\\}`, 'g'), value);
      });

      // Create enhanced task instructions for CDP-style execution
      const cdpTaskInstructions = `Website: ${task.website}

Instructions: ${instructions}

Please execute these instructions on the specified website. Use Chrome DevTools Protocol-style execution for precise control. Take screenshots at key moments and provide detailed logs of each action performed.`;

      console.log('CDP-style task instructions:', cdpTaskInstructions);

      // Create the task with CDP-style configuration
      const browserTask = await client.tasks.createTask({
        llm: "gpt-4o", // Use a reliable model
        task: cdpTaskInstructions,
      });

      console.log('CDP-style task created, starting execution...');

      const logs = [
        `CDP-style Browser task: ${task.name}`,
        `Website: ${task.website}`,
        'CDP-style execution started...',
        'Browser should be visible for live viewing',
      ];

      // Execute the task
      const result = await browserTask.complete();
      console.log('CDP-style execution completed:', result);

      logs.push('CDP-style execution completed');
      logs.push(`Output: ${result.output || 'No output provided'}`);

      return {
        success: true,
        plan: { steps: [], estimatedDuration: 0 },
        screenshots: [],
        logs,
        error: undefined,
      };

    } catch (error) {
      console.error('CDP-style Browser execution error:', error);
      return {
        success: false,
        plan: { steps: [], estimatedDuration: 0 },
        error: `CDP-style Browser execution failed: ${error}`,
        logs: [`CDP-style Browser error: ${error}`],
      };
    }
  }

  async executeTaskWithStreaming(task: Task, paramValues: Record<string, string> = {}, onUpdate?: (update: any) => void): Promise<ExecutionResult> {
    const { config } = await import('./config');
    const apiKey = config.browser.browserUseCloudApiKey;

    if (!apiKey) {
      throw new Error('Browser Use Cloud API key not configured');
    }

    try {
      console.log('Executing task with streaming updates...');
      console.log('API Key:', apiKey.substring(0, 10) + '...');
      console.log('Task:', task.name);
      console.log('Website:', task.website);

      // Initialize the Browser Use Cloud client
      const client = new BrowserUseClient({
        apiKey: apiKey,
      });

      // Replace parameter placeholders in instructions
      let instructions = task.instructions;
      task.params?.forEach(param => {
        const value = paramValues[param.name] || param.value || '';
        instructions = instructions.replace(new RegExp(`\\{\\{${param.name}\\}\\}`, 'g'), value);
      });

      // Create enhanced task instructions for streaming
      const taskInstructions = `Website: ${task.website}

Instructions: ${instructions}

Please execute these instructions on the specified website. Provide detailed step-by-step updates as you progress. Take screenshots at key moments and explain each action you're performing.`;

      console.log('Streaming task instructions:', taskInstructions);

      // Create the task with streaming enabled
      const browserTask = await client.tasks.createTask({
        llm: "gpt-4o",
        task: taskInstructions,
      });

      console.log('Streaming task created, starting execution...');

      const logs = [
        `Streaming Browser task: ${task.name}`,
        `Website: ${task.website}`,
        'Streaming execution started...',
      ];

      // Set up streaming with real-time updates using the correct API
      let result;
      let finalScreenshots: string[] = [];

      // Process streaming updates using task.stream()
      for await (const step of browserTask.stream()) {
        console.log('Streaming step:', step);
        
        // Extract meaningful information from the step
        const update = {
          type: 'step',
          message: 'Processing step...',
          timestamp: new Date().toISOString(),
          screenshot: step.screenshotUrl,
          action: 'Executing task step',
          status: 'in_progress'
        };

        // Send update to callback if provided
        if (onUpdate) {
          onUpdate(update);
        }

        // Add to logs
        logs.push(`[${update.timestamp}] Step: ${update.message}`);

        // Collect screenshots
        if (step.screenshotUrl) {
          finalScreenshots.push(step.screenshotUrl);
        }
      }

      // Get the final result
      result = await browserTask.complete();
      console.log('Streaming execution completed:', result);

      logs.push('Streaming execution completed');
      logs.push(`Output: ${result.output || 'No output provided'}`);

      return {
        success: true,
        plan: { steps: [], estimatedDuration: 0 },
        screenshots: finalScreenshots.length > 0 ? finalScreenshots : (result.screenshots || []),
        logs,
        error: undefined,
      };

    } catch (error) {
      console.error('Streaming execution error:', error);
      return {
        success: false,
        plan: { steps: [], estimatedDuration: 0 },
        error: `Streaming execution failed: ${error}`,
        logs: [`Streaming error: ${error}`],
      };
    }
  }

  async executePlan(plan: Plan): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      try {
        const pythonProcess = spawn('python3', [this.scriptPath, JSON.stringify(plan)]);
        
        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
          output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
          try {
            if (code === 0 && output) {
              const result = JSON.parse(output);
              resolve({
                success: result.success,
                plan,
                screenshots: [],
                error: undefined,
                logs: result.logs || []
              });
            } else {
              resolve({
                success: false,
                plan,
                error: errorOutput || `Process exited with code ${code}`,
                logs: [errorOutput]
              });
            }
          } catch (parseError) {
            resolve({
              success: false,
              plan,
              error: `Failed to parse result: ${parseError}`,
              logs: [output, errorOutput]
            });
          }
        });

        pythonProcess.on('error', (error) => {
          resolve({
            success: false,
            plan,
            error: `Failed to start process: ${error.message}`,
            logs: [error.message]
          });
        });

      } catch (error) {
        resolve({
          success: false,
          plan,
          error: `Execution failed: ${error}`,
          logs: [`Execution failed: ${error}`]
        });
      }
    });
  }

  async executePlanMock(plan: Plan): Promise<ExecutionResult> {
    // Mock execution for development
    console.log('Mock executing plan:', JSON.stringify(plan, null, 2));
    
    // Simulate execution time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      plan,
      screenshots: [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' // 1x1 transparent PNG
      ],
      logs: [
        'Mock: Navigated to website',
        'Mock: Executed automation steps',
        'Mock: Captured screenshot',
        'Mock: Task completed successfully'
      ]
    };
  }
}

export const browserExecutor = new BrowserExecutor();
