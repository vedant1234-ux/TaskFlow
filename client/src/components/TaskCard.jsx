/**
 * TaskCard Component
 * Displays a single task with actions and status/priority badges
 */

import { useState } from 'react';
import { Edit2, Trash2, CheckCircle2, Circle, Calendar, Clock, MessageSquare, Send, Paperclip } from 'lucide-react';
import { formatDate, isOverdue, formatRelativeTime } from '../utils/formatDate';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PRIORITY_CONFIG = {
  high: { label: 'High', class: 'badge-high', dotClass: 'high' },
  medium: { label: 'Medium', class: 'badge-medium', dotClass: 'medium' },
  low: { label: 'Low', class: 'badge-low', dotClass: 'low' },
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', class: 'badge-pending' },
  'in-progress': { label: 'In Progress', class: 'badge-in-progress' },
  completed: { label: 'Completed', class: 'badge-completed' },
};

const TaskCard = ({ task, onEdit, onDelete, onToggle }) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replies, setReplies] = useState(task.replies || []);

  const canModify = !task.assignedBy || user?.role === 'admin';

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await onDelete(task._id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(task._id);
    } finally {
      setIsToggling(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setIsReplying(true);
    try {
      const res = await api.post(`/tasks/${task._id}/reply`, { message: replyMessage });
      setReplies(res.data.task.replies);
      setReplyMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className={`task-card priority-${task.priority} ${task.status === 'completed' ? 'completed-task' : ''}`}>
      {/* Header: Title + Priority Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
        <h3 className="task-title" style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          lineHeight: 1.4,
          flex: 1,
        }}>
          {task.title}
        </h3>
        <span className={`badge ${priority.class}`} style={{ flexShrink: 0 }}>
          <span className={`priority-dot ${priority.dotClass}`} />
          {priority.label}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          marginBottom: '14px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {task.description}
        </p>
      )}

      {/* Badges Row: Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <span className={`badge ${status.class}`}>{status.label}</span>

        {/* Overdue indicator */}
        {overdue && (
          <span className="badge" style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
            Overdue
          </span>
        )}

        {/* Assigned By / Assigned To */}
        {task.assignedBy && user?.role !== 'admin' && (
          <span className="badge" style={{ background: '#E0E7FF', color: '#4F46E5' }}>
            Assigned by Admin
          </span>
        )}
        
        {user?.role === 'admin' && task.user && task.user.name && (
          <span className="badge" style={{ background: '#E0E7FF', color: '#4F46E5' }}>
            Assigned to: {task.user.name.split(' ')[0]}
          </span>
        )}
      </div>

      {/* Dates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' }}>
        {task.dueDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={13} color={overdue ? 'var(--color-danger)' : 'var(--color-text-muted)'} />
            <span style={{
              fontSize: '12px',
              color: overdue ? 'var(--color-danger)' : 'var(--color-text-muted)',
              fontWeight: overdue ? 600 : 400,
            }}>
              Due {formatDate(task.dueDate)}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={13} color="var(--color-text-muted)" />
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Created {formatRelativeTime(task.createdAt)}
          </span>
        </div>
      </div>

      {/* Attachments */}
      {task.attachments && task.attachments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {task.attachments.map((att, idx) => (
            <a 
              key={idx} 
              href={att.url.startsWith('http') ? att.url : `http://localhost:5000${att.url}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', background: 'var(--color-bg)', padding: '6px 10px', borderRadius: '6px', width: 'fit-content' }}
            >
              <Paperclip size={12} />
              <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
            </a>
          ))}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '14px' }} />

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {canModify && (
            <>
              {/* Edit */}
              <button
                className="btn btn-secondary btn-sm btn-icon"
                onClick={() => onEdit(task)}
                data-tooltip="Edit task"
                style={{ padding: '7px' }}
              >
                <Edit2 size={14} />
              </button>

              {/* Delete */}
              <button
                className="btn btn-sm btn-icon"
                onClick={handleDelete}
                disabled={isDeleting}
                data-tooltip="Delete task"
                style={{
                  padding: '7px',
                  background: 'var(--color-danger-light)',
                  color: 'var(--color-danger)',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-danger)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-danger-light)';
                  e.currentTarget.style.color = 'var(--color-danger)';
                }}
              >
                {isDeleting ? (
                  <div style={{
                    width: '14px', height: '14px',
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </>
          )}
        </div>

        {/* Toggle Complete */}
        <button
          className={`btn btn-sm ${task.status === 'completed' ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleToggle}
          disabled={isToggling}
          style={{ gap: '6px' }}
        >
          {isToggling ? (
            <div style={{
              width: '14px', height: '14px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
          ) : task.status === 'completed' ? (
            <><Circle size={14} />Mark Pending</>
          ) : (
            <><CheckCircle2 size={14} />Complete</>
          )}
        </button>
      </div>

      {/* Replies Toggle */}
      <div style={{ marginTop: '14px', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowReplies(!showReplies)}
          style={{ padding: '0', color: 'var(--color-text-muted)', fontSize: '13px' }}
        >
          <MessageSquare size={14} style={{ marginRight: '6px' }} />
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </button>

        {showReplies && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {replies.map(r => (
              <div key={r.id} style={{ background: 'var(--color-bg)', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{r.userName}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>{formatRelativeTime(r.createdAt)}</span>
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>{r.message}</div>
              </div>
            ))}
            
            <form onSubmit={handleReply} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input 
                type="text" 
                className="input" 
                placeholder="Type a reply..." 
                value={replyMessage}
                onChange={e => setReplyMessage(e.target.value)}
                style={{ flex: 1, padding: '6px 10px', fontSize: '13px' }}
              />
              <button type="submit" className="btn btn-primary btn-icon" disabled={isReplying || !replyMessage.trim()} style={{ padding: '6px' }}>
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
