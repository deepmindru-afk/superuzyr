'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (response.ok) {
        // Only show published tasks
        const publishedTasks = data.tasks.filter((task: Task) => task.status === 'published');
        setTasks(publishedTasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyEmbedCode = (taskId: string) => {
    const baseUrl = window.location.origin;
    const embedCode = `<script src="${baseUrl}/cdn/button.js?task=${taskId}"></script>`;
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading applets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SuperUser</h1>
              <p className="text-gray-600">Browser Automation Applets</p>
            </div>
            <div className="flex space-x-4">
              <a
                href="/admin"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Automate Any Website Task</h2>
          <p className="text-xl mb-8 text-blue-100">
            Pre-configured browser automation applets ready to use. 
            Just run or embed in your website.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <span className="text-sm">🚀 One-click execution</span>
            </div>
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <span className="text-sm">🔗 Easy embedding</span>
            </div>
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <span className="text-sm">⚡ Real-time results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Applets Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Available Applets</h3>
            <p className="text-gray-600">Click any applet to run it, or copy the embed code for your website</p>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applets Available</h3>
              <p className="text-gray-600">Create your first automation applet in the admin dashboard.</p>
              <a
                href="/admin"
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Create Applet
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{task.name}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {task.llm}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="mr-2">🌐</span>
                      <span className="truncate">{task.website}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {task.instructions}
                    </p>
                    
                    {task.params && task.params.length > 0 && (
                      <div className="mb-4">
                        <span className="text-xs text-gray-500">Parameters:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.params.map(param => (
                            <span key={param.name} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {param.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <a
                        href={`/r/${task.id}`}
                        target="_blank"
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 text-sm font-medium"
                      >
                        ▶ Run
                      </a>
                      <button
                        onClick={() => copyEmbedCode(task.id)}
                        className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 text-sm font-medium"
                      >
                        📋 Embed
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Choose Applet</h4>
              <p className="text-gray-600">Select from pre-configured automation tasks or create your own</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Run or Embed</h4>
              <p className="text-gray-600">Execute directly in browser or embed the button on your website</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Get Results</h4>
              <p className="text-gray-600">Watch the automation execute and capture results in real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">SuperUser Stage-1 - Browser Automation Made Simple</p>
        </div>
      </footer>
    </div>
  );
}