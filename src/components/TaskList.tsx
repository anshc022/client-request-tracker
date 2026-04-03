'use client';

import { useState, useMemo, useEffect } from 'react';
import TaskCard from './TaskCard';
import { ClientRequest } from '@/app/actions';

const statusFilters = [
  { id: 'all', label: 'All', emoji: '📋' },
  { id: 'todo', label: 'To Do', emoji: '⏳' },
  { id: 'in-progress', label: 'In Progress', emoji: '⚙️' },
  { id: 'urgent', label: 'Urgent', emoji: '🚨' },
  { id: 'done', label: 'Done', emoji: '✅' },
];

export default function TaskList({ tasks }: { tasks: ClientRequest[] }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('grid');
  const [lastViewed, setLastViewed] = useState<Record<number, number>>({});
  const [sortBy, setSortBy] = useState<'recent' | 'priority' | 'category'>('recent');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ping_last_viewed');
      if (stored) setLastViewed(JSON.parse(stored));
    } catch {}
  }, []);

  const statusCounts = useMemo(() => ({
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'Pending' || t.status === 'To Do').length,
    'in-progress': tasks.filter(t => t.status === 'In Progress').length,
    urgent: tasks.filter(t => t.status === 'Urgent').length,
    done: tasks.filter(t => t.status === 'Done').length,
  }), [tasks]);

  const filtered = useMemo(() => {
    let data = [...tasks];
    if (statusFilter === 'todo') data = data.filter(t => t.status === 'Pending' || t.status === 'To Do');
    else if (statusFilter === 'in-progress') data = data.filter(t => t.status === 'In Progress');
    else if (statusFilter === 'urgent') data = data.filter(t => t.status === 'Urgent');
    else if (statusFilter === 'done') data = data.filter(t => t.status === 'Done');
    if (categoryFilter === 'Bugs') data = data.filter(t => t.category === 'Bug');
    if (categoryFilter === 'Features') data = data.filter(t => t.category === 'Feature');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(t =>
        t.content.toLowerCase().includes(q) ||
        `#${t.id}`.includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    
    // Enhanced sorting
    return data.sort((a, b) => {
      if (sortBy === 'priority') {
        const priority = { 'Urgent': 3, 'In Progress': 2, 'Pending': 1, 'Done': 0 };
        return (priority[b.status as keyof typeof priority] || 0) - (priority[a.status as keyof typeof priority] || 0);
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      // Default: recent
      if (a.status === 'Done' && b.status !== 'Done') return 1;
      if (a.status !== 'Done' && b.status === 'Done') return -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [tasks, statusFilter, categoryFilter, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      {/* Modern header section */}
      <div className="py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent mb-4">
            Task Management Center
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Track client requests, bugs, and feature requests with modern workflow tools
          </p>
        </div>
      </div>

      {/* Enhanced filter toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
        <div className="p-4 md:p-6">
          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {statusFilters.map(f => {
              const isActive = statusFilter === f.id;
              const count = statusCounts[f.id as keyof typeof statusCounts];
              return (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{f.emoji}</span>
                  {f.label}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isActive ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and filters row */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category filters */}
            <div className="flex gap-2">
              {['All', 'Bugs', 'Features'].map(f => (
                <button
                  key={f}
                  onClick={() => setCategoryFilter(f)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    categoryFilter === f
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* View mode toggles */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {[
                { mode: 'grid', icon: '⊞', title: 'Grid View' },
                { mode: 'list', icon: '☰', title: 'List View' },
                { mode: 'kanban', icon: '⚏', title: 'Kanban View' }
              ].map(({ mode, icon, title }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  title={title}
                  className={`p-2 text-sm rounded transition-colors ${
                    viewMode === mode
                      ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Recent First</option>
              <option value="priority">By Priority</option>
              <option value="category">By Category</option>
            </select>
          </div>
        </div>
      </div>
      {/* Task display area */}
      <div className="mb-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
              {searchQuery ? 'No matching tasks' : 'No tasks found'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Tasks will appear here when created.'}
            </p>
          </div>
        ) : viewMode === 'kanban' ? (
          // Kanban Board View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusFilters.slice(1).map(status => {
              const statusTasks = filtered.filter(t => {
                if (status.id === 'todo') return t.status === 'Pending' || t.status === 'To Do';
                if (status.id === 'in-progress') return t.status === 'In Progress';
                if (status.id === 'urgent') return t.status === 'Urgent';
                if (status.id === 'done') return t.status === 'Done';
                return false;
              });
              
              return (
                <div key={status.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{status.emoji}</span>
                    <h3 className="font-medium text-slate-900 dark:text-white">{status.label}</h3>
                    <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded-full">
                      {statusTasks.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {statusTasks.map(task => (
                      <TaskCard key={task.id} task={task} lastViewed={lastViewed[task.id]} viewMode="kanban" />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} lastViewed={lastViewed[task.id]} viewMode="grid" />
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                <div className="col-span-1">Status</div>
                <div className="col-span-6">Task</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-1">ID</div>
              </div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filtered.map(task => (
                <TaskCard key={task.id} task={task} lastViewed={lastViewed[task.id]} viewMode="list" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results summary */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-lg px-4 py-3 border border-slate-200 dark:border-slate-700">
          <span>
            Showing {filtered.length} of {tasks.length} tasks
            {(statusFilter !== 'all' || categoryFilter !== 'All' || searchQuery) && (
              <button
                onClick={() => { 
                  setStatusFilter('all'); 
                  setCategoryFilter('All'); 
                  setSearchQuery(''); 
                }}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
