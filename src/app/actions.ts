'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface ClientRequest {
  id: number;
  content: string;
  category: string;
  status: string;
  media_urls: string[] | null;
  created_at: string;
  last_notified_status: string | null;
}

export interface TaskLog {
  id: number;
  task_id: number;
  content: string;
  created_at: string;
}

export async function getRequests(): Promise<ClientRequest[]> {
  const result = await query('SELECT * FROM client_requests ORDER BY created_at DESC');
  return result.rows as ClientRequest[];
}

export async function getRequestById(id: number): Promise<ClientRequest | null> {
  const result = await query('SELECT * FROM client_requests WHERE id = $1', [id]);
  return (result.rows[0] as ClientRequest) || null;
}

export async function getTaskLogs(taskId: number): Promise<TaskLog[]> {
  const result = await query('SELECT * FROM task_logs WHERE task_id = $1 ORDER BY created_at ASC', [taskId]);
  return result.rows as TaskLog[];
}

export async function addLog(taskId: number, content: string) {
  await query('INSERT INTO task_logs (task_id, content) VALUES ($1, $2)', [taskId, content]);
  revalidatePath(`/task/${taskId}`);
}

export async function updateStatus(id: number, newStatus: string) {
  await query('UPDATE client_requests SET status = $1 WHERE id = $2', [newStatus, id]);
  await query('INSERT INTO task_logs (task_id, content) VALUES ($1, $2)', [id, `Status changed to ${newStatus}`]);
  revalidatePath('/');
  revalidatePath(`/task/${id}`);
  revalidatePath('/stats');
}

export async function getStats() {
  const all = await query('SELECT * FROM client_requests');
  const rows = all.rows as ClientRequest[];
  const open = rows.filter(r => r.status !== 'Done').length;
  const today = rows.filter(r => {
    const d = new Date(r.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const doneThisWeek = rows.filter(r => r.status === 'Done' && new Date(r.created_at) >= weekAgo).length;
  const bugs = rows.filter(r => r.category === 'Bug').length;
  const features = rows.filter(r => r.category === 'Feature').length;
  return { open, today, doneThisWeek, bugs, features, total: rows.length };
}
