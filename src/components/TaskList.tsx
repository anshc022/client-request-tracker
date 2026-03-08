'use client';

import { useState, useMemo } from 'react';
import TaskCard from './TaskCard';
import BottomNav from './BottomNav';
import { ClientRequest } from '@/app/actions';

const categoryFilters = ['All', 'Bugs', 'Features'];
const dateFilters = ['All Time', 'Today', 'Yesterday', 'This Week'];

function isToday(date: string) {
  const d = new Date(date);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isYesterday(date: string) {
  const d = new Date(date);
  const now = new Date();
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  return d.toDateString() === y.toDateString();
}

function isThisWeek(date: string) {
  const d = new Date(date);
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  return d >= weekAgo;
}

function groupByDate(tasks: ClientRequest[]) {
  const groups: { label: string; tasks: ClientRequest[] }[] = [];
  const today: ClientRequest[] = [];
  const yesterday: ClientRequest[] = [];
  const older: ClientRequest[] = [];

  tasks.forEach(t => {
    if (isToday(t.created_at)) today.push(t);
    else if (isYesterday(t.created_at)) yesterday.push(t);
    else older.push(t);
  });

  if (today.length) groups.push({ label: 'Today', tasks: today });
  if (yesterday.length) groups.push({ label: 'Yesterday', tasks: yesterday });
  if (older.length) groups.push({ label: 'Older', tasks: older });

  return groups;
}

export default function TaskList({ tasks }: { tasks: ClientRequest[] }) {
  const [bottomTab, setBottomTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');

  const filtered = useMemo(() => {
    let data = [...tasks];

    // Bottom nav filter
    if (bottomTab === 'active') {
      data = data.filter(t => t.status === 'Pending' || t.status === 'In Progress');
    } else if (bottomTab === 'done') {
      data = data.filter(t => t.status === 'Done');
    }

    // Category filter
    if (categoryFilter === 'Bugs') data = data.filter(t => t.category === 'Bug');
    if (categoryFilter === 'Features') data = data.filter(t => t.category === 'Feature');

    // Date filter
    if (dateFilter === 'Today') data = data.filter(t => isToday(t.created_at));
    if (dateFilter === 'Yesterday') data = data.filter(t => isYesterday(t.created_at));
    if (dateFilter === 'This Week') data = data.filter(t => isThisWeek(t.created_at));

    // Sort newest first
    return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [tasks, bottomTab, categoryFilter, dateFilter]);

  const groups = groupByDate(filtered);

  return (
    <>
      {/* Filter Pills Row */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 16px 4px', position: 'sticky', top: 56, background: 'var(--bg)', zIndex: 10 }}>
        {categoryFilters.map(f => (
          <button
            key={f}
            onClick={() => setCategoryFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              whiteSpace: 'nowrap', cursor: 'pointer',
              border: categoryFilter === f ? 'none' : '1px solid var(--border)',
              background: categoryFilter === f ? 'var(--primary)' : 'transparent',
              color: categoryFilter === f ? '#fff' : 'var(--text-muted)',
            }}
          >
            {f}
          </button>
        ))}
        <div style={{ width: 1, background: 'var(--border)', margin: '4px 0', flexShrink: 0 }} />
        {dateFilters.map(f => (
          <button
            key={f}
            onClick={() => setDateFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              whiteSpace: 'nowrap', cursor: 'pointer',
              border: dateFilter === f ? 'none' : '1px solid var(--border)',
              background: dateFilter === f ? '#10B981' : 'transparent',
              color: dateFilter === f ? '#fff' : 'var(--text-muted)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grouped Task Cards */}
      <div style={{ padding: '12px 16px 100px' }}>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No tasks found ☕</p>
        )}
        {groups.map(group => (
          <div key={group.label} style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{group.label}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {group.tasks.map(t => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNav activeTab={bottomTab} onTabChange={setBottomTab} />
    </>
  );
}
