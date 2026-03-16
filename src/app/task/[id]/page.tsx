import { getRequestById, getTaskLogs } from '@/app/actions';
import { notFound } from 'next/navigation';
import TaskDetailClient from './TaskDetailClient';

export const dynamic = 'force-dynamic';

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getRequestById(Number(id));
  if (!task) notFound();
  
  const logs = await getTaskLogs(Number(id));

  return <TaskDetailClient task={task} logs={logs} />;
}
