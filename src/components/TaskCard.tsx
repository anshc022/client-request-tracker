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
              fontSize: '10px',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
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
              {createdDate.getDate()}/{createdDate.getMonth() + 1}
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
      <Link href={`/task/${task.id}`} className="block">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
              {task.category}
            </span>
            <span className="text-xs text-gray-400">#{task.id}</span>
          </div>
          <p className="text-sm text-black dark:text-white mb-2">
            {firstLine}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{createdDate.toLocaleDateString()}</span>
            {hasMedia && <span>{task.media_urls?.length} files</span>}
          </div>
          {isNew && (
            <div className="w-full h-0.5 bg-black dark:bg-white mt-2"></div>
          )}
        </div>
      </Link>
    );
  }

  // Grid view (default)
  return (
    <Link href={`/task/${task.id}`} className="block">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
              {task.category}
            </span>
            {isNew && (
              <div className="w-2 h-2 bg-black dark:bg-white rounded-full"></div>
            )}
          </div>
          <span className="text-xs text-gray-400">#{task.id}</span>
        </div>

        {/* Content */}
        <div className="flex-1 mb-3">
          <h3 className="text-sm font-medium text-black dark:text-white mb-2">
            {firstLine}
          </h3>
          {task.content.split('\n').length > 1 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {task.content.split('\n').slice(1, 2).join(' ').substring(0, 80)}...
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
            {status}
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {hasMedia && <span>{task.media_urls?.length} files</span>}
            <span>{createdDate.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}