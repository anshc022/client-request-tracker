import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getStats, getRequests } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const stats = await getStats();
  const tasks = await getRequests();

  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const done = tasks.filter(t => t.status === 'Done').length;

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
      <header style={{
        height: 45,
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        fontSize: 14,
      }}>
        <Link href="/" style={{
          color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center',
          padding: '4px 6px', borderRadius: 4,
          textDecoration: 'none', fontSize: 13, gap: 4,
        }}>
          <ArrowLeft size={16} />
          Tasks
        </Link>
        <span style={{ color: 'var(--text-light)', fontSize: 13 }}>/</span>
        <span style={{ color: 'var(--text)', fontWeight: 500, fontSize: 13 }}>Dashboard</span>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 48px' }}>
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
          📊 Dashboard
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32 }}>
          Overview of all tasks and activity
        </div>

        {/* Summary row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 1,
          background: 'var(--border)',
          borderRadius: 6,
          overflow: 'hidden',
          marginBottom: 32,
        }}>
          {[
            { label: 'Open', value: stats.open, emoji: '🔴' },
            { label: 'Today', value: stats.today, emoji: '📅' },
            { label: 'Done (week)', value: stats.doneThisWeek, emoji: '✅' },
            { label: 'Total', value: stats.total, emoji: '📋' },
          ].map(c => (
            <div key={c.label} style={{ background: 'var(--bg)', padding: '20px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {c.emoji} {c.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Status breakdown */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>
            By Status
          </div>
          {[
            { label: 'Pending', count: pending, tag: 'var(--tag-gray)', tagText: 'var(--tag-gray-text)' },
            { label: 'In Progress', count: inProgress, tag: 'var(--tag-yellow)', tagText: 'var(--tag-yellow-text)' },
            { label: 'Done', count: done, tag: 'var(--tag-green)', tagText: 'var(--tag-green-text)' },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 0',
              borderBottom: '1px solid var(--border-light)',
            }}>
              <span style={{
                background: s.tag, color: s.tagText,
                padding: '1px 8px', borderRadius: 4,
                fontSize: 12, fontWeight: 500, width: 90, textAlign: 'center',
              }}>
                {s.label}
              </span>
              <div style={{ flex: 1, height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: stats.total > 0 ? `${(s.count / stats.total) * 100}%` : '0%',
                  background: s.tag,
                  borderRadius: 4,
                  minWidth: s.count > 0 ? 4 : 0,
                }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, width: 30, textAlign: 'right', color: 'var(--text-secondary)' }}>
                {s.count}
              </span>
            </div>
          ))}
        </div>

        {/* Weekly activity */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>
            This Week
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 8px' }}>
            {dailyCounts.map((d, i) => (
              <div key={i} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                height: '100%',
                justifyContent: 'flex-end',
              }}>
                {d.count > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{d.count}</span>
                )}
                <div style={{
                  width: '100%',
                  maxWidth: 40,
                  height: d.count > 0 ? `${Math.max((d.count / maxDaily) * 80, 8)}px` : '4px',
                  background: d.count > 0 ? 'var(--primary)' : 'var(--bg-hover)',
                  borderRadius: 3,
                }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Type split */}
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>
            By Type
          </div>
          <div style={{
            display: 'flex', gap: 1,
            background: 'var(--border)',
            borderRadius: 6,
            overflow: 'hidden',
          }}>
            <div style={{
              flex: stats.bugs || 1,
              background: 'var(--bg)',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--tag-red-text)' }}>{stats.bugs}</div>
              <div style={{
                marginTop: 4,
                display: 'inline-block',
                background: 'var(--tag-red)',
                color: 'var(--tag-red-text)',
                padding: '1px 8px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500,
              }}>Bugs</div>
            </div>
            <div style={{
              flex: stats.features || 1,
              background: 'var(--bg)',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--tag-purple-text)' }}>{stats.features}</div>
              <div style={{
                marginTop: 4,
                display: 'inline-block',
                background: 'var(--tag-purple)',
                color: 'var(--tag-purple-text)',
                padding: '1px 8px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500,
              }}>Features</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
