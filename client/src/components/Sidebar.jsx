/**
 * Sidebar Component
 * Navigation sidebar with links and user stats
 */

import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  User,
  LogOut,
  Zap,
  X,
  ListTodo,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/profile', icon: User, label: 'Profile' },
    ],
  },
];

const Sidebar = ({ isOpen, onClose, stats }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Zap size={20} color="#fff" fill="#fff" />
          </div>
          <div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              TaskFlow
            </span>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
              Smart Task Manager
            </p>
          </div>

          {/* Close button (mobile only) */}
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              display: 'none',
              color: 'var(--color-text-muted)',
            }}
            id="sidebar-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.label}>
              <p className="nav-section-title">{section.label}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}

          {/* Task Stats Section */}
          <p className="nav-section-title" style={{ marginTop: '16px' }}>Overview</p>

          <div style={{
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px',
            marginBottom: '4px',
          }}>
            {[
              { label: 'Total Tasks', value: stats?.total || 0, icon: ListTodo, color: 'var(--color-primary)' },
              { label: 'In Progress', value: stats?.['in-progress'] || 0, icon: TrendingUp, color: '#7C3AED' },
              { label: 'Pending', value: stats?.pending || 0, icon: Clock, color: 'var(--color-warning)' },
              { label: 'Completed', value: stats?.completed || 0, icon: CheckSquare, color: 'var(--color-success)' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <stat.icon size={14} color={stat.color} />
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {stat.label}
                  </span>
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: stat.color,
                  background: 'var(--color-card)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  minWidth: '28px',
                  textAlign: 'center',
                }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer: User info + Logout */}
        <div className="sidebar-footer">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-bg)',
            marginBottom: '8px',
          }}>
            <img
              src={user?.avatar}
              alt={user?.name}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--color-primary)',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.name}
              </p>
              <p style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.email}
              </p>
            </div>
          </div>

          <button
            className="btn btn-secondary w-full"
            onClick={handleLogout}
            style={{ gap: '8px', justifyContent: 'center' }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
