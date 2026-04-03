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
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Notion-style page header */}
      <div style={{ padding: '48px 48px 0' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            📋 Tasks
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {tasks.length} total
          </p>
        </div>

        {/* Filter tabs - Notion style */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
          {statusFilters.map(f => {
            const isActive = statusFilter === f.id;
            const count = statusCounts[f.id as keyof typeof statusCounts];
            return (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  padding: '4px 8px',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text)' : 'var(--text-muted)',
                  background: isActive ? 'var(--bg-hover)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  borderBottom: isActive ? '2px solid var(--text)' : '2px solid transparent',
                  marginBottom: -2,
                  transition: 'color 80ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {f.label}
                <span style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  background: isActive ? 'var(--bg-active)' : 'transparent',
                  padding: '0 4px',
                  borderRadius: 'var(--radius)',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Simple search and controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 8px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: 14,
                minWidth: 120,
              }}
            />
            
            {['All', 'Bugs', 'Features'].map(f => (
              <button
                key={f}
                onClick={() => setCategoryFilter(f)}
                style={{
                  padding: '2px 6px',
                  fontSize: 12,
                  borderRadius: 'var(--radius)',
                  border: 'none',
                  cursor: 'pointer',
                  color: categoryFilter === f ? 'var(--text)' : 'var(--text-muted)',
                  background: categoryFilter === f ? 'var(--bg-hover)' : 'transparent',
                  fontWeight: categoryFilter === f ? 500 : 400,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 2 }}>
            {[
              { mode: 'list', label: 'List' },
              { mode: 'grid', label: 'Grid' },
              { mode: 'kanban', label: 'Board' }
            ].map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                style={{
                  padding: '4px 8px',
                  fontSize: 12,
                  borderRadius: 'var(--radius)',
                  border: 'none',
                  cursor: 'pointer',
                  color: viewMode === mode ? 'var(--text)' : 'var(--text-muted)',
                  background: viewMode === mode ? 'var(--bg-hover)' : 'transparent',
                  fontWeight: viewMode === mode ? 500 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Task display */}
      <div style={{ padding: '0 48px 48px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
            {searchQuery ? 'No matching tasks.' : 'No tasks in this view.'}
          </div>
        ) : viewMode === 'kanban' ? (
          // Kanban Board
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {statusFilters.slice(1).map(status => {
              const statusTasks = filtered.filter(t => {
                if (status.id === 'todo') return t.status === 'Pending' || t.status === 'To Do';
                if (status.id === 'in-progress') return t.status === 'In Progress';
                if (status.id === 'urgent') return t.status === 'Urgent';
                if (status.id === 'done') return t.status === 'Done';
                return false;
              });
              
              return (
                <div key={status.id} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{status.label}</h3>
                    <span style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      background: 'var(--bg-hover)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius)',
                    }}>
                      {statusTasks.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} lastViewed={lastViewed[task.id]} viewMode="grid" />
            ))}
          </div>
        ) : (
          // List View (default - Notion table style) 
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg)' }}>
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '12px 48px',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{ width: 80, textAlign: 'center' }}>Status</div>
                <div style={{ flex: 1, minWidth: 0 }}>Task</div>
                <div style={{ width: 80, textAlign: 'center' }}>Type</div>
                <div style={{ width: 90, textAlign: 'center' }}>Created</div>
                <div style={{ width: 60, textAlign: 'center' }}>ID</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg)' }}>
              {filtered.map(task => (
                <TaskCard key={task.id} task={task} lastViewed={lastViewed[task.id]} viewMode="list" />
              ))}
            </div>
          </div>
        )}

        {/* Results count */}
        {filtered.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}>
            <span>
              {filtered.length} of {tasks.length}
              {(statusFilter !== 'all' || categoryFilter !== 'All' || searchQuery) && (
                <button
                  onClick={() => { 
                    setStatusFilter('all'); 
                    setCategoryFilter('All'); 
                    setSearchQuery(''); 
                  }}
                  style={{
                    marginLeft: 8,
                    color: 'var(--text)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    textDecoration: 'underline',
                  }}
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
