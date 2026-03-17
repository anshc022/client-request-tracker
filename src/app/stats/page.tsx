import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getStats, getRequests } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const stats = await getStats();
  const tasks = await getRequests();

  const bugPct = stats.total > 0 ? Math.round((stats.bugs / stats.total) * 100) : 0;
  const featurePct = 100 - bugPct;

  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const done = tasks.filter(t => t.status === 'Done').length;

  // Tasks per day (last 7 days)
  const dailyCounts: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const count = tasks.filter(t => new Date(t.created_at).toDateString() === dateStr).length;
    dailyCounts.push({ day: d.toLocaleDateString('en-IN', { weekday: 'short' }), count });
  }
  const maxDaily = Math.max(...dailyCounts.map(d => d.count), 1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        height: 56,
      }}>
        <Link href="/" style={{ color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
          <ArrowLeft size={20} />
        </Link>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Dashboard</span>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px' }}>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Open Tasks', value: stats.open, color: '#EF4444', bg: '#FEF2F2' },
            { label: 'Created Today', value: stats.today, color: '#F59E0B', bg: '#FFFBEB' },
            { label: 'Done This Week', value: stats.doneThisWeek, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Total', value: stats.total, color: '#6366F1', bg: '#EEF2FF' },
          ].map(c => (
            <div key={c.label} style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '18px 16px',
            }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{c.label}</p>
            </div>
          ))}
        </div>

        {/* Status Breakdown */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '20px',
          marginBottom: 16,
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Status Breakdown</p>
          {[
            { label: 'Pending', count: pending, color: '#9CA3AF' },
            { label: 'In Progress', count: inProgress, color: '#F59E0B' },
            { label: 'Done', count: done, color: '#10B981' },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.count}</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: stats.total > 0 ? `${(s.count / stats.total) * 100}%` : '0%',
                  background: s.color,
                  borderRadius: 3,
                }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Bug vs Feature */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '20px',
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Type Split</p>
            <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 28 }}>
              {bugPct > 0 && (
                <div style={{
                  width: `${bugPct}%`, background: '#EF4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#fff', fontWeight: 600,
                }}>{bugPct}%</div>
              )}
              {featurePct > 0 && (
                <div style={{
                  width: `${featurePct}%`, background: '#6366F1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#fff', fontWeight: 600,
                }}>{featurePct}%</div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>Bugs ({stats.bugs})</span>
              <span>Features ({stats.features})</span>
            </div>
          </div>

          {/* Weekly */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '20px',
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>This Week</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 80, gap: 4 }}>
              {dailyCounts.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--primary)' }}>
                    {d.count > 0 ? d.count : ''}
                  </span>
                  <div style={{
                    width: '100%', maxWidth: 24,
                    height: d.count > 0 ? `${(d.count / maxDaily) * 50}px` : '3px',
                    background: d.count > 0 ? 'var(--primary)' : 'var(--border)',
                    borderRadius: 3, minHeight: 3,
                  }} />
                  <span style={{ fontSize: 10, color: 'var(--text-light)' }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
