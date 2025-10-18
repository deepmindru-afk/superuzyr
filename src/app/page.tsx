'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { ThemeToggle } from '@/lib/theme-context';

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter tasks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter(task => 
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.instructions.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.llm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.params && task.params.some(param => 
          param.name.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
      setFilteredTasks(filtered);
    }
  }, [tasks, searchQuery]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (response.ok) {
        // Only show published tasks
        const publishedTasks = data.tasks.filter((task: Task) => task.status === 'published');
        setTasks(publishedTasks);
        setFilteredTasks(publishedTasks);
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
    
    // Show a nice toast notification instead of alert
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 fade-in';
    toast.textContent = '✅ Embed code copied to clipboard!';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">Loading automation applets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SU</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    SuperUser
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Get things done by AI, not just ask</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <a
                href="/admin"
                className="btn-primary"
              >
                Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              It's time to
              <br />
              <span className="hero-text">Get things done by AI, not just ask</span>
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              The intelligent browser automation platform that actually executes tasks.
              <br />
              Pre-configured applets ready to use or embed in your website.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full border border-white border-opacity-30">
                <span className="text-white font-medium">🚀 One-click execution</span>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full border border-white border-opacity-30">
                <span className="text-white font-medium">🔗 Easy embedding</span>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full border border-white border-opacity-30">
                <span className="text-white font-medium">⚡ Real-time results</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#applets"
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
              >
                Explore Applets
              </a>
              <a
                href="/admin"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors duration-200"
              >
                Create Your Own
              </a>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
      </section>

      {/* Applets Grid */}
      <section id="applets" className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Available Automation Applets
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Choose from pre-configured browser automation tasks or create custom ones. 
              Each applet can be run directly or embedded in your website.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search applets by name, website, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Found {filteredTasks.length} applet{filteredTasks.length !== 1 ? 's' : ''} matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🤖</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">No Applets Available</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">Create your first automation applet in the admin dashboard.</p>
              <a
                href="/admin"
                className="btn-primary text-lg px-8 py-4"
              >
                Create Your First Applet
              </a>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">No Applets Found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No applets match your search "{searchQuery}". Try a different search term.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="btn-secondary"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className="glass-card card-hover p-6 fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AU</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{task.name}</h4>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{task.llm}</p>
                      </div>
                    </div>
                    <span className="status-success text-xs px-2 py-1 rounded-full font-medium">
                      Active
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <span className="mr-2">🌐</span>
                    <span className="truncate">{task.website}</span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {task.instructions}
                  </p>
                  
                  {task.params && task.params.length > 0 && (
                    <div className="mb-6">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Parameters:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {task.params.map(param => (
                          <span key={param.name} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                            {param.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <a
                      href={`/r/${task.id}`}
                      target="_blank"
                      className="flex-1 btn-primary text-center py-3 px-4 text-sm font-medium"
                    >
                      ▶ Run Applet
                    </a>
                    <button
                      onClick={() => copyEmbedCode(task.id)}
                      className="btn-secondary py-3 px-4 text-sm font-medium"
                    >
                      📋 Embed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              How It Works
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three simple steps to automate any website task
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center slide-in">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl text-white font-bold">1</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Choose Applet</h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Select from pre-configured automation tasks or create your own custom applet with specific instructions
              </p>
            </div>
            
            <div className="text-center slide-in" style={{ animationDelay: '200ms' }}>
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl text-white font-bold">2</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Run or Embed</h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Execute directly in your browser or embed the automation button on your website for users
              </p>
            </div>
            
            <div className="text-center slide-in" style={{ animationDelay: '400ms' }}>
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl text-white font-bold">3</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Get Results</h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Watch the automation execute in real-time with live updates and capture results with screenshots
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-slate-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SU</span>
                </div>
                <span className="text-xl font-bold">SuperUser</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Get things done by AI, not just ask. The intelligent browser automation platform that actually executes tasks.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Platform</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#applets" className="hover:text-white transition-colors">Applets</a></li>
                <li><a href="/admin" className="hover:text-white transition-colors">Admin Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Community</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 SuperUser. Engineered and designed worldwide. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}