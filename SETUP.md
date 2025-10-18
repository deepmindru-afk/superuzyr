# SuperUser Stage-1 Setup Guide

## Browser-Use Integration Status

✅ **Currently**: Mock implementation (for development)  
🔄 **Ready for**: Real browser-use integration with your MCP server

## API Keys Configuration

### 1. Create Environment File

Create `.env.local` in the project root:

```bash
# LLM API Keys
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
GROQ_API_KEY=gsk_your-groq-key-here

# Browser Automation Settings
USE_REAL_BROWSER_AUTOMATION=true
BROWSER_HEADLESS=true

# Optional: Remote Browser-use Service
BROWSER_USE_SESSION_URL=https://your-browser-use-service.com/sessions
```

### 2. Get API Keys

#### OpenAI (for GPT-4o Mini)
- Visit: https://platform.openai.com/api-keys
- Create new secret key
- Add to `OPENAI_API_KEY`

#### Anthropic (for Claude Haiku)
- Visit: https://console.anthropic.com/
- Create API key
- Add to `ANTHROPIC_API_KEY`

#### Groq (for Llama 3.1 8B)
- Visit: https://console.groq.com/keys
- Create API key
- Add to `GROQ_API_KEY`

## Browser-Use Integration

### Current Implementation
- ✅ Python script ready: `scripts/browser_executor.py`
- ✅ Node.js wrapper ready: `src/lib/browser-executor.ts`
- ✅ Configuration system ready: `src/lib/config.ts`

### To Enable Real Browser Automation:

1. **Install browser-use Python package:**
   ```bash
   pip install browser-use
   ```

2. **Set environment variable:**
   ```bash
   export USE_REAL_BROWSER_AUTOMATION=true
   ```

3. **Or update `.env.local`:**
   ```
   USE_REAL_BROWSER_AUTOMATION=true
   ```

### Browser-Use MCP Server Integration

Since you have the browser-use MCP server connected, you can:

1. **Option A: Use MCP Server directly**
   - Update `BROWSER_USE_SESSION_URL` in `.env.local`
   - The system will call your MCP server instead of local Python script

2. **Option B: Use local Python script**
   - Install browser-use: `pip install browser-use`
   - Set `USE_REAL_BROWSER_AUTOMATION=true`

## Testing the Integration

### 1. Test with Mock (Current)
```bash
curl -X POST http://localhost:3001/api/tasks/tsk_daytona_coupon/run \
  -H "Content-Type: application/json" \
  -d '{"paramValues":{"coupon":"TEST123"}}'
```

### 2. Test with Real LLM + Mock Browser
Set API keys in `.env.local` but keep `USE_REAL_BROWSER_AUTOMATION=false`

### 3. Test with Real LLM + Real Browser
Set API keys AND `USE_REAL_BROWSER_AUTOMATION=true`

## File Structure

```
src/
├── lib/
│   ├── config.ts          # API key configuration
│   ├── planner.ts         # LLM integration (OpenAI, Anthropic, Groq)
│   └── browser-executor.ts # Browser-use integration
scripts/
└── browser_executor.py    # Python browser-use script
```

## Current Features

✅ **Working Now:**
- Mock LLM planning (generates realistic plans)
- Mock browser automation (simulates execution)
- All UI components and API endpoints
- 5 pre-configured applets

🔄 **Ready to Enable:**
- Real LLM planning with your API keys
- Real browser automation with browser-use
- MCP server integration

## Next Steps

1. **Add your API keys** to `.env.local`
2. **Set `USE_REAL_BROWSER_AUTOMATION=true`**
3. **Test with a simple task** first
4. **Integrate with your MCP server** if preferred

The system is designed to gracefully fall back to mocks if APIs fail, so you can test incrementally!
