'use client';

import Link from 'next/link';
import { categoryTag, statusTag } from './utils';
import StatusSheet from './StatusSheet';
import { ClientRequest } from '@/app/actions';
import { useState } from 'react';

export default function TaskCard({ task, lastViewed }: { task: ClientRequest; lastViewed?: number }) {
  const [status, setStatus] = useState(task.status);
  const hasMedia = task.media_urls && task.media_urls.length > 0;
  const cat = categoryTag(task.category);
  const firstLine = task.content.split('\n')[0];
  const truncated = firstLine.length > 120 ? firstLine.substring(0, 120) + '…' : firstLine;

  return (
    <Link href={`/task/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="task-card" style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-light)',
        gap: 8,
        minHeight: 42,
      }}>
        {/* Status checkbox-style indicator */}
        <div onClick={e => e.preventDefault()} style={{ flexShrink: 0 }}>
          <StatusSheet taskId={task.id} currentStatus={status} onStatusChanged={setStatus} />
        </div>

        {/* Title */}
        <div style={{
          flex: 1,
          minWidth: 0,
          fontSize: 14,
          color: status === 'Done' ? 'var(--text-muted)' : 'var(--text)',
          textDecoration: status === 'Done' ? 'line-through' : 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {truncated}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {hasMedia && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📎</span>
          )}
          <span style={{
            background: cat.bg, color: cat.color,
            padding: '1px 6px', borderRadius: 4,
            fontSize: 11, fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            {cat.label}
          </span>
          <span className="task-id-col" style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap',
          }}>
            #{task.id}
          </span>
        </div>
      </div>
    </Link>
  );
}
