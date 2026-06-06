/**
 * TaskModal Component
 * Modal for viewing task details
 */

import { X, Calendar, Clock, Flag, Tag } from 'lucide-react';
import { formatDate, formatRelativeTime } from '../utils/formatDate';

const PRIORITY_CONFIG = {
  high: { label: 'High', class: 'badge-high', color: 'var(--color-danger)' },
  medium: { label: 'Medium', class: 'badge-medium', color: 'var(--color-warning)' },
  low: { label: 'Low', class: 'badge-low', color: 'var(--color-success)' },
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', class: 'badge-pending' },
  'in-progress': { label: 'In Progress', class: 'badge-in-progress' },
  completed: { label: 'Completed', class: 'badge-completed' },
};

const TaskModal = ({ task, onClose, onEdit }) => {
  if (!task) return null;

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        {/* Header */}
        <div style={{
          padding: '22px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className={`badge ${status.class}`}>{status.label}</span>
              <span className={`badge ${priority.class}`}>
                <Flag size={10} />
                {priority.label} Priority
              </span>
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
            }}>
              {task.title}
            </h2>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            style={{ flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px' }}>
          {/* Description */}
          {task.description ? (
            <div style={{ marginBottom: '22px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                Description
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                {task.description}
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: '22px' }}>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                No description provided.
              </p>
            </div>
          )}

          {/* Meta Info */}
          <div style={{
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
          }}>
            {[
              {
                icon: Calendar,
                label: 'Due Date',
                value: task.dueDate ? formatDate(task.dueDate) : 'No due date',
              },
              {
                icon: Clock,
                label: 'Created',
                value: formatDate(task.createdAt),
              },
              {
                icon: Clock,
                label: 'Last Updated',
                value: formatRelativeTime(task.updatedAt),
              },
              {
                icon: Flag,
                label: 'Priority',
                value: priority.label,
                color: priority.color,
              },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <item.icon size={13} color="var(--color-text-muted)" />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {item.label}
                  </span>
                </div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: item.color || 'var(--color-text-primary)' }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
        }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { onClose(); onEdit(task); }}>
            ✏️ Edit Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
