import Link from 'next/link';
import { getRequests } from './actions';
import TaskList from '@/components/TaskList';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const tasks = await getRequests();
  const openCount = tasks.filter(t => t.status !== 'Done').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Notion-style top bar */}
      <header style={{
        height: 45,
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        fontSize: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>📋</span>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>Ping Tracker</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 4 }}>{tasks.length} tasks</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {openCount > 0 && (
            <span style={{
              fontSize: 12, fontWeight: 500,
              color: 'var(--tag-red-text)',
              background: 'var(--tag-red)',
              padding: '1px 8px',
              borderRadius: 4,
            }}>
              {openCount} open
            </span>
          )}
          <Link href="/stats" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: 13,
            padding: '4px 8px',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            📊 Stats
          </Link>
        </div>
      </header>

      <TaskList tasks={tasks} />
    </div>
  );
}
