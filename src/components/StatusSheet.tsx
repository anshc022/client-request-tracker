'use client';

import { useState } from 'react';
import { updateStatus } from '@/app/actions';
import { statusConfig } from './utils';

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
  const config = statusConfig(currentStatus);

  const handleSelect = async (status: string) => {
    if (status === currentStatus) { setOpen(false); return; }
    setLoading(true);
    try {
      await updateStatus(taskId, status);
      onStatusChanged?.(status);
      setOpen(false);
      setToast(`Moved to ${status}`);
      setTimeout(() => setToast(null), 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="status-pill"
        onClick={() => setOpen(true)}
        style={{
          background: config.bg,
          color: config.color,
          border: 'none',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: config.dot,
          flexShrink: 0,
        }} />
        {currentStatus}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setOpen(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', animation: 'fadeIn 0.15s ease' }} />
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              background: 'var(--surface)',
              borderRadius: '16px 16px 0 0',
              padding: '16px',
              width: '100%',
              maxWidth: 400,
              animation: 'slideUp 0.25s ease-out',
            }}
          >
            <div style={{ width: 36, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>Update Status</h3>

            {statuses.map(s => {
              const sConfig = statusConfig(s);
              const isActive = s === currentStatus;
              return (
                <button
                  key={s}
                  onClick={() => handleSelect(s)}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '12px',
                    background: isActive ? sConfig.bg : 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: 'var(--text)',
                    fontWeight: isActive ? 600 : 400,
                    marginBottom: 4,
                    transition: 'background 0.15s ease',
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: isActive ? `5px solid ${sConfig.dot}` : '2px solid var(--border)',
                    display: 'block', flexShrink: 0,
                  }} />
                  {s}
                </button>
              );
            })}

            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: 8, width: '100%', padding: '10px',
                background: 'var(--bg)', border: 'none', borderRadius: 'var(--radius)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--text-muted)',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--text)', color: '#fff',
          padding: '10px 20px', borderRadius: 'var(--radius)',
          fontSize: 13, fontWeight: 500, zIndex: 100,
          whiteSpace: 'nowrap', animation: 'fadeIn 0.2s ease',
          boxShadow: 'var(--shadow-md)',
        }}>
          {toast}
        </div>
      )}
    </>
  );
}
