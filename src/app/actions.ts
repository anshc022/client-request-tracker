'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Interface for type safety
interface ClientRequest {
  id: number;
  content: string;
  category: string;
  status: string;
  created_at: string;
}

export async function getRequests(): Promise<ClientRequest[]> {
  try {
    // Attempt to create table if it doesn't exist (for fresh deployments)
    await query(`
      CREATE TABLE IF NOT EXISTS client_requests (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        category TEXT,
        status TEXT DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const result = await query('SELECT * FROM client_requests ORDER BY created_at DESC');
    return result.rows as ClientRequest[];
  } catch (e) {
    console.error("Failed to fetch requests or init table:", e);
    return [];
  }
}

export async function updateStatus(id: number, newStatus: string) {
  try {
    await query(
      'UPDATE client_requests SET status = $1 WHERE id = $2',
      [newStatus, id]
    );
    revalidatePath('/');
  } catch (e) {
    console.error("Failed to update status:", e);
    throw new Error('Failed to update status');
  }
}

export async function checkDbConnection(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (e) {
    console.error("DB Connection check failed:", e);
    return false;
  }
}
