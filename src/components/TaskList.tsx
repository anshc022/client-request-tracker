'use client';

import { useState } from 'react';
import TaskCard from './TaskCard';
import { ClientRequest } from '@/app/actions';

const filters = ['All', 'Pending', 'In Progress', 'Done', 'Bugs', 'Features'];

export default function TaskList({ tasks }: { tasks: ClientRequest[] }) {
  const [active, setActive] = useState('All');

  const filtered = tasks.filter(t => {
    if (active === 'All') return true;
    if (active === 'Bugs') return t.category === 'Bug';
    if (active === 'Features') return t.category === 'Feature';
    return t.status === active;
  });

  return (
    <>
      {/* Filter Pills */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 16px', position: 'sticky', top: 56, background: 'var(--bg)', zIndex: 10 }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActive(f)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border: active === f ? 'none' : '1px solid var(--border)',
              background: active === f ? 'var(--primary)' : 'transparent',
              color: active === f ? '#fff' : 'var(--text-muted)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px 100px' }}>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No tasks found</p>
        )}
        {filtered.map(t => (
          <TaskCard key={t.id} task={t} />
        ))}
      </div>
    </>
  );
}
