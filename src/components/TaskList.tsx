'use client';

import { useState, useMemo, useEffect } from 'react';
import TaskCard from './TaskCard';
import { ClientRequest } from '@/app/actions';
import { Search, X, Filter } from 'lucide-react';

const statusFilters = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'pending', label: 'Pending', icon: '○' },
  { id: 'in-progress', label: 'In Progress', icon: '⏳' },
  { id: 'done', label: 'Done', icon: '✓✓' },
];

const categoryFilters = ['All', 'Bugs', 'Features'];

function groupByDate(tasks: ClientRequest[]) {
  const groups: { label: string; tasks: ClientRequest[] }[] = [];
  const today: ClientRequest[] = [];
  const yesterday: ClientRequest[] = [];
  const thisWeek: ClientRequest[] = [];
  const older: ClientRequest[] = [];
  const now = new Date();
  const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

  tasks.forEach(t => {
    const d = new Date(t.created_at);
    if (d.toDateString() === now.toDateString()) today.push(t);
    else if (d.toDateString() === yesterdayDate.toDateString()) yesterday.push(t);
    else if (d >= weekAgo) thisWeek.push(t);
    else older.push(t);
  });

  if (today.length) groups.push({ label: 'Today', tasks: today });
  if (yesterday.length) groups.push({ label: 'Yesterday', tasks: yesterday });
  if (thisWeek.length) groups.push({ label: 'This Week', tasks: thisWeek });
  if (older.length) groups.push({ label: 'Older', tasks: older });
  return groups;
}

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

  const groups = groupByDate(filtered);

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 52px)' }}>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar" style={{
        width: 240,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        padding: '16px 0',
        flexShrink: 0,
        position: 'sticky',
        top: 52,
        height: 'calc(100vh - 52px)',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '0 16px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Filter by Status
        </div>
        {statusFilters.map(f => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              background: statusFilter === f.id ? '#E8F5F3' : 'transparent',
              color: statusFilter === f.id ? 'var(--primary-dark)' : 'var(--text)',
              fontWeight: statusFilter === f.id ? 600 : 400,
              borderLeft: statusFilter === f.id ? '3px solid var(--primary)' : '3px solid transparent',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13 }}>{f.icon}</span>
              {f.label}
            </span>
            <span style={{
              fontSize: 12,
              color: statusFilter === f.id ? 'var(--primary)' : 'var(--text-light)',
              background: statusFilter === f.id ? 'rgba(18,140,126,0.1)' : 'var(--bg)',
              padding: '2px 8px',
              borderRadius: 10,
              fontWeight: 600,
            }}>
              {statusCounts[f.id as keyof typeof statusCounts]}
            </span>
          </button>
        ))}

        <div style={{ padding: '20px 16px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Category
        </div>
        {categoryFilters.map(f => (
          <button
            key={f}
            onClick={() => setCategoryFilter(f)}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              background: categoryFilter === f ? '#E8F5F3' : 'transparent',
              color: categoryFilter === f ? 'var(--primary-dark)' : 'var(--text)',
              fontWeight: categoryFilter === f ? 600 : 400,
              borderLeft: categoryFilter === f ? '3px solid var(--primary)' : '3px solid transparent',
              gap: 8,
            }}
          >
            {f === 'Bugs' && '🐛'}{f === 'Features' && '✨'}{f === 'All' && '📂'} {f}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Search Bar */}
        <div style={{
          padding: '8px 12px',
          background: 'var(--primary-dark)',
          position: 'sticky',
          top: 52,
          zIndex: 25,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#fff',
            borderRadius: 8,
            padding: '8px 12px',
            maxWidth: 600,
          }}>
            <Search size={16} color="#8696A0" />
            <input
              type="text"
              placeholder="Search tasks by name, #id, or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                fontSize: 14,
                color: 'var(--text)',
                background: 'transparent',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}>
                <X size={16} color="#8696A0" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Status Tabs */}
        <div className="mobile-tabs hide-scrollbar" style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          padding: '10px 12px',
          background: 'var(--bg)',
          position: 'sticky',
          top: 96,
          zIndex: 20,
        }}>
          {statusFilters.map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                border: statusFilter === f.id ? 'none' : '1px solid var(--border)',
                background: statusFilter === f.id ? 'var(--primary)' : 'var(--surface)',
                color: statusFilter === f.id ? '#fff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {f.icon} {f.label}
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                marginLeft: 2,
                opacity: 0.8,
              }}>
                {statusCounts[f.id as keyof typeof statusCounts]}
              </span>
            </button>
          ))}

          <div style={{ width: 1, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />

          {categoryFilters.filter(f => f !== 'All').map(f => (
            <button
              key={f}
              onClick={() => setCategoryFilter(categoryFilter === f ? 'All' : f)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                border: categoryFilter === f ? 'none' : '1px solid var(--border)',
                background: categoryFilter === f
                  ? (f === 'Bugs' ? '#FEE2E2' : '#D1FAE5')
                  : 'var(--surface)',
                color: categoryFilter === f
                  ? (f === 'Bugs' ? '#DC2626' : '#059669')
                  : 'var(--text-muted)',
              }}
            >
              {f === 'Bugs' ? '🐛' : '✨'} {f}
            </button>
          ))}
        </div>

        {/* Task Cards */}
        <div style={{ padding: '8px 12px 100px', maxWidth: 800, margin: '0 auto' }}>
          {/* Active filter indicator */}
          {(statusFilter !== 'all' || categoryFilter !== 'All') && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 0',
              flexWrap: 'wrap',
            }}>
              <Filter size={13} color="var(--text-light)" />
              <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Showing:</span>
              {statusFilter !== 'all' && (
                <span style={{
                  fontSize: 12,
                  padding: '2px 10px',
                  borderRadius: 12,
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: 500,
                }}>
                  {statusFilters.find(f => f.id === statusFilter)?.label}
                </span>
              )}
              {categoryFilter !== 'All' && (
                <span style={{
                  fontSize: 12,
                  padding: '2px 10px',
                  borderRadius: 12,
                  background: categoryFilter === 'Bugs' ? '#FEE2E2' : '#D1FAE5',
                  color: categoryFilter === 'Bugs' ? '#DC2626' : '#059669',
                  fontWeight: 500,
                }}>
                  {categoryFilter}
                </span>
              )}
              <button
                onClick={() => { setStatusFilter('all'); setCategoryFilter('All'); }}
                style={{
                  fontSize: 12,
                  color: 'var(--text-light)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Clear all
              </button>
            </div>
          )}

          {filtered.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {searchQuery ? '🔍' : statusFilter === 'done' ? '🎉' : '☕'}
              </div>
              <p style={{ fontSize: 15, fontWeight: 500 }}>
                {searchQuery ? 'No tasks match your search' : statusFilter === 'done' ? 'No completed tasks yet' : 'No tasks found'}
              </p>
              <p style={{ fontSize: 13, marginTop: 4, color: 'var(--text-light)' }}>
                {searchQuery ? 'Try a different keyword' : 'All clear for now!'}
              </p>
            </div>
          )}

          {groups.map(group => (
            <div key={group.label} style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 4px',
              }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {group.label}
                </span>
                <span style={{
                  fontSize: 11,
                  color: 'var(--text-light)',
                  background: 'var(--border)',
                  padding: '1px 8px',
                  borderRadius: 10,
                }}>
                  {group.tasks.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.tasks.map(t => (
                  <TaskCard key={t.id} task={t} lastViewed={lastViewed[t.id]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
