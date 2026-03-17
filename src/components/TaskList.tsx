'use client';

import { useState, useMemo, useEffect } from 'react';
import TaskCard from './TaskCard';
import { ClientRequest } from '@/app/actions';
import { Search, X, Circle, Clock, CheckCircle2, LayoutList } from 'lucide-react';

const statusFilters = [
  { id: 'all', label: 'All Tasks', icon: LayoutList },
  { id: 'pending', label: 'Pending', icon: Circle },
  { id: 'in-progress', label: 'In Progress', icon: Clock },
  { id: 'done', label: 'Done', icon: CheckCircle2 },
];

const categoryFilters = ['All', 'Bugs', 'Features'];

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
        `ping-${t.id}`.includes(q) ||
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
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar" style={{
        width: 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        padding: '20px 0',
        flexShrink: 0,
        flexDirection: 'column',
        position: 'sticky',
        top: 56,
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
      }}>
        {/* Status filters */}
        <div style={{ padding: '0 12px 8px' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</span>
        </div>
        {statusFilters.map(f => {
          const Icon = f.icon;
          const isActive = statusFilter === f.id;
          const count = statusCounts[f.id as keyof typeof statusCounts];
          return (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                background: isActive ? 'var(--primary-subtle)' : 'transparent',
                color: isActive ? 'var(--primary-dark)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                borderRadius: 0,
                borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={15} />
                {f.label}
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: isActive ? 'var(--primary)' : 'var(--text-light)',
                minWidth: 20,
                textAlign: 'right',
              }}>
                {count}
              </span>
            </button>
          );
        })}

        <div style={{ height: 1, background: 'var(--border)', margin: '16px 12px' }} />

        {/* Category filters */}
        <div style={{ padding: '0 12px 8px' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</span>
        </div>
        {categoryFilters.map(f => {
          const isActive = categoryFilter === f;
          return (
            <button
              key={f}
              onClick={() => setCategoryFilter(f)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                background: isActive ? 'var(--primary-subtle)' : 'transparent',
                color: isActive ? 'var(--primary-dark)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {f === 'Bugs' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />}
              {f === 'Features' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366F1', flexShrink: 0 }} />}
              {f === 'All' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF', flexShrink: 0 }} />}
              {f}
            </button>
          );
        })}
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Search + Mobile Filters */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 56,
          zIndex: 25,
        }}>
          {/* Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg)',
            borderRadius: 'var(--radius)',
            padding: '8px 12px',
            border: '1px solid var(--border)',
            maxWidth: 600,
          }}>
            <Search size={15} color="var(--text-light)" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                fontSize: 13,
                color: 'var(--text)',
                background: 'transparent',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}>
                <X size={14} color="var(--text-light)" />
              </button>
            )}
          </div>

          {/* Mobile filter chips */}
          <div className="mobile-filters hide-scrollbar" style={{
            gap: 6,
            overflowX: 'auto',
            marginTop: 10,
            paddingBottom: 2,
          }}>
            {statusFilters.map(f => {
              const isActive = statusFilter === f.id;
              const count = statusCounts[f.id as keyof typeof statusCounts];
              return (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: isActive ? 'var(--primary-subtle)' : 'var(--surface)',
                    color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    flexShrink: 0,
                  }}
                >
                  {f.label}
                  <span style={{ fontSize: 11, opacity: 0.7 }}>{count}</span>
                </button>
              );
            })}
            <div style={{ width: 1, background: 'var(--border)', margin: '0 2px', flexShrink: 0, alignSelf: 'stretch' }} />
            {categoryFilters.filter(f => f !== 'All').map(f => (
              <button
                key={f}
                onClick={() => setCategoryFilter(categoryFilter === f ? 'All' : f)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: categoryFilter === f
                    ? `1px solid ${f === 'Bugs' ? '#EF4444' : '#6366F1'}`
                    : '1px solid var(--border)',
                  background: categoryFilter === f
                    ? (f === 'Bugs' ? '#FEF2F2' : '#EEF2FF')
                    : 'var(--surface)',
                  color: categoryFilter === f
                    ? (f === 'Bugs' ? '#DC2626' : '#4F46E5')
                    : 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Task list */}
        <div style={{ padding: '16px', maxWidth: 720, margin: '0 auto' }}>
          {/* Results count */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            padding: '0 2px',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
              {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}
              {statusFilter !== 'all' && ` · ${statusFilters.find(f => f.id === statusFilter)?.label}`}
              {categoryFilter !== 'All' && ` · ${categoryFilter}`}
            </span>
            {(statusFilter !== 'all' || categoryFilter !== 'All') && (
              <button
                onClick={() => { setStatusFilter('all'); setCategoryFilter('All'); }}
                style={{
                  fontSize: 12,
                  color: 'var(--primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 28,
              }}>
                {searchQuery ? '🔍' : '✨'}
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {searchQuery ? 'No matching tasks' : 'No tasks here'}
              </p>
              <p style={{ fontSize: 13, marginTop: 4, color: 'var(--text-light)' }}>
                {searchQuery ? 'Try a different search term' : 'All clear!'}
              </p>
            </div>
          )}

          {/* Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(t => (
              <TaskCard key={t.id} task={t} lastViewed={lastViewed[t.id]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
