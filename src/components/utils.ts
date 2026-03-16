'use client';

export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function categoryColor(cat: string): string {
  return cat === 'Bug' ? '#EF4444' : '#128C7E';
}

export function statusColor(status: string): string {
  switch (status) {
    case 'Done': return '#25D366';
    case 'In Progress': return '#F59E0B';
    default: return '#8696A0';
  }
}

export function statusIcon(status: string): string {
  switch (status) {
    case 'Done': return '✓✓';
    case 'In Progress': return '⏳';
    default: return '○';
  }
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.substring(0, len).trim() + '…';
}
