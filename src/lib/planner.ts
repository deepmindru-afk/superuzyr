import { Task, Plan, PlanStep } from './types';

const PLANNING_PROMPT = `You are a browser automation planner. Given a task, generate a deterministic JSON plan.

Task Details:
- Website: {website}
- Instructions: {instructions}
- Parameters: {params}

Generate a plan with these step types:
1. navigate: {type: "navigate", value: "https://..."}
2. click: {type: "click", selector: "button#submit"}
3. type: {type: "type", selector: "input[name='email']", value: "text"}
4. wait: {type: "wait", timeout: 2000}
5. assertText: {type: "assertText", selector: ".message", text: "Success"}
6. capture: {type: "capture"}

Return ONLY valid JSON:
{
  "steps": [...],
  "estimatedDuration": 15
}`;

export function buildPlanningPrompt(task: Task, paramValues: Record<string, string> = {}): string {
  // Replace parameter placeholders in instructions
  let instructions = task.instructions;
  task.params?.forEach(param => {
    const value = paramValues[param.name] || param.value || '';
    instructions = instructions.replace(new RegExp(`\\{\\{${param.name}\\}\\}`, 'g'), value);
  });

  return PLANNING_PROMPT
    .replace('{website}', task.website)
    .replace('{instructions}', instructions)
    .replace('{params}', JSON.stringify(task.params || []));
}

export function generateMockPlan(task: Task, paramValues: Record<string, string> = {}): Plan {
  // Generate a mock plan based on the task
  const steps: PlanStep[] = [
    {
      type: 'navigate',
      value: task.website
    },
    {
      type: 'wait',
      timeout: 2000
    }
  ];

  // Add steps based on instructions
  if (task.instructions.toLowerCase().includes('click')) {
    steps.push({
      type: 'click',
      selector: 'button'
    });
  }

  if (task.instructions.toLowerCase().includes('type') || task.instructions.toLowerCase().includes('paste')) {
    steps.push({
      type: 'type',
      selector: 'input',
      value: 'sample text'
    });
  }

  if (task.instructions.toLowerCase().includes('capture')) {
    steps.push({
      type: 'capture'
    });
  }

  return {
    steps,
    estimatedDuration: Math.max(5, steps.length * 3)
  };
}

export async function generatePlan(task: Task, paramValues: Record<string, string> = {}): Promise<Plan> {
  const prompt = buildPlanningPrompt(task, paramValues);
  console.log('Planning prompt:', prompt);
  
  // Check if we should use real LLM or mock
  const { shouldUseRealAutomation, getApiKey } = await import('./config');
  const apiKey = getApiKey(task.llm);
  
  if (!apiKey || !shouldUseRealAutomation()) {
    console.log('Using mock plan generation');
    return generateMockPlan(task, paramValues);
  }
  
  try {
    // Call real LLM API
    const plan = await callLlmApi(task.llm, prompt, apiKey);
    return plan;
  } catch (error) {
    console.error('LLM API call failed, falling back to mock:', error);
    return generateMockPlan(task, paramValues);
  }
}

async function callLlmApi(llm: string, prompt: string, apiKey: string): Promise<Plan> {
  switch (llm) {
    case 'gpt-4o-mini':
      return await callOpenAI(prompt, apiKey);
    case 'claude-haiku':
      return await callAnthropic(prompt, apiKey);
    case 'llama-3.1-8b':
      return await callGroq(prompt, apiKey);
    default:
      throw new Error(`Unsupported LLM: ${llm}`);
  }
}

async function callOpenAI(prompt: string, apiKey: string): Promise<Plan> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a browser automation planner. Return only valid JSON with the plan structure.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse OpenAI response: ${content}`);
  }
}

async function callAnthropic(prompt: string, apiKey: string): Promise<Plan> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are a browser automation planner. Return only valid JSON with the plan structure.\n\n${prompt}`
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0].text;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse Anthropic response: ${content}`);
  }
}

async function callGroq(prompt: string, apiKey: string): Promise<Plan> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a browser automation planner. Return only valid JSON with the plan structure.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse Groq response: ${content}`);
  }
}
