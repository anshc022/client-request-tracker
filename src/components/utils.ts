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
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function categoryTag(cat: string): { bg: string; color: string; label: string } {
  return cat === 'Bug'
    ? { bg: 'var(--tag-red)', color: 'var(--tag-red-text)', label: 'Bug' }
    : { bg: 'var(--tag-purple)', color: 'var(--tag-purple-text)', label: 'Feature' };
}

export function statusTag(status: string): { bg: string; color: string; label: string } {
  switch (status) {
    case 'Done': return { bg: 'var(--tag-green)', color: 'var(--tag-green-text)', label: 'Done' };
    case 'In Progress': return { bg: 'var(--tag-yellow)', color: 'var(--tag-yellow-text)', label: 'In Progress' };
    default: return { bg: 'var(--tag-gray)', color: 'var(--tag-gray-text)', label: 'Pending' };
  }
}
