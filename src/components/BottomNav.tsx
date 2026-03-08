'use client';

import { Home, Clock, CheckCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const items = [
    { id: 'all', icon: Home, label: 'Tasks' },
    { id: 'active', icon: Clock, label: 'Active' },
    { id: 'done', icon: CheckCircle, label: 'Done' },
  ];

  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around', padding: '8px 0 env(safe-area-inset-bottom, 8px)', zIndex: 40 }}>
      {items.map(item => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        return (
          <button key={item.id} onClick={() => onTabChange(item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', color: isActive ? 'var(--primary)' : 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}>
            <Icon size={20} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
