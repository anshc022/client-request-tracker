'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock, CheckCircle } from 'lucide-react';

const items = [
  { href: '/', icon: Home, label: 'Tasks' },
  { href: '/?filter=active', icon: Clock, label: 'Active' },
  { href: '/?filter=done', icon: CheckCircle, label: 'Done' },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around', padding: '8px 0 env(safe-area-inset-bottom, 8px)', zIndex: 40 }}>
      {items.map(item => {
        const isActive = item.href === '/' ? path === '/' : false;
        const Icon = item.icon;
        return (
          <Link key={item.label} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}>
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
