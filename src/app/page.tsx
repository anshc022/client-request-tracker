import Link from 'next/link';
import { getRequests } from './actions';
import TaskList from '@/components/TaskList';
import { Bell } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const tasks = await getRequests();
  const openCount = tasks.filter(t => t.status !== 'Done').length;
  const totalCount = tasks.length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* WhatsApp-style Header */}
      <header style={{
        background: 'var(--primary-dark)',
        padding: '12px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Ping</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{totalCount} tasks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/stats" style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 13 }}>
              <div style={{ position: 'relative' }}>
                <Bell size={20} color="#fff" />
                {openCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -8,
                    background: '#EF4444', color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    minWidth: 18, height: 18,
                    borderRadius: 9,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 4px',
                  }}>
                    {openCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <TaskList tasks={tasks} />
    </div>
  );
}
