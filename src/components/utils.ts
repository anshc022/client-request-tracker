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

export function categoryColor(cat: string): { bg: string; color: string; label: string } {
  return cat === 'Bug'
    ? { bg: '#FEF2F2', color: '#DC2626', label: 'Bug' }
    : { bg: '#EEF2FF', color: '#4F46E5', label: 'Feature' };
}

export function statusConfig(status: string): { bg: string; color: string; dot: string; label: string } {
  switch (status) {
    case 'Done': return { bg: '#ECFDF5', color: '#059669', dot: '#10B981', label: 'Done' };
    case 'In Progress': return { bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B', label: 'In Progress' };
    default: return { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF', label: 'Pending' };
  }
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.substring(0, len).trim() + '…';
}
