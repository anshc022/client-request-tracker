import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_3sfBPupIrdX0@ep-empty-base-a45izwen-pooler.us-east-1.aws.neon.tech/neondb',
  ssl: {
    rejectUnauthorized: false
  }
});

// GET /api/pending-notifications
// Returns list of tasks where status != last_notified_status (or last_notified_status is NULL)
export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM client_requests 
      WHERE status != last_notified_status 
         OR last_notified_status IS NULL
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json({ 
      success: true, 
      notifications: result.rows 
    });
  } catch (error) {
    console.error('Error fetching pending notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
