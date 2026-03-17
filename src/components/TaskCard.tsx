'use client';

import Link from 'next/link';
import { categoryTag, statusTag } from './utils';
import StatusSheet from './StatusSheet';
import { ClientRequest } from '@/app/actions';
import { useState } from 'react';

export default function TaskCard({ task, lastViewed, viewMode = 'list' }: { task: ClientRequest; lastViewed?: number; viewMode?: 'list' | 'grid' }) {
  const [status, setStatus] = useState(task.status);
  const hasMedia = task.media_urls && task.media_urls.length > 0;
  const cat = categoryTag(task.category);
  const st = statusTag(status);
  const firstLine = task.content.split('\n')[0];
  const truncated = firstLine.length > 120 ? firstLine.substring(0, 120) + '…' : firstLine;

  if (viewMode === 'grid') {
    return (
      <Link href={`/task/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="task-card" style={{
          padding: '16px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          height: '100%',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{
              background: cat.bg, color: cat.color,
              padding: '2px 6px', borderRadius: 4,
              fontSize: 11, fontWeight: 500,
            }}>
              {cat.label}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              #{task.id}
            </span>
          </div>
          
          {/* Title */}
          <div style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.5,
            color: status === 'Done' ? 'var(--text-muted)' : 'var(--text)',
            textDecoration: status === 'Done' ? 'line-through' : 'none',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {truncated}
          </div>

          {/* Bottom row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div onClick={e => e.preventDefault()}>
              <StatusSheet taskId={task.id} currentStatus={status} onStatusChanged={setStatus} />
            </div>
            {hasMedia && (
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📎</span>
            )}
          </div>
        </div>
      </Link>
    );
  }

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
        {/* Status */}
        <div onClick={e => e.preventDefault()} style={{ flexShrink: 0, width: 80 }}>
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
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          {truncated}
          {hasMedia && <span style={{ fontSize: 13, color: 'var(--text-light)' }}>📎</span>}
        </div>

        {/* Type */}
        <div style={{ width: 70, textAlign: 'center', flexShrink: 0 }}>
          <span style={{
            background: cat.bg, color: cat.color,
            padding: '1px 6px', borderRadius: 4,
            fontSize: 11, fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            {cat.label}
          </span>
        </div>

        {/* ID */}
        <div style={{
          width: 40,
          textAlign: 'right',
          flexShrink: 0,
          fontSize: 12,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          #{task.id}
        </div>
      </div>
    </Link>
  );
}
