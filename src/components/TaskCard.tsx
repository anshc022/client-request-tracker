'use client';

import Link from 'next/link';
import { categoryTag, statusTag } from './utils';
import StatusSheet from './StatusSheet';
import { ClientRequest } from '@/app/actions';
import { useState } from 'react';

export default function TaskCard({ 
  task, 
  lastViewed, 
  viewMode = 'list' 
}: { 
  task: ClientRequest; 
  lastViewed?: number; 
  viewMode?: 'list' | 'grid' | 'kanban' 
}) {
  const [status, setStatus] = useState(task.status);
  const hasMedia = task.media_urls && task.media_urls.length > 0;
  const firstLine = task.content.split('\n')[0];
  const truncated = firstLine.length > 120 ? firstLine.substring(0, 120) + '…' : firstLine;
  const createdDate = new Date(task.created_at);
  const isNew = lastViewed && createdDate.getTime() > lastViewed;

  // Status color mapping
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'to do':
        return { bg: 'var(--tag-yellow)', color: 'var(--tag-yellow-text)' };
      case 'in progress':
        return { bg: 'var(--tag-blue)', color: 'var(--tag-blue-text)' };
      case 'urgent':
        return { bg: 'var(--tag-red)', color: 'var(--tag-red-text)' };
      case 'done':
        return { bg: 'var(--tag-green)', color: 'var(--tag-green-text)' };
      case 'approved':
        return { bg: 'var(--tag-purple)', color: 'var(--tag-purple-text)' };
      default:
        return { bg: 'var(--tag-gray)', color: 'var(--tag-gray-text)' };
    }
  };

  const statusStyle = getStatusStyle(status);

  if (viewMode === 'list') {
    return (
      <Link href={`/task/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '8px',
          borderBottom: '1px solid var(--border-light)',
          cursor: 'pointer',
          gap: '4px',
          minHeight: '44px'
        }}>
          {/* Status Column - Mobile optimized */}
          <div style={{ 
            width: '60px', 
            flexShrink: 0,
            textAlign: 'left'
          }}>
            <span style={{
              fontSize: '9px',
              background: statusStyle.bg,
              color: statusStyle.color,
              padding: '2px 4px',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '56px'
            }}>
              {status}
            </span>
          </div>
          
          {/* Title Column - Takes most space */}
          <div style={{ 
            flex: 1, 
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {isNew && (
              <div style={{ 
                width: '4px', 
                height: '4px', 
                backgroundColor: 'var(--primary)', 
                borderRadius: '50%', 
                flexShrink: 0 
              }} />
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{
                fontSize: '12px',
                color: 'var(--text)',
                lineHeight: '1.3',
                wordBreak: 'break-word',
                display: 'inline-block',
                whiteSpace: 'normal',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxHeight: '32px'
              }}>
                {truncated}
              </span>
              {hasMedia && (
                <div style={{ 
                  fontSize: '9px', 
                  color: 'var(--text-light)', 
                  marginTop: '1px' 
                }}>
                  {task.media_urls?.length}f
                </div>
              )}
            </div>
          </div>
          
          {/* Type Column - Condensed */}
          <div style={{ 
            width: '50px', 
            flexShrink: 0,
            textAlign: 'center'
          }}>
            <span style={{
              fontSize: '10px',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {task.category === 'Bug' ? 'Bug' : 'Feat'}
            </span>
          </div>
          
          {/* Date Column - Very compact */}
          <div style={{ 
            width: '60px', 
            flexShrink: 0,
            textAlign: 'center'
          }}>
            <span style={{
              fontSize: '10px',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              display: 'inline-block'
            }}>
              {createdDate.getDate()}/{createdDate.toLocaleDateString('en-GB', { month: 'short' })}
            </span>
          </div>
          
          {/* ID Column - Minimal */}
          <div style={{ 
            width: '35px', 
            flexShrink: 0,
            textAlign: 'right'
          }}>
            <span style={{
              fontSize: '10px',
              color: 'var(--text-light)',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'nowrap',
              display: 'inline-block'
            }}>
              {task.id}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (viewMode === 'kanban') {
    return (
      <Link href={`/task/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '12px',
          cursor: 'pointer',
          transition: 'background 80ms ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{
              fontSize: '10px',
              background: statusStyle.bg,
              color: statusStyle.color,
              padding: '2px 6px',
              borderRadius: '3px',
              fontWeight: 500
            }}>
              {status}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>#{task.id}</span>
          </div>
          <p style={{
            fontSize: '13px',
            color: 'var(--text)',
            marginBottom: '8px',
            lineHeight: '1.4',
            wordBreak: 'break-word'
          }}>
            {truncated}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>{createdDate.getDate()}/{createdDate.toLocaleDateString('en-GB', { month: 'short' })}</span>
            {hasMedia && <span>{task.media_urls?.length} files</span>}
          </div>
          {isNew && (
            <div style={{ width: '100%', height: '2px', background: 'var(--primary)', marginTop: '8px', borderRadius: '1px' }} />
          )}
        </div>
      </Link>
    );
  }

  // Grid view (default)
  return (
    <Link href={`/task/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '16px',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background 80ms ease',
        minHeight: '180px'
      }}>
        {/* Header with status and ID */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{
            fontSize: '11px',
            background: statusStyle.bg,
            color: statusStyle.color,
            padding: '3px 8px',
            borderRadius: '4px',
            fontWeight: 500
          }}>
            {status}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>#{task.id}</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, marginBottom: '12px' }}>
          <p style={{
            fontSize: '14px',
            color: 'var(--text)',
            lineHeight: '1.4',
            wordBreak: 'break-word',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {task.content}
          </p>
        </div>

        {/* Footer with category, date and files */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-light)',
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              background: task.category === 'Bug' ? 'var(--tag-red)' : 'var(--tag-blue)',
              color: task.category === 'Bug' ? 'var(--tag-red-text)' : 'var(--tag-blue-text)',
              padding: '2px 6px',
              borderRadius: '3px',
              fontWeight: 500
            }}>
              {task.category}
            </span>
            {isNew && (
              <div style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }} />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            {hasMedia && <span>{task.media_urls?.length} files</span>}
            <span>{createdDate.getDate()}/{createdDate.toLocaleDateString('en-GB', { month: 'short' })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}