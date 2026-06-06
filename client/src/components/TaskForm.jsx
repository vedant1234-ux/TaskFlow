/**
 * TaskForm Component
 * Inline form for creating and editing tasks
 */

import { useState, useEffect } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { formatDateInput } from '../utils/formatDate';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const defaultForm = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  dueDate: '',
  assignedTo: '',
  attachments: [],
};

const TaskForm = ({ onSubmit, editingTask, onCancelEdit }) => {
  const { user } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchUsers = async () => {
        try {
          const res = await api.get('/users');
          setUsers(res.data.users);
        } catch (error) {
          console.error('Failed to fetch users', error);
        }
      };
      fetchUsers();
    }
  }, [user]);

  // Populate form when editing
  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'medium',
        status: editingTask.status || 'pending',
        dueDate: formatDateInput(editingTask.dueDate),
        assignedTo: editingTask.assignedTo || '',
        attachments: editingTask.attachments || [],
      });
      setIsExpanded(true);
    } else {
      setForm(defaultForm);
      setIsExpanded(false);
    }
    setErrors({});
  }, [editingTask]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.title.trim().length > 200) errs.title = 'Title is too long';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), res.data.file],
      }));
      toast.success('File attached');
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate || null,
      };
      await onSubmit(payload);
      // Reset only if creating (not editing)
      if (!editingTask) {
        setForm(defaultForm);
        setIsExpanded(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save task.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(defaultForm);
    setIsExpanded(false);
    setErrors({});
    if (onCancelEdit) onCancelEdit();
  };

  const isEditing = !!editingTask;

  return (
    <div className="card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: isEditing ? 'default' : 'pointer',
          borderBottom: isExpanded || isEditing ? '1px solid var(--color-border)' : 'none',
          transition: 'background var(--transition-fast)',
        }}
        onClick={() => !isEditing && !isExpanded && setIsExpanded(true)}
        onMouseEnter={(e) => {
          if (!isEditing && !isExpanded) {
            e.currentTarget.style.background = 'var(--color-bg)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'var(--color-primary-light)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Plus size={18} color="var(--color-primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {isEditing ? '✏️ Edit Task' : 'Create New Task'}
            </h2>
            {!isExpanded && !isEditing && (
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Click to add a task
              </p>
            )}
          </div>
        </div>

        {(isExpanded || isEditing) && (
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={handleCancel}
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Form Body */}
      {(isExpanded || isEditing) && (
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px' }}>
          {/* Title */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">
              Task Title <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              className="input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              autoFocus
              style={{ borderColor: errors.title ? 'var(--color-danger)' : undefined }}
            />
            {errors.title && (
              <span className="form-error">{errors.title}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Description</label>
            <textarea
              className="input"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add details about this task..."
              rows={3}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          {/* Grid: Priority + Status + Due Date */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="input" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            {/* Status (only for editing) */}
            {isEditing && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="input" name="status" value={form.status} onChange={handleChange}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}

            {/* Due Date */}
            <div className="form-group" style={{ gridColumn: isEditing ? '3' : '2 / span 2' }}>
              <label className="form-label">Due Date</label>
              <input
                className="input"
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Assign To (Admin only) */}
            {user?.role === 'admin' && (
              <div className="form-group" style={{ gridColumn: '1 / span 3' }}>
                <label className="form-label">Assign To</label>
                <select className="input" name="assignedTo" value={form.assignedTo} onChange={handleChange}>
                  <option value="">Self (Admin)</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Attachments</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {(form.attachments || []).map((att, idx) => (
                <div key={idx} style={{ padding: '4px 8px', background: 'var(--color-bg)', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--color-border)' }}>
                  <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📎 {att.name}</span>
                  <button type="button" onClick={() => {
                    const newAtts = [...form.attachments];
                    newAtts.splice(idx, 1);
                    setForm({ ...form, attachments: newAtts });
                  }} style={{ color: 'var(--color-danger)', border: 'none', background: 'none', cursor: 'pointer', padding: '0 4px' }}>×</button>
                </div>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '13px', padding: '4px 8px', border: '1px dashed var(--color-primary)', borderRadius: '4px' }}>
                <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={loading} />
                📎 Attach File
              </label>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary btn-sm ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {!loading && (
                isEditing ? '💾 Save Changes' : '+ Create Task'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TaskForm;
