'use client';

import { useState, useEffect, use } from 'react';
import { Task, RunTaskResponse } from '@/lib/types';
import { ThemeToggle } from '@/lib/theme-context';

interface RunnerPageProps {
  params: Promise<{ id: string }>;
}

export default function RunnerPage({ params }: RunnerPageProps) {
  const { id } = use(params);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<RunTaskResponse | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [enableLiveView, setEnableLiveView] = useState(false);
  const [executionMode, setExecutionMode] = useState<'cloud' | 'local' | 'streaming'>('cloud');
  const [streamingUpdates, setStreamingUpdates] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveViewUrl, setLiveViewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setTask(data.task);
        // Initialize param values with defaults
        const initialParams: Record<string, string> = {};
        data.task.params?.forEach((param: any) => {
          if (param.value) {
            initialParams[param.name] = param.value;
          }
        });
        setParamValues(initialParams);
      } else {
        setError(data.error || 'Failed to fetch task');
      }
    } catch (err) {
      setError('Failed to fetch task');
    } finally {
      setLoading(false);
    }
  };

  const runTask = async () => {
    if (executionMode === 'streaming') {
      runTaskWithStreaming();
      return;
    }
    
    setExecuting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${id}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'enable-live-view': enableLiveView.toString(),
          'execution-mode': executionMode,
        },
        body: JSON.stringify({ paramValues }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        // Also check if the result indicates failure
        if (data.result && !data.result.success) {
          setError(data.result.error || 'Task execution failed');
        }
        
        // Check for live view URL in the result
        if (data.result && (data.result.liveViewUrl || data.result.sessionUrl || data.result.browserUrl)) {
          setLiveViewUrl(data.result.liveViewUrl || data.result.sessionUrl || data.result.browserUrl);
        }
      } else {
        setError(data.error || 'Failed to run task');
      }
    } catch (err) {
      setError('Failed to run task');
    } finally {
      setExecuting(false);
    }
  };

  const runTaskWithStreaming = async () => {
    setIsStreaming(true);
    setStreamingUpdates([]);
    setResult(null);
    setError(null);
    setLiveViewUrl(null);

    const allUpdates: any[] = [];

    try {
      const response = await fetch(`/api/tasks/${id}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paramValues, executionMode }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('Streaming data received:', data); // Debug log
              allUpdates.push(data);
              setStreamingUpdates([...allUpdates]);
              
              // Check for live view URL in streaming data
              if (data.liveViewUrl || data.viewUrl || data.sessionUrl || data.browserUrl) {
                setLiveViewUrl(data.liveViewUrl || data.viewUrl || data.sessionUrl || data.browserUrl);
              }
              
              if (data.type === 'complete') {
                // Safely check if result exists and has success property
                const success = data.result?.success ?? true; // Default to true if undefined
                const error = data.result?.error ?? null;
                
                console.log('Completion data:', { success, error, result: data.result }); // Debug log
                
                // Create result object with proper structure
                const executionResult = {
                  executionId: `exec_${Date.now()}`,
                  plan: { steps: [], estimatedDuration: 0 },
                  status: success ? 'completed' : 'failed',
                  result: {
                    success: success,
                    plan: { steps: [], estimatedDuration: 0 },
                    screenshots: [],
                    logs: allUpdates.map(u => u.message).filter(Boolean),
                    error: error
                  }
                };
                
                console.log('Setting execution result:', executionResult); // Debug log
                setResult(executionResult);
              } else if (data.type === 'error') {
                console.log('Error received:', data); // Debug log
                setError(data.error || data.message);
                
                // Set result as failed when error occurs
                setResult({
                  executionId: `exec_${Date.now()}`,
                  plan: { steps: [], estimatedDuration: 0 },
                  status: 'failed',
                  result: {
                    success: false,
                    plan: { steps: [], estimatedDuration: 0 },
                    screenshots: [],
                    logs: allUpdates.map(u => u.message).filter(Boolean),
                    error: data.error || data.message
                  }
                });
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, 'Raw line:', line);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsStreaming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">Loading automation task...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 dark:text-red-400 text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <a href="/" className="btn-primary">
            ← Back to Applets
          </a>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-yellow-600 dark:text-yellow-400 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Task Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The requested automation task could not be found.</p>
          <a href="/" className="btn-primary">
            ← Back to Applets
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.name}</h1>
          <div className="flex items-center text-sm text-gray-600 space-x-4">
            <span>🌐 {task.website}</span>
            <span>🤖 {task.llm}</span>
            <span>📅 {new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{task.instructions}</p>
        </div>

        {/* Parameters */}
        {task.params && task.params.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Parameters</h2>
            <div className="space-y-4">
              {task.params.map((param) => (
                <div key={param.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {param.name}
                    {param.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    value={paramValues[param.name] || ''}
                    onChange={(e) => setParamValues(prev => ({
                      ...prev,
                      [param.name]: e.target.value
                    }))}
                    placeholder={param.value || `Enter ${param.name}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execution Options */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Execution Options</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Execution Mode
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="cloud"
                    checked={executionMode === 'cloud'}
                    onChange={(e) => setExecutionMode(e.target.value as 'cloud' | 'local' | 'streaming')}
                    className="mr-2"
                  />
                  🤖 AI Agent (MCP Browser Use)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="local"
                    checked={executionMode === 'local'}
                    onChange={(e) => setExecutionMode(e.target.value as 'cloud' | 'local' | 'streaming')}
                    className="mr-2"
                  />
                  🖥️ Local Browser (Your Computer)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="streaming"
                    checked={executionMode === 'streaming'}
                    onChange={(e) => setExecutionMode(e.target.value as 'cloud' | 'local' | 'streaming')}
                    className="mr-2"
                  />
                  🚀 Real-time Streaming (Watch agent actions live!)
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {executionMode === 'cloud' 
                  ? 'AI Agent execution via MCP Browser Use with session management'
                  : executionMode === 'local'
                  ? 'Opens a browser window on your computer via MCP (recommended for logged-in sites)'
                  : 'Real-time streaming updates showing exactly what the browser agent is doing step-by-step via MCP'
                }
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="liveView"
                checked={enableLiveView}
                onChange={(e) => setEnableLiveView(e.target.checked)}
                className="mr-3"
              />
              <label htmlFor="liveView" className="text-sm font-medium text-gray-700">
                Enable Live View (Real-time task monitoring for all modes)
              </label>
            </div>
          </div>
        </div>

        {/* Run Button */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={runTask}
            disabled={executing || isStreaming}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {(executing || isStreaming) ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isStreaming ? 'Streaming Task...' : 'Running Task...'}
              </div>
            ) : (
              `▶ Run Task (${executionMode === 'cloud' ? 'AI Agent' : executionMode === 'local' ? 'Local' : 'Streaming'}${enableLiveView ? ' + Live View' : ''})`
            )}
          </button>
        </div>

        {/* Live Updates - Show for all execution modes when enabled */}
        {(isStreaming || (enableLiveView && (executing || result))) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              🚀 Live Updates
              <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {isStreaming ? 'Streaming' : 'Live View'}
              </span>
            </h2>
            
            {/* Live View and Logs Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live View */}
              {(liveViewUrl || enableLiveView) && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-2">
                    📺 Live Browser View
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    {liveViewUrl ? (
                      <iframe
                        src={liveViewUrl}
                        className="w-full h-96 border-0"
                        title="Live Browser View"
                        allow="camera; microphone; geolocation"
                      />
                    ) : (
                      <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p>Waiting for live view URL...</p>
                          <p className="text-xs mt-1">Live view will appear here when available</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Real-time view of the browser automation
                  </p>
                </div>
              )}
              
              {/* Execution Logs */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">
                  📋 Execution Logs
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {streamingUpdates.length > 0 ? (
                    streamingUpdates.map((update, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        update.type === 'error' 
                          ? 'bg-red-50 border-red-400' 
                          : update.type === 'complete'
                          ? 'bg-green-50 border-green-400'
                          : 'bg-blue-50 border-blue-400'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {update.type === 'error' ? '❌' : update.type === 'complete' ? '✅' : '🔄'}
                              </span>
                              <span className="text-sm font-medium text-gray-700">
                                {update.action || update.type}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(update.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{update.message}</p>
                            {update.screenshot && (
                              <div className="mt-2">
                                <img
                                  src={update.screenshot}
                                  alt="Live screenshot"
                                  className="max-w-xs rounded border"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p>Waiting for execution logs...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Execution Result
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                result.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {result.status}
              </span>
            </h2>
            
            {result.result?.success ? (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Plan Executed:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mb-4">
                  {JSON.stringify(result.plan, null, 2)}
                </pre>
                
                <h3 className="font-medium text-gray-900 mb-2">Logs:</h3>
                <div className="bg-gray-100 p-3 rounded text-sm mb-4">
                  {result.result.logs.map((log, i) => (
                    <div key={i} className="mb-1">{log}</div>
                  ))}
                </div>
                
                {result.result.screenshots && result.result.screenshots.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Screenshots:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.result.screenshots.map((screenshot, i) => (
                        <img
                          key={i}
                          src={screenshot}
                          alt={`Screenshot ${i + 1}`}
                          className="border rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-red-600 text-xl mr-2">❌</span>
                  <h3 className="font-medium text-red-800">Execution Failed</h3>
                </div>
                <p className="text-red-700 mb-3">{result.result?.error || 'Unknown error occurred'}</p>
                
                {result.result?.logs && result.result.logs.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Error Logs:</h4>
                    <div className="bg-red-100 p-3 rounded text-sm">
                      {result.result.logs.map((log, i) => (
                        <div key={i} className="mb-1 text-red-700">{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
