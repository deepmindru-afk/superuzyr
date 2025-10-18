# Browser-Use Integration Guide

## How Browser-Use Works (No Traditional API Key Needed!)

Browser-use doesn't use a traditional API key like OpenAI or Anthropic. Instead, it works in two ways:

## Option 1: Use Your MCP Server (Recommended)

Since you have the browser-use MCP server connected, you can integrate it directly:

### In the Settings Page:
1. Go to **http://localhost:3001/admin/settings**
2. Check "Enable Real Browser Automation"
3. Enter your MCP server URL in "Browser-Use MCP Server URL" field:
   - Example: `http://localhost:8080/sessions`
   - Or: `https://your-mcp-server.com/api/sessions`

### How it works:
- The system will call your MCP server with the automation plan
- Your MCP server handles the actual browser automation
- No API key needed - just the server endpoint

## Option 2: Local Browser-Use Installation

If you want to run browser-use locally instead of using your MCP server:

### Install browser-use:
```bash
pip install browser-use
```

### In Settings:
1. Check "Enable Real Browser Automation"
2. Leave "Browser-Use MCP Server URL" **empty**
3. The system will use the local Python script (`scripts/browser_executor.py`)

## Option 3: Environment Variables (Advanced)

You can also configure via `.env.local` file:

```bash
# Enable real browser automation
USE_REAL_BROWSER_AUTOMATION=true

# Use your MCP server (if you have one)
BROWSER_USE_SESSION_URL=http://localhost:8080/sessions

# Or leave BROWSER_USE_SESSION_URL empty to use local installation
```

## What Happens When You Enable It:

1. **LLM Planning**: Uses your API keys (OpenAI/Anthropic/Groq) to generate automation plans
2. **Browser Execution**: 
   - If MCP URL provided → calls your MCP server
   - If no MCP URL → uses local browser-use installation
   - If neither available → falls back to mock mode

## Testing:

1. **Mock Mode** (current): Everything simulated
2. **Real LLM + Mock Browser**: Add LLM API keys, keep browser automation off
3. **Full Automation**: Add LLM API keys + enable browser automation + MCP URL

## Current Status Check:

The settings page shows your current status:
- **LLM Planning**: Mock mode (until you add API keys)
- **Browser Automation**: Real browser-use (when enabled)
- **Mode**: Development mode (until both are configured)

## No API Key Required!

Browser-use integration is about **endpoints and configurations**, not API keys. Your MCP server handles the authentication and browser automation internally.
