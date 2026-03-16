'use client';

import { Home, Clock, CheckCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: { all: number; active: number; done: number };
}

export default function BottomNav({ activeTab, onTabChange, counts }: BottomNavProps) {
  const items = [
    { id: 'all', icon: Home, label: 'All', count: counts.all },
    { id: 'active', icon: Clock, label: 'Active', count: counts.active },
    { id: 'done', icon: CheckCircle, label: 'Done', count: counts.done },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '6px 0 env(safe-area-inset-bottom, 8px)',
      zIndex: 40,
      boxShadow: '0 -1px 4px rgba(0,0,0,0.04)',
    }}>
      {items.map(item => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: 11,
              fontWeight: isActive ? 600 : 400,
              padding: '4px 16px',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={20} />
              {item.count > 0 && item.id === 'active' && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -10,
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                }}>
                  {item.count}
                </span>
              )}
            </div>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
