'use client';

import { useState } from 'react';
import { updateStatus } from '@/app/actions';

interface Props {
  taskId: number;
  currentStatus: string;
  onStatusChanged?: (newStatus: string) => void;
}

export default function StatusSheet({ taskId, currentStatus, onStatusChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const statuses = ['Pending', 'In Progress', 'Done'];

  const handleSelect = async (status: string) => {
    if (status === currentStatus) { setOpen(false); return; }
    setLoading(true);
    try {
      await updateStatus(taskId, status);
      onStatusChanged?.(status);
      setOpen(false);
      setToast(`Moved to ${status} · WhatsApp notified ✓`);
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = currentStatus === 'Done' ? 'var(--success)' : currentStatus === 'In Progress' ? 'var(--accent)' : 'var(--text-muted)';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ background: statusColor, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
      >
        {currentStatus}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setOpen(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', background: 'var(--surface)', borderRadius: '16px 16px 0 0', padding: '20px 16px', width: '100%', maxWidth: 480, animation: 'slideUp 0.2s ease-out' }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Change Status</h3>
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--text)' }}
              >
                <span style={{ width: 20, height: 20, borderRadius: '50%', border: s === currentStatus ? '6px solid var(--primary)' : '2px solid var(--border)', display: 'inline-block' }} />
                {s}
              </button>
            ))}
            <button
              onClick={() => setOpen(false)}
              style={{ marginTop: 8, width: '100%', padding: '12px', background: 'var(--bg)', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'var(--text)', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 100, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </>
  );
}
