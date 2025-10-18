'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    groq: '',
  });
  const [settings, setSettings] = useState({
    useRealAutomation: false,
    headless: true,
    browserUseUrl: '',
    browserUseCloudApiKey: '',
  });
  const [saveStatus, setSaveStatus] = useState('');

  // Load saved settings on component mount
  useEffect(() => {
    const savedApiKeys = localStorage.getItem('admin_api_keys');
    const savedSettings = localStorage.getItem('admin_settings');
    
    if (savedApiKeys) {
      try {
        setApiKeys(JSON.parse(savedApiKeys));
      } catch (e) {
        console.error('Error parsing saved API keys:', e);
      }
    }
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
  }, []);

  const handleSave = () => {
    try {
      // Save to localStorage (in production, this would be sent to a secure backend)
      localStorage.setItem('admin_api_keys', JSON.stringify(apiKeys));
      localStorage.setItem('admin_settings', JSON.stringify(settings));
      
      setSaveStatus('Settings saved successfully!');
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
      
      // Also update environment variables for the current session
      // Note: In a real app, these would be set on the server side
      console.log('Settings saved:', { apiKeys, settings });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('Error saving settings. Please try again.');
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">API Keys & Settings</h1>
          
          <div className="space-y-6">
            {/* API Keys Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">LLM API Keys</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OpenAI API Key (for GPT-4o Mini)
                  </label>
                  <input
                    type="password"
                    value={apiKeys.openai}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anthropic API Key (for Claude Haiku)
                  </label>
                  <input
                    type="password"
                    value={apiKeys.anthropic}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, anthropic: e.target.value }))}
                    placeholder="sk-ant-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Groq API Key (for Llama 3.1 8B)
                  </label>
                  <input
                    type="password"
                    value={apiKeys.groq}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, groq: e.target.value }))}
                    placeholder="gsk_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Browser Settings */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Browser Automation</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="useRealAutomation"
                    checked={settings.useRealAutomation}
                    onChange={(e) => setSettings(prev => ({ ...prev, useRealAutomation: e.target.checked }))}
                    className="mr-3"
                  />
                  <label htmlFor="useRealAutomation" className="text-sm font-medium text-gray-700">
                    Enable Real Browser Automation
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Browser Use Cloud API Key (Recommended)
                  </label>
                  <input
                    type="password"
                    value={settings.browserUseCloudApiKey || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, browserUseCloudApiKey: e.target.value }))}
                    placeholder="bu_oqHnm--Lp5brK0VLZflpq09M9nU33PLR1nbtA8Lp1gM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from <a href="https://cloud.browser-use.com/dashboard/onboarding" target="_blank" className="text-blue-600 hover:underline">Browser Use Cloud</a>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Browser-Use MCP Server URL (Alternative)
                  </label>
                  <input
                    type="url"
                    value={settings.browserUseUrl || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, browserUseUrl: e.target.value }))}
                    placeholder="http://localhost:8080/sessions or your MCP server endpoint"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alternative to Browser Use Cloud - leave empty if using Cloud API key above
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="headless"
                    checked={settings.headless}
                    onChange={(e) => setSettings(prev => ({ ...prev, headless: e.target.checked }))}
                    className="mr-3"
                  />
                  <label htmlFor="headless" className="text-sm font-medium text-gray-700">
                    Run browser in headless mode
                  </label>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Current Status</h3>
              <div className="text-sm text-blue-700">
                <p>• <strong>LLM Planning:</strong> {apiKeys.openai || apiKeys.anthropic || apiKeys.groq ? 'Real APIs' : 'Mock mode'}</p>
                <p>• <strong>Browser Automation:</strong> {settings.useRealAutomation ? 'Real browser-use' : 'Mock mode'}</p>
                <p>• <strong>Mode:</strong> {settings.useRealAutomation && (apiKeys.openai || apiKeys.anthropic || apiKeys.groq) ? 'Full automation' : 'Development mode'}</p>
              </div>
            </div>

            {/* Save Status */}
            {saveStatus && (
              <div className={`p-3 rounded-md ${
                saveStatus.includes('Error') 
                  ? 'bg-red-50 border border-red-200 text-red-700' 
                  : 'bg-green-50 border border-green-200 text-green-700'
              }`}>
                {saveStatus}
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save Settings
              </button>
              <a
                href="/admin"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Back to Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
