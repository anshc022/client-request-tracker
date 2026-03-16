'use client';

import Link from 'next/link';
import { relativeTime, categoryColor, statusColor, truncate } from './utils';
import StatusSheet from './StatusSheet';
import { ClientRequest } from '@/app/actions';
import { useState } from 'react';
import { Paperclip, MessageCircle } from 'lucide-react';

export default function TaskCard({ task, lastViewed }: { task: ClientRequest; lastViewed?: number }) {
  const [status, setStatus] = useState(task.status);
  const hasMedia = task.media_urls && task.media_urls.length > 0;
  const mediaCount = task.media_urls?.length || 0;
  const isNew = lastViewed ? new Date(task.created_at).getTime() > lastViewed : false;

  const firstLine = task.content.split('\n')[0];

  return (
    <div className="task-card" style={{
      background: 'var(--surface)',
      borderRadius: 10,
      border: '1px solid var(--border)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Unread indicator */}
      {isNew && (
        <div style={{
          position: 'absolute',
          top: 16,
          right: 12,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--unread)',
        }} />
      )}

      {/* Category color bar */}
      <div style={{
        height: 3,
        background: categoryColor(task.category),
        opacity: 0.8,
      }} />

      <Link href={`/task/${task.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '12px 14px' }}>
        {/* Top row: ID + Category + Time */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--primary-dark)',
              background: '#E8F5F3',
              padding: '2px 8px',
              borderRadius: 4,
            }}>
              #{task.id}
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: task.category === 'Bug' ? '#DC2626' : '#059669',
              background: task.category === 'Bug' ? '#FEF2F2' : '#F0FDF4',
              padding: '2px 8px',
              borderRadius: 4,
            }}>
              {task.category === 'Bug' ? '🐛 Bug' : '✨ Feature'}
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
            {relativeTime(task.created_at)}
          </span>
        </div>

        {/* Title */}
        <p style={{
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.4,
          color: 'var(--text)',
          marginBottom: 8,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {truncate(firstLine, 120)}
        </p>

        {/* Bottom row: Status + Media + Source */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div onClick={e => e.preventDefault()}>
            <StatusSheet taskId={task.id} currentStatus={status} onStatusChanged={setStatus} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-light)', fontSize: 12 }}>
            {hasMedia && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Paperclip size={12} />
                {mediaCount}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MessageCircle size={12} />
              Client
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
