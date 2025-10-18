import { spawn } from 'child_process';
import { Plan, ExecutionResult, Task } from './types';
import * as path from 'path';

export class LocalBrowserExecutor {
  private scriptPath: string;

  constructor() {
    this.scriptPath = path.join(process.cwd(), 'scripts', 'browser_use_local.py');
  }

  async executeTaskWithLocalBrowser(task: Task, paramValues: Record<string, string> = {}, onUpdate?: (update: any) => void): Promise<ExecutionResult> {
    try {
      console.log('Executing task with REAL local Browser Use...');
      console.log('Task:', task.name);
      console.log('Website:', task.website);

      // Replace parameter placeholders in instructions
      let instructions = task.instructions;
      task.params?.forEach(param => {
        const value = paramValues[param.name] || param.value || '';
        instructions = instructions.replace(new RegExp(`\\{\\{${param.name}\\}\\}`, 'g'), value);
      });

      const logs = [
        `Real Local Browser task: ${task.name}`,
        `Website: ${task.website}`,
        'Real local browser execution started...',
      ];

      if (onUpdate) {
        onUpdate({
          type: 'start',
          message: 'Starting REAL local browser execution...',
          timestamp: new Date().toISOString()
        });
      }

      // Execute the REAL Python script with Browser Use
      const result = await this.executePythonScript(task.website, instructions, onUpdate);

      logs.push('Real local browser execution completed');
      logs.push(`Output: ${result.output || 'No output provided'}`);

      return {
        success: result.success,
        plan: { steps: [], estimatedDuration: 0 },
        screenshots: result.screenshots || [],
        logs: [...logs, ...(result.logs || [])],
        error: result.error,
      };

    } catch (error) {
      console.error('Real Local Browser execution error:', error);
      return {
        success: false,
        plan: { steps: [], estimatedDuration: 0 },
        error: `Real Local Browser execution failed: ${error}`,
        logs: [`Real Local Browser error: ${error}`],
      };
    }
  }


  private async executePythonScript(website: string, instructions: string, onUpdate?: (update: any) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      // Use the virtual environment Python
      const venvPython = path.join(process.cwd(), 'venv', 'bin', 'python3');
      const pythonProcess = spawn(venvPython, [this.scriptPath], {
        env: {
          ...process.env,
          BROWSER_USE_API_KEY: process.env.BROWSER_USE_API_KEY || process.env.BROWSER_USE_CLOUD_API_KEY || '',
          BROWSER_TASK_WEBSITE: website,
          BROWSER_TASK_INSTRUCTIONS: instructions
        }
      });

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            try {
              const update = JSON.parse(line);
              if (onUpdate) {
                onUpdate(update);
              }
            } catch (e) {
              output += line + '\n';
            }
          }
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            output: output,
            logs: [output],
            screenshots: []
          });
        } else {
          // Return failure result instead of rejecting
          resolve({
            success: false,
            output: `Python script failed with code ${code}`,
            logs: [`Python script error: ${errorOutput}`],
            screenshots: [],
            error: `Python script failed with code ${code}: ${errorOutput}`
          });
        }
      });

      pythonProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  async executePlan(plan: Plan): Promise<ExecutionResult> {
    // Fallback to mock execution for plan-based tasks
    console.log('Local Browser executing plan:', JSON.stringify(plan, null, 2));
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      success: true,
      plan,
      screenshots: [],
      logs: ['Mock: Plan executed via Local Browser fallback'],
      error: undefined,
    };
  }
}

export const localBrowserExecutor = new LocalBrowserExecutor();
