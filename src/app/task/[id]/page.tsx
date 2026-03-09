import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getRequestById, getTaskLogs } from '@/app/actions';
import { notFound } from 'next/navigation';
import TaskDetailClient from './TaskDetailClient';

export const dynamic = 'force-dynamic';

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getRequestById(Number(id));
  if (!task) notFound();
  
  const logs = await getTaskLogs(Number(id));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ color: 'var(--text)', display: 'flex' }}><ArrowLeft size={20} /></Link>
        <span style={{ fontSize: 16, fontWeight: 600 }}>Task Detail</span>
      </header>

      <TaskDetailClient task={task} logs={logs} />
    </div>
  );
}
