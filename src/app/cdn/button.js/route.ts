import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('task');

  if (!taskId) {
    return new NextResponse('Missing task parameter', { status: 400 });
  }

  const baseUrl = request.nextUrl.origin;
  const runnerUrl = `${baseUrl}/r/${taskId}`;

  const buttonScript = `
(function() {
  const taskId = '${taskId}';
  const runnerUrl = '${runnerUrl}';
  
  // Create button element
  const btn = document.createElement('button');
  btn.textContent = '▶ Run Task';
  btn.style.cssText = \`
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  \`;
  
  btn.onmouseover = function() {
    this.style.backgroundColor = '#2563eb';
  };
  
  btn.onmouseout = function() {
    this.style.backgroundColor = '#3b82f6';
  };
  
  btn.onclick = function() {
    window.open(runnerUrl, '_blank');
  };
  
  // Insert button after the script tag
  const script = document.currentScript;
  if (script && script.parentNode) {
    script.parentNode.insertBefore(btn, script.nextSibling);
  } else {
    document.body.appendChild(btn);
  }
})();
`;

  return new NextResponse(buttonScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
