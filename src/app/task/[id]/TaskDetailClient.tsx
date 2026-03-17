'use client';

import { useState, useEffect, useRef } from 'react';
import StatusSheet from '@/components/StatusSheet';
import { ClientRequest, TaskLog, addLog } from '@/app/actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { relativeTime, categoryTag, statusTag } from '@/components/utils';

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
  const cat = categoryTag(task.category);
  const st = statusTag(status);

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
      {/* Top bar */}
      <header style={{
        height: 45,
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        fontSize: 14,
      }}>
        <Link href="/" style={{
          color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center',
          padding: '4px 6px', borderRadius: 4,
          textDecoration: 'none', fontSize: 13,
          gap: 4,
        }}>
          <ArrowLeft size={16} />
          <span>Tasks</span>
        </Link>
        <span style={{ color: 'var(--text-light)', fontSize: 13 }}>/</span>
        <span style={{ color: 'var(--text)', fontWeight: 500, fontSize: 13 }}>Task #{task.id}</span>
      </header>

      <div className="detail-grid">
        {/* Main content */}
        <div className="detail-main" style={{ padding: '0 0 100px' }}>
          {/* Title area — big, Notion-style */}
          <div style={{ padding: '48px 48px 0', maxWidth: 720 }}>
            {/* Icon + ID */}
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              {task.category === 'Bug' ? '🐛' : '✨'}
            </div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 700,
              lineHeight: 1.25,
              color: 'var(--text)',
              marginBottom: 4,
              wordBreak: 'break-word',
            }}>
              Task #{task.id}
            </h1>
            <div style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              marginBottom: 32,
            }}>
              Created {new Date(task.created_at).toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </div>
          </div>

          {/* Properties — inline, Notion-style table */}
          <div style={{ padding: '0 48px 24px', maxWidth: 720 }}>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              {[
                { label: 'Status', value: <StatusSheet taskId={task.id} currentStatus={status} onStatusChanged={setStatus} /> },
                { label: 'Type', value: (
                  <span style={{ background: cat.bg, color: cat.color, padding: '1px 6px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                    {cat.label}
                  </span>
                )},
                { label: 'ID', value: <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>PING-{task.id}</span> },
                { label: 'Attachments', value: <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{task.media_urls?.length || 0} file{(task.media_urls?.length || 0) !== 1 ? 's' : ''}</span> },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 0',
                  fontSize: 14,
                }}>
                  <div style={{ width: 140, flexShrink: 0, color: 'var(--text-muted)', fontSize: 13 }}>
                    {row.label}
                  </div>
                  <div>{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)', margin: '0 48px' }} />

          {/* Content body */}
          <div style={{ padding: '24px 48px', maxWidth: 720 }}>
            <p style={{
              fontSize: 16,
              lineHeight: 1.75,
              color: 'var(--text)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {task.content}
            </p>
          </div>

          {/* Attachments */}
          {hasMedia && (
            <div style={{ padding: '0 48px 24px', maxWidth: 720 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
                Attachments
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {task.media_urls!.map((url, i) => {
                  if (url.match(/\.(jpg|jpeg|png|webp)$/i)) {
                    return (
                      <div key={i} style={{
                        borderRadius: 4, overflow: 'hidden',
                        border: '1px solid var(--border)',
                        maxWidth: 500,
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Attachment ${i + 1}`} style={{
                          width: '100%', display: 'block',
                          maxHeight: 400, objectFit: 'contain',
                          background: 'var(--bg-secondary)',
                        }} />
                      </div>
                    );
                  }
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 4,
                      border: '1px solid var(--border)',
                      maxWidth: 400,
                    }}>
                      <span style={{ fontSize: 20 }}>🎵</span>
                      <audio controls src={url} style={{ height: 32, flex: 1 }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)', margin: '0 48px' }} />

          {/* Comments / Activity */}
          <div style={{ padding: '24px 48px', maxWidth: 720 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
              Comments
              <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6, fontSize: 13 }}>
                {logs.length}
              </span>
            </div>

            {/* Add comment input */}
            <div style={{
              display: 'flex', gap: 8, marginBottom: 24, alignItems: 'flex-start',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 14,
                background: 'var(--bg-hover)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: 'var(--text-muted)', flexShrink: 0, marginTop: 4,
              }}>
                U
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newLog}
                  onChange={e => setNewLog(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddLog()}
                  style={{
                    width: '100%',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    padding: '8px 12px',
                    fontSize: 14,
                    color: 'var(--text)',
                    background: 'var(--bg)',
                  }}
                />
                {newLog.trim() && (
                  <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleAddLog}
                      disabled={isSubmitting}
                      style={{
                        background: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 12px',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: isSubmitting ? 'default' : 'pointer',
                        opacity: isSubmitting ? 0.6 : 1,
                      }}
                    >
                      Comment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comment list */}
            {logGroups.map(group => (
              <div key={group.date}>
                <div style={{
                  fontSize: 12, fontWeight: 500,
                  color: 'var(--text-muted)',
                  padding: '8px 0 4px',
                }}>
                  {group.date}
                </div>
                {group.logs.map(log => {
                  const isStatusChange = log.content.startsWith('Status changed to');
                  if (isStatusChange) {
                    return (
                      <div key={log.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 0',
                        fontSize: 13, color: 'var(--text-muted)',
                        fontStyle: 'italic',
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: 3,
                          background: 'var(--primary)',
                          flexShrink: 0,
                        }} />
                        {log.content}
                        <span style={{ fontSize: 11, color: 'var(--text-light)' }}>{formatLogTime(log.created_at)}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={log.id} style={{
                      display: 'flex', gap: 8, padding: '8px 0',
                      borderBottom: '1px solid var(--border-light)',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 14,
                        background: 'var(--bg-hover)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, color: 'var(--text-muted)', flexShrink: 0,
                      }}>
                        U
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Update</span>
                          <span style={{ fontSize: 11, color: 'var(--text-light)' }}>{formatLogTime(log.created_at)}</span>
                        </div>
                        <p style={{
                          fontSize: 14, lineHeight: 1.6,
                          color: 'var(--text)',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}>
                          {log.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {logs.length === 0 && (
              <div style={{
                padding: '24px 0',
                textAlign: 'center',
                color: 'var(--text-light)',
                fontSize: 13,
              }}>
                No comments yet.
              </div>
            )}

            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Right sidebar — properties (desktop) */}
        <div className="detail-sidebar" style={{ padding: '24px 16px', background: 'var(--bg-secondary)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
            Properties
          </div>

          {[
            { label: 'Status', value: (
              <span style={{ background: st.bg, color: st.color, padding: '1px 6px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                {status}
              </span>
            )},
            { label: 'Type', value: (
              <span style={{ background: cat.bg, color: cat.color, padding: '1px 6px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                {cat.label}
              </span>
            )},
            { label: 'Task ID', value: (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>#{task.id}</span>
            )},
            { label: 'Created', value: (
              <span style={{ fontSize: 13 }}>
                {new Date(task.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
            )},
            { label: 'Updated', value: (
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{relativeTime(task.created_at)}</span>
            )},
            { label: 'Comments', value: (
              <span style={{ fontSize: 13 }}>{logs.length}</span>
            )},
            { label: 'Files', value: (
              <span style={{ fontSize: 13 }}>{task.media_urls?.length || 0}</span>
            )},
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '7px 0',
              borderBottom: '1px solid var(--border)',
              fontSize: 13,
            }}>
              <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
              <span style={{ color: 'var(--text)' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
