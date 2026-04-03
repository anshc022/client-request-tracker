'use client';

import { useState, useMemo, useEffect } from 'react';
import TaskCard from './TaskCard';
import { ClientRequest } from '@/app/actions';

const statusFilters = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'done', label: 'Done' },
];

export default function TaskList({ tasks }: { tasks: ClientRequest[] }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  const [lastViewed, setLastViewed] = useState<Record<number, number>>({});

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
    
    return data.sort((a, b) => {
      if (a.status === 'Done' && b.status !== 'Done') return 1;
      if (a.status !== 'Done' && b.status === 'Done') return -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [tasks, statusFilter, categoryFilter, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Notion-style page header */}
      <div className="px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Tasks
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {tasks.length} total
          </p>
        </div>

        {/* Filter tabs - Notion style */}
        <div className="flex flex-wrap gap-1 mb-6">
          {statusFilters.map(f => {
            const isActive = statusFilter === f.id;
            const count = statusCounts[f.id as keyof typeof statusCounts];
            return (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {f.label} {count}
              </button>
            );
          })}
        </div>

        {/* Simple search and controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:border-black dark:focus:border-white"
            />
            
            {['All', 'Bugs', 'Features'].map(f => (
              <button
                key={f}
                onClick={() => setCategoryFilter(f)}
                className={`px-2 py-1 text-sm rounded ${
                  categoryFilter === f
                    ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            {[
              { mode: 'list', label: 'List' },
              { mode: 'grid', label: 'Grid' },
              { mode: 'kanban', label: 'Board' }
            ].map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-2 py-1 text-sm rounded ${
                  viewMode === mode
                    ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Task display */}
      <div className="px-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No matching tasks' : 'No tasks'}
          </div>
        ) : viewMode === 'kanban' ? (
          // Kanban Board
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {statusFilters.slice(1).map(status => {
              const statusTasks = filtered.filter(t => {
                if (status.id === 'todo') return t.status === 'Pending' || t.status === 'To Do';
                if (status.id === 'in-progress') return t.status === 'In Progress';
                if (status.id === 'urgent') return t.status === 'Urgent';
                if (status.id === 'done') return t.status === 'Done';
                return false;
              });
              
              return (
                <div key={status.id} className="bg-gray-50 dark:bg-gray-800 rounded p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-black dark:text-white">{status.label}</h3>
                    <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} lastViewed={lastViewed[task.id]} viewMode="grid" />
            ))}
          </div>
        ) : (
          // List View (default - Notion table style)
          <div className="border border-gray-200 dark:border-gray-800 rounded">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-1">Status</div>
                <div className="col-span-6">Task</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-1">ID</div>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {filtered.map(task => (
                <TaskCard key={task.id} task={task} lastViewed={lastViewed[task.id]} viewMode="list" />
              ))}
            </div>
          </div>
        )}

        {/* Results count */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
            <span>
              {filtered.length} of {tasks.length}
              {(statusFilter !== 'all' || categoryFilter !== 'All' || searchQuery) && (
                <button
                  onClick={() => { 
                    setStatusFilter('all'); 
                    setCategoryFilter('All'); 
                    setSearchQuery(''); 
                  }}
                  className="ml-2 text-black dark:text-white hover:underline"
                >
                  Clear filters
                </button>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
