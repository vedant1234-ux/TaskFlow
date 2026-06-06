/**
 * Profile Page
 * User profile view and edit with avatar display
 */

import { useState } from 'react';
import { User, Mail, Calendar, Edit3, Save, X, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }
    setLoading(true);
    try {
      await updateProfile({ name: form.name.trim() });
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || '' });
    setEditing(false);
    setErrors({});
  };

  const infoItems = [
    {
      icon: User,
      label: 'Full Name',
      value: user?.name,
      color: 'var(--color-primary)',
    },
    {
      icon: Mail,
      label: 'Email Address',
      value: user?.email,
      color: '#7C3AED',
    },
    {
      icon: Shield,
      label: 'Account Role',
      value: user?.role === 'admin' ? 'Administrator' : 'Standard User',
      color: 'var(--color-success)',
    },
    {
      icon: Calendar,
      label: 'Member Since',
      value: formatDate(user?.createdAt),
      color: 'var(--color-warning)',
    },
  ];

  return (
    <div className="page-content" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          My Profile
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Manage your account information
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>

        {/* ── Avatar Card ──────────────────────── */}
        <div className="card" style={{ padding: '28px', textAlign: 'center', height: 'fit-content' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
            <img
              src={user?.avatar}
              alt={user?.name}
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid var(--color-primary)',
                boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              width: '24px',
              height: '24px',
              background: 'var(--color-success)',
              borderRadius: '50%',
              border: '3px solid var(--color-card)',
            }} />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
            {user?.name}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            {user?.email}
          </p>

          <span
            className="badge"
            style={{
              background: user?.role === 'admin' ? 'var(--color-primary-light)' : 'var(--color-success-light)',
              color: user?.role === 'admin' ? 'var(--color-primary)' : 'var(--color-success)',
              fontSize: '12px',
            }}
          >
            {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
          </span>
        </div>

        {/* ── Info + Edit Card ──────────────────── */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Account Information
            </h3>
            {!editing && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setEditing(true)}
                style={{ gap: '6px' }}
              >
                <Edit3 size={13} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Edit Form */}
          {editing ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    className="input"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    autoFocus
                    style={{ borderColor: errors.name ? 'var(--color-danger)' : undefined }}
                  />
                </div>
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input
                    className="input"
                    type="email"
                    value={user?.email}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Email cannot be changed
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancel}>
                  <X size={14} /> Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary btn-sm ${loading ? 'btn-loading' : ''}`}
                  disabled={loading}
                >
                  {!loading && <><Save size={14} /> Save Changes</>}
                </button>
              </div>
            </form>
          ) : (
            /* Info Display */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {infoItems.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 16px',
                    background: 'var(--color-bg)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    transition: 'border-color var(--transition-fast)',
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: `${item.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <item.icon size={17} color={item.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Security Card ────────────────────── */}
      <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Shield size={20} color="var(--color-primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Security
          </h3>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Password</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Last changed: Unknown
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => toast('Password change coming soon!', { icon: '🔐' })}>
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
