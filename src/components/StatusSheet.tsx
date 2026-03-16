'use client';

import { useState } from 'react';
import { updateStatus } from '@/app/actions';

interface Props {
  taskId: number;
  currentStatus: string;
  onStatusChanged?: (newStatus: string) => void;
}

const statusConfig: Record<string, { bg: string; color: string; icon: string }> = {
  'Pending': { bg: '#F1F5F9', color: '#64748B', icon: '○' },
  'In Progress': { bg: '#FEF3C7', color: '#D97706', icon: '⏳' },
  'Done': { bg: '#D1FAE5', color: '#059669', icon: '✓✓' },
};

export default function StatusSheet({ taskId, currentStatus, onStatusChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const statuses = ['Pending', 'In Progress', 'Done'];
  const config = statusConfig[currentStatus] || statusConfig['Pending'];

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
          borderRadius: 20,
          padding: '4px 12px',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <span>{config.icon}</span>
        {currentStatus}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>

      {/* Bottom Sheet */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setOpen(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', animation: 'fadeIn 0.15s ease' }} />
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              background: 'var(--surface)',
              borderRadius: '16px 16px 0 0',
              padding: '16px',
              width: '100%',
              maxWidth: 480,
              animation: 'slideUp 0.25s ease-out',
            }}
          >
            {/* Handle */}
            <div style={{ width: 36, height: 4, background: '#D1D5DB', borderRadius: 2, margin: '0 auto 16px' }} />

            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>Change Status</h3>

            {statuses.map(s => {
              const sConfig = statusConfig[s];
              const isActive = s === currentStatus;
              return (
                <button
                  key={s}
                  onClick={() => handleSelect(s)}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '14px 12px',
                    background: isActive ? sConfig.bg : 'transparent',
                    border: 'none',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: 15,
                    color: 'var(--text)',
                    marginBottom: 4,
                  }}
                >
                  <span style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: isActive ? 'none' : '2px solid var(--border)',
                    background: isActive ? sConfig.color : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    color: '#fff',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {isActive && '✓'}
                  </span>
                  <span style={{ fontWeight: isActive ? 600 : 400 }}>{s}</span>
                </button>
              );
            })}

            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: 8,
                width: '100%',
                padding: '12px',
                background: 'var(--bg)',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--primary-dark)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          zIndex: 100,
          whiteSpace: 'nowrap',
          animation: 'fadeIn 0.2s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toast}
        </div>
      )}
    </>
  );
}
