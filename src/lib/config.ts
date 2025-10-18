// Configuration for API keys and browser automation settings

export const config = {
  // LLM API Keys
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
  },
  
  // Browser automation settings
  browser: {
    useRealAutomation: process.env.USE_REAL_BROWSER_AUTOMATION === 'true',
    headless: process.env.BROWSER_HEADLESS !== 'false',
    sessionUrl: process.env.BROWSER_USE_SESSION_URL || '',
    browserUseCloudApiKey: process.env.BROWSER_USE_CLOUD_API_KEY || '',
    browserUseCloudUrl: 'https://cloud.browser-use.com/api/v1',
  },
  
  // Development settings
  development: {
    useMockData: process.env.NODE_ENV === 'development' && !process.env.USE_REAL_BROWSER_AUTOMATION,
  }
};

// Helper function to get API key for a specific LLM
export function getApiKey(llm: string): string {
  switch (llm) {
    case 'gpt-4o-mini':
      return config.openai.apiKey;
    case 'claude-haiku':
      return config.anthropic.apiKey;
    case 'llama-3.1-8b':
      return config.groq.apiKey;
    default:
      return '';
  }
}

// Helper function to check if we should use real automation
export function shouldUseRealAutomation(): boolean {
  return config.browser.useRealAutomation || (!config.development.useMockData);
}
