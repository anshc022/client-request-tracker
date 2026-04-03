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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 24 }}>
          {statusFilters.map(f => {
            const isActive = statusFilter === f.id;
            const count = statusCounts[f.id as keyof typeof statusCounts];
            return (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  padding: '8px 12px',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text)' : 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--text)' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
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
                  background: isActive ? 'var(--bg-hover)' : 'transparent',
                  padding: '0 5px',
                  borderRadius: 4,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Simple search and controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: '4px 8px',
              border: '1px solid transparent',
              borderRadius: 4,
              background: 'transparent',
              color: 'var(--text)',
              fontSize: 13,
              width: 120,
            }}
          />
          
          {['All', 'Bugs', 'Features'].map(f => (
            <button
              key={f}
              onClick={() => setCategoryFilter(f)}
              style={{
                padding: '3px 8px',
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                color: categoryFilter === f ? 'var(--primary-dark)' : 'var(--text-muted)',
                background: categoryFilter === f ? 'var(--primary-subtle)' : 'transparent',
                transition: 'all 80ms ease',
              }}
            >
              {f}
            </button>
          ))}

          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
            {[
              { mode: 'list', label: 'List' },
              { mode: 'grid', label: 'Grid' }
            ].map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                style={{
                  padding: '4px 6px',
                  border: 'none',
                  background: viewMode === mode ? 'var(--bg-active)' : 'transparent',
                  color: viewMode === mode ? 'var(--text)' : 'var(--text-muted)',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Task display */}
      <div style={{ padding: '0 48px 48px', maxWidth: 720 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
            {searchQuery ? 'No matching tasks.' : 'No tasks in this view.'}
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} lastViewed={lastViewed[task.id]} viewMode="grid" />
            ))}
          </div>
        ) : (
          // List View — Table style like detail page
          <div>
            {/* Table header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 8px',
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              gap: 4,
            }}>
              <div style={{ width: 60, flexShrink: 0, textAlign: 'left' }}>Status</div>
              <div style={{ flex: 1, minWidth: 0 }}>Title</div>
              <div style={{ width: 50, textAlign: 'center', flexShrink: 0 }}>Type</div>
              <div style={{ width: 60, textAlign: 'center', flexShrink: 0 }}>Date</div>
              <div style={{ width: 35, textAlign: 'right', flexShrink: 0 }}>ID</div>
            </div>

            {/* Table rows — exactly like detail page structure */}
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} lastViewed={lastViewed[task.id]} viewMode="list" />
            ))}
          </div>
        )}

        {/* Results count */}
        {filtered.length > 0 && (
          <div style={{
            padding: '8px 0',
            fontSize: 12,
            color: 'var(--text-light)',
            borderTop: '1px solid var(--border-light)',
            marginTop: 16,
          }}>
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            {(statusFilter !== 'all' || categoryFilter !== 'All') && (
              <button
                onClick={() => { setStatusFilter('all'); setCategoryFilter('All'); }}
                style={{
                  marginLeft: 8,
                  color: 'var(--primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
