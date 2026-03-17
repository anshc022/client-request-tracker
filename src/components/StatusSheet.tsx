'use client';

import { useState } from 'react';
import { updateStatus } from '@/app/actions';
import { statusTag } from './utils';

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
  const tag = statusTag(currentStatus);

  const handleSelect = async (status: string) => {
    if (status === currentStatus) { setOpen(false); return; }
    setLoading(true);
    try {
      await updateStatus(taskId, status);
      onStatusChanged?.(status);
      setOpen(false);
      setToast(`Changed to ${status}`);
      setTimeout(() => setToast(null), 2000);
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
          background: tag.bg,
          color: tag.color,
          border: 'none',
          borderRadius: 4,
          padding: '2px 8px',
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          lineHeight: '20px',
        }}
      >
        {currentStatus}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }} onClick={() => setOpen(false)}>
          <div style={{ position: 'absolute', inset: 0 }} />
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow)',
              padding: '6px',
              width: 220,
              animation: 'fadeIn 0.1s ease',
            }}
          >
            <div style={{ padding: '6px 8px 4px', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Status
            </div>
            {statuses.map(s => {
              const sTag = statusTag(s);
              const isActive = s === currentStatus;
              return (
                <button
                  key={s}
                  onClick={() => handleSelect(s)}
                  disabled={loading}
                  className="notion-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '6px 8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: 'var(--text)',
                    background: 'transparent',
                  }}
                >
                  <span style={{
                    background: sTag.bg, color: sTag.color,
                    padding: '1px 6px', borderRadius: 'var(--radius)',
                    fontSize: 12, fontWeight: 500,
                  }}>
                    {s}
                  </span>
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 'auto' }}><path d="M5 12l5 5L20 7"/></svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--text)', color: '#fff',
          padding: '6px 16px', borderRadius: 'var(--radius)',
          fontSize: 13, zIndex: 1100, animation: 'fadeIn 0.15s ease',
        }}>
          {toast}
        </div>
      )}
    </>
  );
}
