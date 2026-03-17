'use client';

import { useState, useEffect, useRef } from 'react';
import StatusSheet from '@/components/StatusSheet';
import { ClientRequest, TaskLog, addLog } from '@/app/actions';
import { Send, Paperclip, ArrowLeft, Clock, Tag, Hash } from 'lucide-react';
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
  const stConfig = statusConfig(status);

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
        padding: '0 20px',
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
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>PING-{task.id}</span>
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: cat.color, background: cat.bg,
            padding: '2px 8px', borderRadius: 4,
          }}>
            {cat.label}
          </span>
        </div>
        <StatusSheet taskId={task.id} currentStatus={status} onStatusChanged={setStatus} />
      </header>

      {/* Desktop: two-column layout */}
      <div className="detail-layout" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 120px' }}>
        <div className="detail-grid">
          {/* Left: Task info + attachments */}
          <div>
            {/* Task Number Banner */}
            <div style={{
              background: 'var(--primary-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(99,102,241,0.15)',
              padding: '16px 20px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius)',
                  background: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 18, fontWeight: 800,
                }}>
                  {task.id}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary-dark)', letterSpacing: '-0.3px' }}>
                    Task #{task.id}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Created {new Date(task.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: stConfig.bg, color: stConfig.color,
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: stConfig.dot }} />
                {status}
              </div>
            </div>

            {/* Description Card */}
            <div style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '20px',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Description
              </div>
              <p style={{
                fontSize: 15,
                lineHeight: 1.75,
                color: 'var(--text)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {task.content}
              </p>
            </div>

            {/* Attachments Card */}
            {hasMedia && (
              <div style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '20px',
                marginBottom: 16,
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--text-light)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Paperclip size={13} />
                  {task.media_urls!.length} Attachment{task.media_urls!.length > 1 ? 's' : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {task.media_urls!.map((url, i) => {
                    if (url.match(/\.(jpg|jpeg|png|webp)$/i)) {
                      return (
                        <div key={i} style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Attachment ${i + 1}`} style={{ width: '100%', maxHeight: 500, objectFit: 'contain', display: 'block', background: '#F9FAFB' }} />
                        </div>
                      );
                    }
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 14px',
                        background: 'var(--bg)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 8,
                          background: 'var(--primary-subtle)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, flexShrink: 0,
                        }}>🎵</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Audio Recording</div>
                          <audio controls src={url} style={{ height: 32, width: '100%' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Properties Card — desktop only */}
            <div className="detail-properties" style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '20px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                Properties
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', fontSize: 13 }}>
                <div>
                  <span style={{ color: 'var(--text-light)', fontSize: 12 }}>Task ID</span>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>PING-{task.id}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-light)', fontSize: 12 }}>Category</span>
                  <div style={{ marginTop: 2 }}>
                    <span style={{ color: cat.color, background: cat.bg, padding: '2px 8px', borderRadius: 4, fontWeight: 600, fontSize: 12 }}>{cat.label}</span>
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-light)', fontSize: 12 }}>Status</span>
                  <div style={{ marginTop: 2 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: stConfig.color, background: stConfig.bg, padding: '2px 8px', borderRadius: 4, fontWeight: 600, fontSize: 12 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: stConfig.dot }} />
                      {status}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-light)', fontSize: 12 }}>Created</span>
                  <div style={{ fontWeight: 500, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {relativeTime(task.created_at)}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-light)', fontSize: 12 }}>Updates</span>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{logs.length}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-light)', fontSize: 12 }}>Attachments</span>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{task.media_urls?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Activity */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: 'fit-content',
            maxHeight: 'calc(100vh - 130px)',
            position: 'sticky',
            top: 80,
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
              flexShrink: 0,
            }}>
              <span>Activity Feed</span>
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-light)' }}>{logs.length} updates</span>
            </div>

            <div style={{ padding: '12px 20px', overflowY: 'auto', flex: 1 }}>
              {logs.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 16px',
                  color: 'var(--text-light)',
                  fontSize: 13,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                  No activity yet
                </div>
              )}

              {logGroups.map(group => (
                <div key={group.date}>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    color: 'var(--text-light)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '12px 0 6px',
                  }}>
                    {group.date}
                  </div>

                  {group.logs.map(log => {
                    const isStatusChange = log.content.startsWith('Status changed to');
                    return (
                      <div key={log.id} style={{
                        display: 'flex',
                        gap: 10,
                        padding: '10px 0',
                        borderBottom: '1px solid var(--border-light)',
                      }}>
                        <div style={{ paddingTop: 5, flexShrink: 0 }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: isStatusChange ? 'var(--primary)' : '#D1D5DB',
                          }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 13,
                            lineHeight: 1.6,
                            color: isStatusChange ? 'var(--text-muted)' : 'var(--text)',
                            fontStyle: isStatusChange ? 'italic' : 'normal',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}>
                            {log.content}
                          </p>
                          <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 3, display: 'block' }}>
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

            {/* Inline input at bottom of activity */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexShrink: 0,
              background: 'var(--bg)',
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
                  padding: '9px 12px',
                  fontSize: 13,
                  color: 'var(--text)',
                  background: 'var(--surface)',
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
                  padding: '9px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  opacity: (!newLog.trim() || isSubmitting) ? 0.4 : 1,
                  cursor: (!newLog.trim() || isSubmitting) ? 'default' : 'pointer',
                  flexShrink: 0,
                }}
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
