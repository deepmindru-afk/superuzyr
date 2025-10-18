#!/usr/bin/env python3
"""
Browser Use Local Execution Script
This script uses the browser-use library to execute tasks locally
Based on the Browser Use form filling example
"""

import asyncio
import os
import sys
import json
import time
from browser_use import Agent, ChatBrowserUse

async def main():
    try:
        # Get task details from environment
        website = os.environ.get('BROWSER_TASK_WEBSITE', 'https://www.google.com')
        instructions = os.environ.get('BROWSER_TASK_INSTRUCTIONS', 'Search for something')
        
        # Initialize the model (same as the example)
        llm = ChatBrowserUse()
        
        # Create a comprehensive task that includes navigation and actions
        task = f"""
        Go to {website} and {instructions}
        
        Please:
        1. Navigate to the website
        2. Execute the instructions step by step
        3. Take screenshots at key moments
        4. Provide detailed feedback on what you're doing
        5. Report any errors or issues you encounter
        """
        
        print(json.dumps({
            "type": "start",
            "message": "Starting local browser automation...",
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
            "task": task,
            "website": website
        }))
        
        # Create and run the agent (same as the example)
        agent = Agent(task=task, llm=llm)
        
        print(json.dumps({
            "type": "progress",
            "message": "Browser agent initialized, starting execution...",
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%S.000Z')
        }))
        
        # Run the agent and capture the result
        result = await agent.run()
        
        print(json.dumps({
            "type": "progress",
            "message": "Task execution completed, processing results...",
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%S.000Z')
        }))
        
        # Extract useful information from the result
        result_output = str(result) if result else "No result returned"
        
        print(json.dumps({
            "type": "complete",
            "message": "Local browser automation completed successfully",
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
            "result": {
                "success": True,
                "output": result_output,
                "screenshots": [],
                "logs": [
                    "Local browser automation started",
                    f"Navigated to {website}",
                    "Executed instructions",
                    "Local browser automation completed successfully"
                ]
            }
        }))
        
    except Exception as e:
        error_msg = str(e)
        print(json.dumps({
            "type": "error",
            "message": f"Local browser automation failed: {error_msg}",
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
            "error": error_msg,
            "result": {
                "success": False,
                "output": f"Error: {error_msg}",
                "screenshots": [],
                "logs": [f"Error: {error_msg}"]
            }
        }))
        # Don't exit with error code, let the Node.js handle it
        sys.exit(0)

if __name__ == '__main__':
    asyncio.run(main())
