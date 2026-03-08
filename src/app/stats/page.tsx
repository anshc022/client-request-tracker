import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getStats } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const stats = await getStats();
  const bugPct = stats.total > 0 ? Math.round((stats.bugs / stats.total) * 100) : 0;
  const featurePct = 100 - bugPct;

  const cards = [
    { label: 'Open', value: stats.open, color: 'var(--primary)' },
    { label: 'Today', value: stats.today, color: 'var(--accent)' },
    { label: 'Done this week', value: stats.doneThisWeek, color: 'var(--success)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ color: 'var(--text)', display: 'flex' }}><ArrowLeft size={20} /></Link>
        <span style={{ fontSize: 16, fontWeight: 600 }}>Stats</span>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', padding: '20px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 36, fontWeight: 600, color: c.color }}>{c.value}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{c.label}</p>
          </div>
        ))}

        <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', padding: '16px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Bug vs Feature</p>
          <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 24 }}>
            {bugPct > 0 && <div style={{ width: `${bugPct}%`, background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 600 }}>{bugPct}%</div>}
            {featurePct > 0 && <div style={{ width: `${featurePct}%`, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 600 }}>{featurePct}%</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>🔴 Bugs ({stats.bugs})</span>
            <span>🔵 Features ({stats.features})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
