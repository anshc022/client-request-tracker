'use client';

import { useState, useMemo, useEffect } from 'react';
import TaskCard from './TaskCard';
import BottomNav from './BottomNav';
import { ClientRequest } from '@/app/actions';
import { Search, X } from 'lucide-react';

const categoryFilters = ['All', 'Bugs', 'Features'];

function isToday(date: string) {
  return new Date(date).toDateString() === new Date().toDateString();
}

function isYesterday(date: string) {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return new Date(date).toDateString() === y.toDateString();
}

function isThisWeek(date: string) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return new Date(date) >= weekAgo;
}

function groupByDate(tasks: ClientRequest[]) {
  const groups: { label: string; tasks: ClientRequest[] }[] = [];
  const today: ClientRequest[] = [];
  const yesterday: ClientRequest[] = [];
  const thisWeek: ClientRequest[] = [];
  const older: ClientRequest[] = [];

  tasks.forEach(t => {
    if (isToday(t.created_at)) today.push(t);
    else if (isYesterday(t.created_at)) yesterday.push(t);
    else if (isThisWeek(t.created_at)) thisWeek.push(t);
    else older.push(t);
  });

  if (today.length) groups.push({ label: 'Today', tasks: today });
  if (yesterday.length) groups.push({ label: 'Yesterday', tasks: yesterday });
  if (thisWeek.length) groups.push({ label: 'This Week', tasks: thisWeek });
  if (older.length) groups.push({ label: 'Older', tasks: older });

  return groups;
}

export default function TaskList({ tasks }: { tasks: ClientRequest[] }) {
  const [bottomTab, setBottomTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [lastViewed, setLastViewed] = useState<Record<number, number>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ping_last_viewed');
      if (stored) setLastViewed(JSON.parse(stored));
    } catch {}
  }, []);

  const counts = useMemo(() => {
    const all = tasks.length;
    const active = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    const done = tasks.filter(t => t.status === 'Done').length;
    return { all, active, done };
  }, [tasks]);

  const filtered = useMemo(() => {
    let data = [...tasks];

    if (bottomTab === 'active') {
      data = data.filter(t => t.status === 'Pending' || t.status === 'In Progress');
    } else if (bottomTab === 'done') {
      data = data.filter(t => t.status === 'Done');
    }

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

    return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [tasks, bottomTab, categoryFilter, searchQuery]);

  const groups = groupByDate(filtered);

  return (
    <>
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
        }}>
          <Search size={16} color="#8696A0" />
          <input
            type="text"
            placeholder="Search tasks..."
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

      {/* Category Filter Pills */}
      <div className="hide-scrollbar" style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        padding: '12px 16px 8px',
        background: 'var(--bg)',
        position: 'sticky',
        top: 96,
        zIndex: 20,
      }}>
        {categoryFilters.map(f => (
          <button
            key={f}
            onClick={() => setCategoryFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border: 'none',
              background: categoryFilter === f
                ? (f === 'Bugs' ? '#FEE2E2' : f === 'Features' ? '#D1FAE5' : 'var(--primary)')
                : 'var(--surface)',
              color: categoryFilter === f
                ? (f === 'Bugs' ? '#DC2626' : f === 'Features' ? '#059669' : '#fff')
                : 'var(--text-muted)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            }}
          >
            {f === 'Bugs' && '🐛 '}{f === 'Features' && '✨ '}{f}
          </button>
        ))}
      </div>

      {/* Task Cards */}
      <div style={{ padding: '8px 12px 100px' }}>
        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {searchQuery ? '🔍' : '☕'}
            </div>
            <p style={{ fontSize: 15, fontWeight: 500 }}>
              {searchQuery ? 'No tasks match your search' : 'No tasks found'}
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

      <BottomNav activeTab={bottomTab} onTabChange={setBottomTab} counts={counts} />
    </>
  );
}
