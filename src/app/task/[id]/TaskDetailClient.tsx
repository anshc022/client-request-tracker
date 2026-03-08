'use client';

import { useState } from 'react';
import StatusSheet from '@/components/StatusSheet';
import { ClientRequest } from '@/app/actions';

export default function TaskDetailClient({ task }: { task: ClientRequest }) {
  const [status, setStatus] = useState(task.status);
  const date = new Date(task.created_at);
  const hasMedia = task.media_urls && task.media_urls.length > 0;

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <StatusSheet taskId={task.id} currentStatus={status} onStatusChanged={setStatus} />

      <h1 style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.4 }}>{task.content}</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
        <span>Client</span>
        <span>·</span>
        <span>{task.category}</span>
        <span>·</span>
        <span>{date.toLocaleDateString()}</span>
        <span>·</span>
        <span>{date.toLocaleTimeString()}</span>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Original Message</h2>
        <blockquote style={{ borderLeft: '3px solid var(--primary)', background: '#F1F5F9', padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
          {task.content}
        </blockquote>
        {hasMedia && (
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>🎙 Transcribed from voice note</p>
        )}
      </div>

      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Activity</h2>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>
          <p>Created · {date.toLocaleDateString()} {date.toLocaleTimeString()}</p>
          <p style={{ marginTop: 4 }}>Current status: {status}</p>
        </div>
      </div>
    </div>
  );
}
