/**
 * EmptyState Component
 * Shown when no tasks match current filters
 */

import { ClipboardList, Plus } from 'lucide-react';

const EmptyState = ({ message = 'No tasks found', onAction, actionLabel = 'Create Your First Task', filtered = false }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <ClipboardList size={44} color="var(--color-primary)" strokeWidth={1.5} />
      </div>

      <h3 style={{
        fontSize: '20px',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        marginBottom: '8px',
      }}>
        {filtered ? 'No matching tasks' : 'No tasks yet'}
      </h3>

      <p style={{
        fontSize: '14px',
        color: 'var(--color-text-secondary)',
        maxWidth: '320px',
        marginBottom: '28px',
        lineHeight: 1.7,
      }}>
        {filtered
          ? 'Try adjusting your filters or search query to find what you\'re looking for.'
          : message}
      </p>

      {onAction && !filtered && (
        <button className="btn btn-primary" onClick={onAction}>
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
