import { Task } from './types';

export const seedTasks: Task[] = [
  {
    id: 'tsk_daytona_coupon',
    name: 'Daytona — Redeem Coupon',
    website: 'https://app.daytona.io',
    llm: 'gpt-4o-mini',
    instructions: `Navigate to https://app.daytona.io and redeem the coupon code.

    Please:
    1. Go to the Daytona app website
    2. Navigate to the Billing Dashboard or Account settings
    3. Look for a coupon code input field or "Redeem Code" section
    4. Enter the coupon code: {{coupon}}
    5. Click the "Redeem" or "Apply" button
    6. Verify that the coupon was successfully applied
    7. Take a screenshot of the confirmation
    8. Report the discount amount or benefits received`,
    params: [
      {
        name: 'coupon',
        value: 'DAYTONA_EVENT_9AWONPO8',
        required: true
      }
    ],
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tsk_browser_use_coupon',
    name: 'Browser Use Cloud — Apply HACKSPRINT',
    website: 'https://cloud.browser-use.com',
    llm: 'gpt-4o-mini',
    instructions: `Navigate to https://cloud.browser-use.com and apply the coupon code for a subscription.

    Please:
    1. Go to the Browser Use Cloud website
    2. Navigate to the billing or subscription section
    3. Select the "Professional Monthly" plan
    4. Look for a coupon code input field
    5. Enter the coupon code: {{coupon}}
    6. Apply the coupon and verify the discount is shown
    7. Take a screenshot of the discounted price
    8. Report the discount amount or percentage saved`,
    params: [
      {
        name: 'coupon',
        value: 'HACKSPRINT',
        required: true
      }
    ],
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tsk_workos_signup',
    name: 'WorkOS — Signup → Quickstart',
    website: 'https://signin.workos.com',
    llm: 'claude-haiku',
    instructions: 'Open signup. If OTP required, stop before submit. Then open AuthKit quickstart page and capture.',
    params: [],
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tsk_anthropic_form',
    name: 'Anthropic — Credits Form Prefill',
    website: 'https://docs.google.com/forms/',
    llm: 'gpt-4o-mini',
    instructions: 'Open the Anthropic credit form, prefill name {{name}} and email {{email}}, do not submit, capture.',
    params: [
      {
        name: 'name',
        value: 'Demo User',
        required: false
      },
      {
        name: 'email',
        value: 'demo@superuser.ai',
        required: false
      }
    ],
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tsk_google_search',
    name: 'Google Search Test',
    website: 'https://www.google.com',
    llm: 'gpt-4o-mini',
    instructions: 'Search for {{query}}, capture results page.',
    params: [
      {
        name: 'query',
        value: 'browser automation',
        required: true
      }
    ],
    status: 'published',
    createdAt: new Date().toISOString(),
  }
];
