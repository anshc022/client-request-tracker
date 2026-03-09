'use client';

import { useState } from 'react';
import StatusSheet from '@/components/StatusSheet';
import { ClientRequest, TaskLog, addLog } from '@/app/actions';
import { Send } from 'lucide-react';
import Image from 'next/image';

export default function TaskDetailClient({ task, logs: initialLogs }: { task: ClientRequest, logs: TaskLog[] }) {
  const [status, setStatus] = useState(task.status);
  const [logs, setLogs] = useState(initialLogs);
  const [newLog, setNewLog] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const date = new Date(task.created_at);
  const hasMedia = task.media_urls && task.media_urls.length > 0;

  const handleAddLog = async () => {
    if (!newLog.trim()) return;
    setIsSubmitting(true);
    await addLog(task.id, newLog);
    // Optimistic update
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

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      <StatusSheet taskId={task.id} currentStatus={status} onStatusChanged={setStatus} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
        <span>Task #{task.id}</span>
        <span>·</span>
        <span>{task.category}</span>
        <span>·</span>
        <span>{date.toLocaleDateString()}</span>
      </div>

      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Original Request</h2>
        <blockquote style={{ borderLeft: '3px solid var(--primary)', background: '#F1F5F9', padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
          {task.content}
        </blockquote>
        
        {hasMedia && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>📎 Attached Media:</p>
            {task.media_urls!.map((url, i) => {
              if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.webp')) {
                return (
                  <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Attachment ${i}`} style={{ width: '100%', display: 'block' }} />
                  </div>
                );
              }
              return <p key={i} style={{ fontSize: 13, color: 'var(--primary)' }}>🎙 Audio note attached</p>;
            })}
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-muted)' }}>Updates & Activity</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {logs.map(log => (
            <div key={log.id} style={{ background: '#fff', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{log.content}</p>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 6 }}>
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No updates yet.</p>
          )}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 12, background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Add an update..." 
          value={newLog}
          onChange={e => setNewLog(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddLog()}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: '1px solid var(--border)', fontSize: 14 }}
        />
        <button 
          onClick={handleAddLog}
          disabled={isSubmitting || !newLog.trim()}
          style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (!newLog.trim() || isSubmitting) ? 0.5 : 1 }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
