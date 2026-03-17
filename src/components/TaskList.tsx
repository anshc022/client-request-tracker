'use client';

import { useState, useMemo, useEffect } from 'react';
import TaskCard from './TaskCard';
import { ClientRequest } from '@/app/actions';

const statusFilters = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

export default function TaskList({ tasks }: { tasks: ClientRequest[] }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastViewed, setLastViewed] = useState<Record<number, number>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ping_last_viewed');
      if (stored) setLastViewed(JSON.parse(stored));
    } catch {}
  }, []);

  const statusCounts = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    'in-progress': tasks.filter(t => t.status === 'In Progress').length,
    done: tasks.filter(t => t.status === 'Done').length,
  }), [tasks]);

  const filtered = useMemo(() => {
    let data = [...tasks];
    if (statusFilter === 'pending') data = data.filter(t => t.status === 'Pending');
    else if (statusFilter === 'in-progress') data = data.filter(t => t.status === 'In Progress');
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
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Page title area — Notion style */}
      <div style={{ padding: '40px 48px 0' }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          📋 Task Board
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
          Track client requests, bugs, and feature requests
        </div>
      </div>

      {/* Filter toolbar — Notion-style tabs + search */}
      <div style={{
        padding: '0 48px',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        {/* View tabs */}
        <div style={{ display: 'flex', gap: 0, marginRight: 'auto' }}>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginBottom: -1,
                  transition: 'color 80ms ease',
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

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 4, padding: '6px 0' }}>
          {['All', 'Bugs', 'Features'].map(f => {
            const isActive = categoryFilter === f;
            return (
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
                  color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)',
                  background: isActive ? 'var(--primary-subtle)' : 'transparent',
                  transition: 'all 80ms ease',
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          borderRadius: 4,
          border: '1px solid transparent',
          marginLeft: 8,
        }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              fontSize: 13,
              color: 'var(--text)',
              background: 'transparent',
              width: 120,
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'var(--text-muted)', padding: '0 2px',
            }}>✕</button>
          )}
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 12px 6px 48px',
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--text-muted)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        gap: 8,
      }}>
        <div style={{ width: 80, flexShrink: 0 }}>Status</div>
        <div style={{ flex: 1 }}>Title</div>
        <div style={{ width: 70, textAlign: 'center', flexShrink: 0 }}>Type</div>
        <div style={{ width: 40, textAlign: 'right', flexShrink: 0 }}>ID</div>
      </div>

      {/* Task rows */}
      <div style={{ padding: '0 36px' }}>
        {filtered.length === 0 && (
          <div style={{
            padding: '48px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 14,
          }}>
            {searchQuery ? 'No tasks match your search.' : 'No tasks in this view.'}
          </div>
        )}
        {filtered.map(t => (
          <TaskCard key={t.id} task={t} lastViewed={lastViewed[t.id]} />
        ))}
      </div>

      {/* Result count */}
      {filtered.length > 0 && (
        <div style={{
          padding: '8px 48px',
          fontSize: 12,
          color: 'var(--text-light)',
          borderTop: '1px solid var(--border-light)',
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
  );
}
