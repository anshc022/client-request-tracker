'use client';

import Link from 'next/link';
import { relativeTime, categoryColor, statusConfig, truncate } from './utils';
import StatusSheet from './StatusSheet';
import { ClientRequest } from '@/app/actions';
import { useState } from 'react';
import { Paperclip, ChevronRight } from 'lucide-react';

export default function TaskCard({ task, lastViewed }: { task: ClientRequest; lastViewed?: number }) {
  const [status, setStatus] = useState(task.status);
  const hasMedia = task.media_urls && task.media_urls.length > 0;
  const mediaCount = task.media_urls?.length || 0;
  const cat = categoryColor(task.category);
  const stConfig = statusConfig(status);
  const firstLine = task.content.split('\n')[0];

  return (
    <Link href={`/task/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="task-card" style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: '14px 16px',
        position: 'relative',
        animation: 'fadeInUp 0.2s ease',
      }}>
        {/* Top row: task id + category + time */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}>
              PING-{task.id}
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: cat.color,
              background: cat.bg,
              padding: '2px 8px',
              borderRadius: 4,
            }}>
              {cat.label}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
            {relativeTime(task.created_at)}
          </span>
        </div>

        {/* Title */}
        <p style={{
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.5,
          color: status === 'Done' ? 'var(--text-muted)' : 'var(--text)',
          textDecoration: status === 'Done' ? 'line-through' : 'none',
          marginBottom: 10,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {truncate(firstLine, 140)}
        </p>

        {/* Bottom row: status + meta */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div onClick={e => e.preventDefault()}>
            <StatusSheet taskId={task.id} currentStatus={status} onStatusChanged={setStatus} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-light)', fontSize: 12 }}>
            {hasMedia && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Paperclip size={13} />
                {mediaCount}
              </span>
            )}
            <ChevronRight size={16} color="var(--text-light)" />
          </div>
        </div>
      </div>
    </Link>
  );
}
