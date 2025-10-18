import { Plan, ExecutionResult, Task } from './types';

export class MCPBrowserExecutor {
  private mcpServerUrl: string;
  private apiKey: string;

  constructor() {
    this.mcpServerUrl = 'https://api.browser-use.com/mcp/';
    this.apiKey = process.env.BROWSER_USE_API_KEY || process.env.BROWSER_USE_CLOUD_API_KEY || '';
  }

  async executeTaskWithStreaming(task: Task, paramValues: Record<string, string> = {}, onUpdate?: (update: any) => void): Promise<ExecutionResult> {
    try {
      console.log('Executing task with MCP Browser Use streaming...');
      console.log('Task:', task.name);
      console.log('Website:', task.website);

      // Replace parameter placeholders in instructions
      let instructions = task.instructions;
      task.params?.forEach(param => {
        const value = paramValues[param.name] || param.value || '';
        instructions = instructions.replace(new RegExp(`\\{\\{${param.name}\\}\\}`, 'g'), value);
      });

      const logs = [
        `MCP Browser task: ${task.name}`,
        `Website: ${task.website}`,
        'MCP streaming execution started...',
      ];

      // Use MCP server to execute task with streaming
      const result = await this.executeViaMCP(task.website, instructions, onUpdate);

      logs.push('MCP execution completed');
      logs.push(`Output: ${result.output || 'No output provided'}`);

      return {
        success: result.success,
        plan: { steps: [], estimatedDuration: 0 },
        screenshots: result.screenshots || [],
        logs: [...logs, ...(result.logs || [])],
        error: result.error,
      };

    } catch (error) {
      console.error('MCP Browser execution error:', error);
      return {
        success: false,
        plan: { steps: [], estimatedDuration: 0 },
        error: `MCP Browser execution failed: ${error}`,
        logs: [`MCP Browser error: ${error}`],
      };
    }
  }

  async executeTaskWithSession(task: Task, paramValues: Record<string, string> = {}): Promise<ExecutionResult> {
    try {
      console.log('Executing task with MCP Browser Use session...');
      console.log('Task:', task.name);
      console.log('Website:', task.website);

      // Replace parameter placeholders in instructions
      let instructions = task.instructions;
      task.params?.forEach(param => {
        const value = paramValues[param.name] || param.value || '';
        instructions = instructions.replace(new RegExp(`\\{\\{${param.name}\\}\\}`, 'g'), value);
      });

      const logs = [
        `MCP Browser task with session: ${task.name}`,
        `Website: ${task.website}`,
        'MCP session execution started...',
      ];

      // Use MCP server to execute task with session management
      const result = await this.executeViaMCPWithSession(task.website, instructions);

      logs.push('MCP session execution completed');
      logs.push(`Output: ${result.output || 'No output provided'}`);

      return {
        success: result.success,
        plan: { steps: [], estimatedDuration: 0 },
        screenshots: result.screenshots || [],
        logs: [...logs, ...(result.logs || [])],
        error: result.error,
      };

    } catch (error) {
      console.error('MCP Browser session execution error:', error);
      return {
        success: false,
        plan: { steps: [], estimatedDuration: 0 },
        error: `MCP Browser session execution failed: ${error}`,
        logs: [`MCP Browser session error: ${error}`],
      };
    }
  }

  async executeTaskWithLocalBrowser(task: Task, paramValues: Record<string, string> = {}): Promise<ExecutionResult> {
    try {
      console.log('Executing task with MCP Browser Use local browser...');
      console.log('Task:', task.name);
      console.log('Website:', task.website);

      // Replace parameter placeholders in instructions
      let instructions = task.instructions;
      task.params?.forEach(param => {
        const value = paramValues[param.name] || param.value || '';
        instructions = instructions.replace(new RegExp(`\\{\\{${param.name}\\}\\}`, 'g'), value);
      });

      const logs = [
        `MCP Browser task with local browser: ${task.name}`,
        `Website: ${task.website}`,
        'MCP local browser execution started...',
        'A browser window should open on your computer',
      ];

      // Use MCP server to execute task with local browser
      const result = await this.executeViaMCPLocal(task.website, instructions);

      logs.push('MCP local browser execution completed');
      logs.push(`Output: ${result.output || 'No output provided'}`);

      return {
        success: result.success,
        plan: { steps: [], estimatedDuration: 0 },
        screenshots: result.screenshots || [],
        logs: [...logs, ...(result.logs || [])],
        error: result.error,
      };

    } catch (error) {
      console.error('MCP Browser local execution error:', error);
      return {
        success: false,
        plan: { steps: [], estimatedDuration: 0 },
        error: `MCP Browser local execution failed: ${error}`,
        logs: [`MCP Browser local error: ${error}`],
      };
    }
  }

  private async executeViaMCP(website: string, instructions: string, onUpdate?: (update: any) => void): Promise<any> {
    // For now, simulate MCP execution with realistic browser automation steps
    console.log('Simulating MCP Browser Use execution...');
    
    try {
      // Simulate streaming updates
      if (onUpdate) {
        onUpdate({
          type: 'start',
          message: 'Starting task execution...',
          timestamp: new Date().toISOString(),
          liveViewUrl: `https://cloud.browser-use.com/session/demo-${Date.now()}`, // Demo live view URL
          sessionUrl: `https://cloud.browser-use.com/session/demo-${Date.now()}` // Alternative live view URL
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        onUpdate({
          type: 'progress',
          message: `Navigating to ${website}...`,
          timestamp: new Date().toISOString()
        });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        onUpdate({
          type: 'progress',
          message: 'Loading page content...',
          timestamp: new Date().toISOString()
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        onUpdate({
          type: 'progress',
          message: 'Executing instructions...',
          timestamp: new Date().toISOString()
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if this should be a failure
        const shouldFail = Math.random() < 0.3; // 30% chance of failure
        
        if (shouldFail) {
          onUpdate({
            type: 'error',
            message: 'Task execution failed - 404 or other error occurred',
            timestamp: new Date().toISOString()
          });
        } else {
          onUpdate({
            type: 'complete',
            message: 'Task execution completed successfully!',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Simulate execution with potential failures
      const shouldFail = Math.random() < 0.3; // 30% chance of failure for demo purposes
      
      if (shouldFail) {
        return {
          success: false,
          output: `Failed to execute instructions on ${website}`,
          screenshots: [],
          logs: [
            `MCP Browser Use: Navigated to ${website}`,
            'MCP Browser Use: Page loaded successfully',
            'MCP Browser Use: Error occurred during execution',
            'MCP Browser Use: Task failed'
          ],
          error: 'Simulated execution failure - 404 or other error occurred'
        };
      } else {
        return {
          success: true,
          output: `Successfully executed instructions on ${website}`,
          screenshots: [],
          logs: [
            `MCP Browser Use: Navigated to ${website}`,
            'MCP Browser Use: Page loaded successfully',
            'MCP Browser Use: Instructions executed',
            'MCP Browser Use: Task completed'
          ]
        };
      }
    } catch (error) {
      throw new Error(`MCP execution failed: ${error}`);
    }
  }

  private async executeViaMCPWithSession(website: string, instructions: string): Promise<any> {
    // Simulate MCP session execution with realistic steps
    console.log('Simulating MCP Browser Use session execution...');
    
    try {
      // Simulate session-based execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate session execution with potential failures
      const shouldFail = Math.random() < 0.2; // 20% chance of failure for session mode
      
      if (shouldFail) {
        return {
          success: false,
          output: `Failed to execute instructions on ${website} with session management`,
          screenshots: [],
          logs: [
            `MCP Browser Use Session: Created session for ${website}`,
            'MCP Browser Use Session: Navigated to website',
            'MCP Browser Use Session: Error occurred during session execution',
            'MCP Browser Use Session: Session failed'
          ],
          error: 'Session execution failed - 404 or authentication error'
        };
      } else {
        return {
          success: true,
          output: `Successfully executed instructions on ${website} with session management`,
          screenshots: [],
          logs: [
            `MCP Browser Use Session: Created session for ${website}`,
            'MCP Browser Use Session: Navigated to website',
            'MCP Browser Use Session: Maintained login state',
            'MCP Browser Use Session: Executed instructions',
            'MCP Browser Use Session: Session completed successfully'
          ],
          liveViewUrl: `https://cloud.browser-use.com/session/session-${Date.now()}`,
          sessionUrl: `https://cloud.browser-use.com/session/session-${Date.now()}`
        };
      }
    } catch (error) {
      throw new Error(`MCP session execution failed: ${error}`);
    }
  }

  private async executeViaMCPLocal(website: string, instructions: string): Promise<any> {
    // Simulate MCP local browser execution
    console.log('Simulating MCP Browser Use local execution...');
    
    try {
      // Simulate local browser execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate local execution with potential failures
      const shouldFail = Math.random() < 0.25; // 25% chance of failure for local mode
      
      if (shouldFail) {
        return {
          success: false,
          output: `Failed to execute instructions on ${website} with local browser`,
          screenshots: [],
          logs: [
            `MCP Browser Use Local: Opening local browser window`,
            `MCP Browser Use Local: Navigated to ${website}`,
            'MCP Browser Use Local: Error occurred during local execution',
            'MCP Browser Use Local: Local execution failed'
          ],
          error: 'Local browser execution failed - 404 or browser error'
        };
      } else {
        return {
          success: true,
          output: `Successfully executed instructions on ${website} with local browser`,
          screenshots: [],
          logs: [
            `MCP Browser Use Local: Opening local browser window`,
            `MCP Browser Use Local: Navigated to ${website}`,
            'MCP Browser Use Local: Browser window visible on your computer',
            'MCP Browser Use Local: Executed instructions in local browser',
            'MCP Browser Use Local: Local execution completed successfully'
          ],
          liveViewUrl: `https://cloud.browser-use.com/session/local-${Date.now()}`,
          browserUrl: `https://cloud.browser-use.com/session/local-${Date.now()}`
        };
      }
    } catch (error) {
      throw new Error(`MCP local execution failed: ${error}`);
    }
  }

  async executePlan(plan: Plan): Promise<ExecutionResult> {
    // Fallback to mock execution for plan-based tasks
    console.log('MCP executing plan:', JSON.stringify(plan, null, 2));
    
    // Simulate execution time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      plan,
      screenshots: [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' // 1x1 transparent PNG
      ],
      logs: [
        'MCP: Navigated to website',
        'MCP: Executed automation steps',
        'MCP: Captured screenshot',
        'MCP: Task completed successfully'
      ]
    };
  }
}

export const mcpBrowserExecutor = new MCPBrowserExecutor();
