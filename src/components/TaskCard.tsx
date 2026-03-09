'use client';

import Link from 'next/link';
import { relativeTime, categoryColor } from './utils';
import StatusSheet from './StatusSheet';
import { ClientRequest } from '@/app/actions';
import { useState } from 'react';
import { Paperclip } from 'lucide-react';

export default function TaskCard({ task }: { task: ClientRequest }) {
  const [status, setStatus] = useState(task.status);
  const hasMedia = task.media_urls && task.media_urls.length > 0;

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 }}>#{task.id}</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: categoryColor(task.category), display: 'inline-block', marginLeft: 4 }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>{task.category}</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{relativeTime(task.created_at)}</span>
      </div>

      <Link href={`/task/${task.id}`} style={{ textDecoration: 'none', color: 'var(--text)' }}>
        <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.content}
        </p>
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusSheet taskId={task.id} currentStatus={status} onStatusChanged={setStatus} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
          {hasMedia && <Paperclip size={14} />}
          <span>Client</span>
        </div>
      </div>
    </div>
  );
}
