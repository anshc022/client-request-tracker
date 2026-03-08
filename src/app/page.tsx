import Link from 'next/link';
import { getRequests } from './actions';
import TaskList from '@/components/TaskList';
import BottomNav from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const tasks = await getRequests();
  const openCount = tasks.filter(t => t.status !== 'Done').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top Bar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 20 }}>
        <span style={{ fontSize: 20, fontWeight: 600 }}>Ping</span>
        <Link href="/stats" style={{ background: 'var(--primary)', color: '#fff', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          {openCount} open
        </Link>
      </header>

      <TaskList tasks={tasks} />
      <BottomNav />
    </div>
  );
}
