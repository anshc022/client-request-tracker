'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addRequest(formData: FormData) {
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  
  if (content && category) {
    try {
      // Ensure table exists on first write if not already
      await query(`
        CREATE TABLE IF NOT EXISTS client_requests (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          category TEXT,
          status TEXT DEFAULT 'New',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await query(
        'INSERT INTO client_requests (content, category, status) VALUES ($1, $2, $3)',
        [content, category, 'New']
      );
      revalidatePath('/');
    } catch (e) {
      console.error("Failed to add request:", e);
      throw new Error('Failed to add request');
    }
  }
}
