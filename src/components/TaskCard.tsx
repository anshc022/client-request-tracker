'use client';

import Link from 'next/link';
import { categoryTag, statusTag } from './utils';
import StatusSheet from './StatusSheet';
import { ClientRequest } from '@/app/actions';
import { useState } from 'react';

export default function TaskCard({ 
  task, 
  lastViewed, 
  viewMode = 'grid' 
}: { 
  task: ClientRequest; 
  lastViewed?: number; 
  viewMode?: 'list' | 'grid' | 'kanban' 
}) {
  const [status, setStatus] = useState(task.status);
  const hasMedia = task.media_urls && task.media_urls.length > 0;
  const cat = categoryTag(task.category);
  const st = statusTag(status);
  const firstLine = task.content.split('\n')[0];
  const truncated = firstLine.length > 120 ? firstLine.substring(0, 120) + '…' : firstLine;
  const createdDate = new Date(task.created_at);
  const isNew = lastViewed && createdDate.getTime() > lastViewed;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done': return '✅';
      case 'In Progress': return '⚙️';
      case 'Urgent': return '🚨';
      case 'Pending': case 'To Do': return '⏳';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'In Progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 animate-pulse';
      case 'Pending': case 'To Do': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Bug': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'Feature': case 'New Feature': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/task/${task.id}`} className="block hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="grid grid-cols-12 gap-4 items-center px-6 py-4">
          <div className="col-span-1">
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
              <span>{getStatusIcon(status)}</span>
              <span className="hidden sm:inline">{status}</span>
            </span>
          </div>
          <div className="col-span-6">
            <div className="flex items-start gap-3">
              {isNew && (
                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                  {truncated}
                </p>
                {hasMedia && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-slate-500">📎</span>
                    <span className="text-xs text-slate-500">{task.media_urls?.length} attachments</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(task.category)}`}>
              {task.category}
            </span>
          </div>
          <div className="col-span-2 text-xs text-slate-500 dark:text-slate-400">
            {createdDate.toLocaleDateString()}
          </div>
          <div className="col-span-1 text-right">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">#{task.id}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (viewMode === 'kanban') {
    return (
      <Link href={`/task/${task.id}`} className="block">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-md transition-all transform hover:scale-[1.02]">
          <div className="flex items-start justify-between mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(task.category)}`}>
              {task.category}
            </span>
            <span className="text-xs font-mono text-slate-400">#{task.id}</span>
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-2 line-clamp-3">
            {firstLine}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{createdDate.toLocaleDateString()}</span>
            {hasMedia && <span>📎 {task.media_urls?.length}</span>}
          </div>
          {isNew && (
            <div className="w-full h-0.5 bg-blue-500 rounded-full mt-2"></div>
          )}
        </div>
      </Link>
    );
  }

  // Grid view (default)
  return (
    <Link href={`/task/${task.id}`} className="block group">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-all transform group-hover:scale-[1.02] group-hover:border-blue-300 dark:group-hover:border-blue-600 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(task.category)}`}>
              {task.category}
            </span>
            {isNew && (
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            )}
          </div>
          <span className="text-xs font-mono text-slate-400">#{task.id}</span>
        </div>

        {/* Content */}
        <div className="flex-1 mb-4">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2 line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {firstLine}
          </h3>
          {task.content.split('\n').length > 1 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {task.content.split('\n').slice(1, 3).join(' ').substring(0, 100)}...
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
            <span>{getStatusIcon(status)}</span>
            <span>{status}</span>
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {hasMedia && (
              <span className="flex items-center gap-1">
                📎 {task.media_urls?.length}
              </span>
            )}
            <span>{createdDate.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}