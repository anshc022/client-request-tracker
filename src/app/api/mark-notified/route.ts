import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_3sfBPupIrdX0@ep-empty-base-a45izwen-pooler.us-east-1.aws.neon.tech/neondb',
  ssl: {
    rejectUnauthorized: false
  }
});

// POST /api/mark-notified
// Body: { id: <task_id> }
// Sets last_notified_status = status for that task
export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing ID' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    try {
      // Update last_notified_status to match current status
      await client.query(`
        UPDATE client_requests
        SET last_notified_status = status
        WHERE id = $1
      `, [id]);
      
      return NextResponse.json({ success: true, updated_id: id });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error marking notification:', error);
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  }
}
