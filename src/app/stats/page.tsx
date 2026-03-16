import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getStats, getRequests } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const stats = await getStats();
  const tasks = await getRequests();

  const bugPct = stats.total > 0 ? Math.round((stats.bugs / stats.total) * 100) : 0;
  const featurePct = 100 - bugPct;

  // Priority breakdown
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
    dailyCounts.push({
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      count,
    });
  }
  const maxDaily = Math.max(...dailyCounts.map(d => d.count), 1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: 'var(--primary-dark)',
        color: '#fff',
      }}>
        <Link href="/" style={{ color: '#fff', display: 'flex', padding: 4 }}>
          <ArrowLeft size={22} />
        </Link>
        <span style={{ fontSize: 18, fontWeight: 600 }}>Dashboard</span>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: 'Open', value: stats.open, color: '#EF4444', bg: '#FEF2F2' },
            { label: 'Today', value: stats.today, color: '#F59E0B', bg: '#FFFBEB' },
            { label: 'Resolved', value: stats.doneThisWeek, color: '#25D366', bg: '#F0FDF4' },
          ].map(c => (
            <div key={c.label} style={{
              background: c.bg,
              borderRadius: 12,
              padding: '16px 12px',
              textAlign: 'center',
              border: '1px solid var(--border)',
            }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{c.label}</p>
            </div>
          ))}
        </div>

        {/* Status Breakdown */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          padding: 16,
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>Status Breakdown</p>

          {[
            { label: 'Pending', count: pending, color: '#8696A0', icon: '○' },
            { label: 'In Progress', count: inProgress, color: '#F59E0B', icon: '⏳' },
            { label: 'Done', count: done, color: '#25D366', icon: '✓✓' },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{s.icon}</span> {s.label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.count}</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: stats.total > 0 ? `${(s.count / stats.total) * 100}%` : '0%',
                  background: s.color,
                  borderRadius: 3,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Bug vs Feature */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          padding: 16,
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>Bug vs Feature</p>
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 28 }}>
            {bugPct > 0 && (
              <div style={{
                width: `${bugPct}%`,
                background: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                color: '#fff',
                fontWeight: 600,
              }}>
                {bugPct}%
              </div>
            )}
            {featurePct > 0 && (
              <div style={{
                width: `${featurePct}%`,
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                color: '#fff',
                fontWeight: 600,
              }}>
                {featurePct}%
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>🐛 Bugs ({stats.bugs})</span>
            <span>✨ Features ({stats.features})</span>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          padding: 16,
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>This Week</p>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: 100,
            gap: 6,
          }}>
            {dailyCounts.map((d, i) => (
              <div key={i} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--primary)' }}>
                  {d.count > 0 ? d.count : ''}
                </span>
                <div style={{
                  width: '100%',
                  maxWidth: 28,
                  height: d.count > 0 ? `${(d.count / maxDaily) * 70}px` : '4px',
                  background: d.count > 0 ? 'var(--primary)' : 'var(--border)',
                  borderRadius: 4,
                  minHeight: 4,
                  transition: 'height 0.5s ease',
                }} />
                <span style={{ fontSize: 10, color: 'var(--text-light)' }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div style={{
          textAlign: 'center',
          padding: '12px 0 20px',
          color: 'var(--text-light)',
          fontSize: 13,
        }}>
          Total: {stats.total} tasks tracked
        </div>
      </div>
    </div>
  );
}
