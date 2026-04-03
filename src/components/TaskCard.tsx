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
        <div className="notion-row" style={{
          padding: '12px 48px',
          borderBottom: '1px solid var(--border-light)',
          cursor: 'pointer',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            minHeight: 40,
          }}>
            <div style={{ width: 80, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
              <span style={{
                background: 'var(--tag-gray)',
                color: 'var(--tag-gray-text)',
                padding: '2px 8px',
                borderRadius: 'var(--radius)',
                fontSize: 11,
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}>
                {status}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              {isNew && <div style={{ width: 6, height: 6, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />}
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{
                  fontSize: 14,
                  color: 'var(--text)',
                  wordBreak: 'break-word',
                  lineHeight: '1.4',
                  margin: 0,
                }}>
                  {truncated}
                </p>
                {hasMedia && (
                  <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2, display: 'block' }}>
                    {task.media_urls?.length} files
                  </span>
                )}
              </div>
            </div>
            <div style={{ width: 80, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
              <span style={{
                background: task.category === 'Bug' ? 'var(--tag-red)' : 'var(--tag-blue)',
                color: task.category === 'Bug' ? 'var(--tag-red-text)' : 'var(--tag-blue-text)',
                padding: '2px 8px',
                borderRadius: 'var(--radius)',
                fontSize: 11,
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}>
                {task.category}
              </span>
            </div>
            <div style={{ width: 90, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              {createdDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </div>
            <div style={{ width: 60, textAlign: 'center', fontSize: 12, color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
              #{task.id}
            </div>
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