'use client';

import { useState, useEffect, useRef } from 'react';
import StatusSheet from '@/components/StatusSheet';
import { ClientRequest, TaskLog, addLog } from '@/app/actions';
import { Send, Paperclip, ArrowLeft, Clock, Tag } from 'lucide-react';
import Link from 'next/link';
import { relativeTime, categoryColor, statusConfig } from '@/components/utils';

function formatLogTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatLogDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function groupLogsByDate(logs: TaskLog[]) {
  const groups: { date: string; logs: TaskLog[] }[] = [];
  let currentDate = '';
  logs.forEach(log => {
    const date = formatLogDate(log.created_at);
    if (date !== currentDate) {
      currentDate = date;
      groups.push({ date, logs: [log] });
    } else {
      groups[groups.length - 1].logs.push(log);
    }
  });
  return groups;
}

export default function TaskDetailClient({ task, logs: initialLogs }: { task: ClientRequest, logs: TaskLog[] }) {
  const [status, setStatus] = useState(task.status);
  const [logs, setLogs] = useState(initialLogs);
  const [newLog, setNewLog] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const hasMedia = task.media_urls && task.media_urls.length > 0;
  const cat = categoryColor(task.category);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ping_last_viewed');
      const viewed = stored ? JSON.parse(stored) : {};
      viewed[task.id] = Date.now();
      localStorage.setItem('ping_last_viewed', JSON.stringify(viewed));
    } catch {}
  }, [task.id]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleAddLog = async () => {
    if (!newLog.trim()) return;
    setIsSubmitting(true);
    await addLog(task.id, newLog);
    setLogs([...logs, { id: Date.now(), task_id: task.id, content: newLog, created_at: new Date().toISOString() }]);
    setNewLog('');
    setIsSubmitting(false);
  };

  const logGroups = groupLogsByDate(logs);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        height: 56,
      }}>
        <Link href="/" style={{ color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>PING-{task.id}</span>
        </div>
        <StatusSheet taskId={task.id} currentStatus={status} onStatusChanged={setStatus} />
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px 120px' }}>
        {/* Task Info Card */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '20px',
          marginBottom: 20,
        }}>
          {/* Meta row */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 14,
            fontSize: 12,
          }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              color: cat.color, background: cat.bg,
              padding: '3px 10px', borderRadius: 6, fontWeight: 600,
            }}>
              <Tag size={12} />
              {cat.label}
            </span>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              color: 'var(--text-muted)', background: 'var(--bg)',
              padding: '3px 10px', borderRadius: 6,
            }}>
              <Clock size={12} />
              {new Date(task.created_at).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>

          {/* Content */}
          <p style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: 'var(--text)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {task.content}
          </p>

          {/* Attachments */}
          {hasMedia && (
            <div style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid var(--border-light)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Paperclip size={13} />
                {task.media_urls!.length} attachment{task.media_urls!.length > 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {task.media_urls!.map((url, i) => {
                  if (url.match(/\.(jpg|jpeg|png|webp)$/i)) {
                    return (
                      <div key={i} style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Attachment ${i + 1}`} style={{ width: '100%', maxHeight: 400, objectFit: 'contain', display: 'block', background: '#F9FAFB' }} />
                      </div>
                    );
                  }
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px',
                      background: 'var(--bg)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: 'var(--primary-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, flexShrink: 0,
                      }}>🎵</div>
                      <audio controls src={url} style={{ height: 36, flex: 1 }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Activity Section */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>Activity</span>
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-light)' }}>{logs.length} updates</span>
          </div>

          <div style={{ padding: '16px 20px' }}>
            {logs.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '32px 16px',
                color: 'var(--text-light)',
                fontSize: 13,
              }}>
                No activity yet. Add the first update below.
              </div>
            )}

            {logGroups.map(group => (
              <div key={group.date}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-light)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '12px 0 8px',
                }}>
                  {group.date}
                </div>

                {group.logs.map(log => {
                  const isStatusChange = log.content.startsWith('Status changed to');

                  return (
                    <div key={log.id} style={{
                      display: 'flex',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom: '1px solid var(--border-light)',
                    }}>
                      {/* Timeline dot */}
                      <div style={{ paddingTop: 4, flexShrink: 0 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: isStatusChange ? 'var(--primary)' : 'var(--border)',
                        }} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 14,
                          lineHeight: 1.6,
                          color: isStatusChange ? 'var(--text-muted)' : 'var(--text)',
                          fontStyle: isStatusChange ? 'italic' : 'normal',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}>
                          {log.content}
                        </p>
                        <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4, display: 'block' }}>
                          {formatLogTime(log.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            <div ref={logsEndRef} />
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 16px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}>
        <div style={{
          flex: 1,
          maxWidth: 768,
          margin: '0 auto',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="Add an update..."
            value={newLog}
            onChange={e => setNewLog(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddLog()}
            style={{
              flex: 1,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '10px 14px',
              fontSize: 13,
              color: 'var(--text)',
              background: 'var(--bg)',
            }}
          />
          <button
            onClick={handleAddLog}
            disabled={isSubmitting || !newLog.trim()}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: (!newLog.trim() || isSubmitting) ? 0.5 : 1,
              cursor: (!newLog.trim() || isSubmitting) ? 'default' : 'pointer',
              flexShrink: 0,
            }}
          >
            <Send size={14} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
