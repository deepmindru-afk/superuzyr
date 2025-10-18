'use client';

import { useState, useEffect } from 'react';
import { Task, CreateTaskRequest, LlmChoice } from '@/lib/types';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState<CreateTaskRequest>({
    name: '',
    website: '',
    llm: 'gpt-4o-mini',
    instructions: '',
    params: [],
    status: 'draft'
  });

  useEffect(() => {
    // Check if already authenticated
    const authStatus = localStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Q!w2e3r4t5y6') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      setAuthError('');
      fetchTasks();
    } else {
      setAuthError('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    setPassword('');
    setAuthError('');
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (response.ok) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTasks();
        resetForm();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to save task');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      website: task.website,
      llm: task.llm,
      instructions: task.instructions,
      params: task.params || [],
      status: task.status
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTasks();
      } else {
        alert('Failed to delete task');
      }
    } catch (error) {
      alert('Failed to delete task');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      website: '',
      llm: 'gpt-4o-mini',
      instructions: '',
      params: [],
      status: 'draft'
    });
    setShowCreateForm(false);
    setEditingTask(null);
  };

  const addParam = () => {
    setFormData(prev => ({
      ...prev,
      params: [...(prev.params || []), { name: '', value: '', required: false }]
    }));
  };

  const updateParam = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      params: prev.params?.map((param, i) => 
        i === index ? { ...param, [field]: value } : param
      )
    }));
  };

  const removeParam = (index: number) => {
    setFormData(prev => ({
      ...prev,
      params: prev.params?.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
            <p className="text-gray-600">Enter password to access the admin panel</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            {authError && (
              <div className="text-red-600 text-sm">{authError}</div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Access Admin Panel
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to Marketplace
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <div className="flex space-x-3">
            <a
              href="/"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            >
              ← Back to Marketplace
            </a>
            <a
              href="/admin/settings"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              API Keys & Settings
            </a>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Task
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Tasks ({tasks.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{task.name}</h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>🌐 {task.website}</span>
                      <span>🤖 {task.llm}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600 text-sm">{task.instructions}</p>
                    {task.params && task.params.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Parameters: </span>
                        {task.params.map(param => (
                          <span key={param.name} className="text-xs bg-gray-100 px-2 py-1 rounded mr-1">
                            {param.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                    <a
                      href={`/r/${task.id}`}
                      target="_blank"
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Run
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website *
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LLM *
                    </label>
                    <select
                      value={formData.llm}
                      onChange={(e) => setFormData(prev => ({ ...prev, llm: e.target.value as LlmChoice }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                      <option value="claude-haiku">Claude Haiku</option>
                      <option value="llama-3.1-8b">Llama 3.1 8B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions *
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  {/* Parameters */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Parameters
                      </label>
                      <button
                        type="button"
                        onClick={addParam}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Parameter
                      </button>
                    </div>
                    {formData.params?.map((param, index) => (
                      <div key={index} className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          placeholder="Parameter name"
                          value={param.name}
                          onChange={(e) => updateParam(index, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Default value"
                          value={param.value || ''}
                          onChange={(e) => updateParam(index, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={param.required || false}
                            onChange={(e) => updateParam(index, 'required', e.target.checked)}
                            className="mr-1"
                          />
                          Required
                        </label>
                        <button
                          type="button"
                          onClick={() => removeParam(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
