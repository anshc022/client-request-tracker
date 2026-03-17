import Link from 'next/link';
import { getRequests } from './actions';
import TaskList from '@/components/TaskList';
import { BarChart3, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const tasks = await getRequests();
  const openCount = tasks.filter(t => t.status !== 'Done').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Clean Header */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 14, fontWeight: 700,
          }}>P</div>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>Ping</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {openCount > 0 && (
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: 'var(--primary)',
              background: 'var(--primary-subtle)',
              padding: '4px 10px',
              borderRadius: 20,
            }}>
              {openCount} open
            </span>
          )}
          <Link href="/stats" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--text-muted)', textDecoration: 'none',
            padding: '6px 12px', borderRadius: 6,
            fontSize: 13, fontWeight: 500,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
          }}>
            <BarChart3 size={15} />
            Stats
          </Link>
        </div>
      </header>

      <TaskList tasks={tasks} />
    </div>
  );
}
