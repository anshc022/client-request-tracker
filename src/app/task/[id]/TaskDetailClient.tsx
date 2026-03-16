'use client';

import { useState, useEffect, useRef } from 'react';
import StatusSheet from '@/components/StatusSheet';
import { ClientRequest, TaskLog, addLog } from '@/app/actions';
import { Send, Paperclip, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { relativeTime } from '@/components/utils';

function formatLogTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
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
  const [showOriginal, setShowOriginal] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const hasMedia = task.media_urls && task.media_urls.length > 0;

  useEffect(() => {
    // Mark as viewed
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
    const tempLog: TaskLog = {
      id: Date.now(),
      task_id: task.id,
      content: newLog,
      created_at: new Date().toISOString()
    };
    setLogs([...logs, tempLog]);
    setNewLog('');
    setIsSubmitting(false);
  };

  const logGroups = groupLogsByDate(logs);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* WhatsApp-style header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        background: 'var(--primary-dark)',
        color: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        <Link href="/" style={{ color: '#fff', display: 'flex', padding: 4 }}>
          <ArrowLeft size={22} />
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Task #{task.id}</span>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 4,
              background: task.category === 'Bug' ? 'rgba(239,68,68,0.3)' : 'rgba(37,211,102,0.3)',
              color: '#fff',
            }}>
              {task.category}
            </span>
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 1 }}>
            {relativeTime(task.created_at)} · {logs.length} updates
          </div>
        </div>
        <StatusSheet taskId={task.id} currentStatus={status} onStatusChanged={setStatus} />
      </header>

      {/* Chat-like content area */}
      <div style={{
        flex: 1,
        background: 'var(--chat-bg)',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4cfc5\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        padding: '12px 12px 100px',
        overflowY: 'auto',
      }}>
        {/* Original request bubble */}
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            style={{
              display: 'block',
              margin: '0 auto 12px',
              background: 'rgba(0,0,0,0.08)',
              border: 'none',
              borderRadius: 8,
              padding: '4px 12px',
              fontSize: 12,
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {showOriginal ? '▼ Original Request' : '▶ Show Original Request'}
          </button>

          {showOriginal && (
            <div className="bubble-in" style={{
              maxWidth: '85%',
              padding: '8px 12px',
              boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
            }}>
              <p style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--primary)',
                marginBottom: 4,
              }}>
                Client Request
              </p>
              <p style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: 'var(--text)',
                whiteSpace: 'pre-wrap',
              }}>
                {task.content}
              </p>

              {hasMedia && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {task.media_urls!.map((url, i) => {
                    if (url.match(/\.(jpg|jpeg|png|webp)$/i)) {
                      return (
                        <div key={i} style={{ borderRadius: 6, overflow: 'hidden' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Attachment ${i}`} style={{ width: '100%', display: 'block' }} />
                        </div>
                      );
                    }
                    return (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        background: 'rgba(0,0,0,0.04)',
                        borderRadius: 6,
                      }}>
                        <Paperclip size={14} color="var(--primary)" />
                        <audio controls src={url} style={{ height: 32, flex: 1 }} />
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 4,
                fontSize: 11,
                color: 'var(--text-light)',
              }}>
                {new Date(task.created_at).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </div>
            </div>
          )}
        </div>

        {/* Activity log bubbles */}
        {logGroups.map(group => (
          <div key={group.date}>
            {/* Date divider */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '16px 0 12px',
            }}>
              <span style={{
                background: 'rgba(255,255,255,0.9)',
                padding: '4px 14px',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--text-muted)',
                fontWeight: 500,
                boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
              }}>
                {group.date}
              </span>
            </div>

            {group.logs.map((log, idx) => {
              const isStatusChange = log.content.startsWith('Status changed to');
              const isTeamReply = log.content.includes('ECHO:') || log.content.includes('Reply:');

              if (isStatusChange) {
                return (
                  <div key={log.id} style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '8px 0',
                  }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.9)',
                      padding: '4px 14px',
                      borderRadius: 8,
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
                    }}>
                      {log.content}
                    </span>
                  </div>
                );
              }

              return (
                <div key={log.id} style={{
                  display: 'flex',
                  justifyContent: isTeamReply ? 'flex-end' : 'flex-start',
                  marginBottom: 6,
                }}>
                  <div
                    className={isTeamReply ? 'bubble-out' : 'bubble-in'}
                    style={{
                      maxWidth: '85%',
                      padding: '6px 10px',
                      boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
                    }}
                  >
                    <p style={{
                      fontSize: 14,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      color: 'var(--text)',
                    }}>
                      {log.content}
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 2,
                    }}>
                      <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
                        {formatLogTime(log.created_at)}
                      </span>
                      {isTeamReply && (
                        <span style={{ fontSize: 12, color: '#53BDEB' }}>✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {logs.length === 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '32px 0',
          }}>
            <span style={{
              background: 'rgba(255,255,255,0.9)',
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 13,
              color: 'var(--text-muted)',
              boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
            }}>
              No updates yet. Start the conversation below.
            </span>
          </div>
        )}

        <div ref={logsEndRef} />
      </div>

      {/* WhatsApp-style message input */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '8px 8px',
        background: 'var(--bg)',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
      }}>
        <div style={{
          flex: 1,
          background: 'var(--surface)',
          borderRadius: 24,
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '4px 14px',
          minHeight: 44,
        }}>
          <input
            type="text"
            placeholder="Type an update..."
            value={newLog}
            onChange={e => setNewLog(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddLog()}
            style={{
              flex: 1,
              border: 'none',
              fontSize: 14,
              color: 'var(--text)',
              background: 'transparent',
            }}
          />
        </div>
        <button
          onClick={handleAddLog}
          disabled={isSubmitting || !newLog.trim()}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (!newLog.trim() || isSubmitting) ? 0.5 : 1,
            cursor: (!newLog.trim() || isSubmitting) ? 'default' : 'pointer',
            flexShrink: 0,
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
