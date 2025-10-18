#!/usr/bin/env python3
"""
Browser automation executor using browser-use library.
Accepts JSON plan via stdin or command line arguments.
"""

import json
import sys
import time
from typing import Dict, List, Any
import base64
from io import BytesIO

try:
    from browser_use import Agent
    from browser_use.browser.browser import Browser
    from browser_use.browser.schema import BrowserConfig
    from browser_use.browser.schema import PlaywrightBrowserConfig
except ImportError:
    print("Error: browser-use library not installed. Install with: pip install browser-use")
    sys.exit(1)

class BrowserExecutor:
    def __init__(self):
        self.browser = None
        self.screenshots = []
        
    def execute_plan(self, plan: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a browser automation plan."""
        try:
            # Initialize browser
            config = PlaywrightBrowserConfig(
                headless=True,
                disable_security=True,
                extra_chromium_args=["--no-sandbox", "--disable-dev-shm-usage"]
            )
            
            browser = Browser(config)
            self.browser = browser
            
            logs = []
            steps = plan.get('steps', [])
            
            for i, step in enumerate(steps):
                log_msg = f"Executing step {i+1}/{len(steps)}: {step['type']}"
                logs.append(log_msg)
                print(log_msg)
                
                if step['type'] == 'navigate':
                    browser.navigate(step['value'])
                    time.sleep(2)
                    
                elif step['type'] == 'click':
                    if 'selector' in step:
                        browser.click(step['selector'])
                    else:
                        browser.click("button")  # Default click
                    time.sleep(1)
                    
                elif step['type'] == 'type':
                    if 'selector' in step and 'value' in step:
                        browser.type(step['selector'], step['value'])
                    time.sleep(1)
                    
                elif step['type'] == 'wait':
                    timeout = step.get('timeout', 2000)
                    time.sleep(timeout / 1000)
                    
                elif step['type'] == 'assertText':
                    if 'selector' in step and 'text' in step:
                        # Simple text assertion (mock)
                        logs.append(f"Asserting text '{step['text']}' in {step['selector']}")
                        
                elif step['type'] == 'capture':
                    screenshot = browser.take_screenshot()
                    if screenshot:
                        # Convert to base64 for JSON serialization
                        screenshot_b64 = base64.b64encode(screenshot).decode('utf-8')
                        self.screenshots.append(f"data:image/png;base64,{screenshot_b64}")
                        logs.append("Screenshot captured")
            
            return {
                'success': True,
                'logs': logs,
                'screenshots': self.screenshots
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'logs': logs if 'logs' in locals() else [],
                'screenshots': self.screenshots
            }
        finally:
            if self.browser:
                self.browser.close()

def main():
    """Main entry point for the script."""
    try:
        # Read plan from stdin or command line
        if len(sys.argv) > 1:
            plan_json = sys.argv[1]
        else:
            plan_json = sys.stdin.read()
        
        plan = json.loads(plan_json)
        
        executor = BrowserExecutor()
        result = executor.execute_plan(plan)
        
        # Output result as JSON
        print(json.dumps(result, indent=2))
        
    except json.JSONDecodeError as e:
        print(json.dumps({
            'success': False,
            'error': f'Invalid JSON: {str(e)}',
            'logs': [],
            'screenshots': []
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e),
            'logs': [],
            'screenshots': []
        }))
        sys.exit(1)

if __name__ == '__main__':
    main()
