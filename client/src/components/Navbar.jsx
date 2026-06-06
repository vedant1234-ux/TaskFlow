/**
 * Navbar Component
 * Fixed top navigation with mobile menu toggle and user dropdown
 */

import { useState } from 'react';
import { Menu, Bell, Moon, Sun, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = ({ onMenuToggle, darkMode, onToggleDark }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="navbar">
      {/* Left: Menu toggle + Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          className="btn btn-ghost btn-icon mobile-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1, color: 'var(--color-text-primary)' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {/* Dark Mode Toggle */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={onToggleDark}
          data-tooltip={darkMode ? 'Light mode' : 'Dark mode'}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications (decorative) */}
        <button className="btn btn-ghost btn-icon" data-tooltip="Notifications" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '8px',
            height: '8px',
            background: 'var(--color-danger)',
            borderRadius: '50%',
            border: '1.5px solid var(--color-card)',
          }} />
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: 'var(--color-border)', margin: '0 4px' }} />

        {/* User Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: 'var(--radius-lg)',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--color-primary)',
              }}
            />
            <div style={{ textAlign: 'left', display: 'none' }} className="hidden-mobile">
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                {user?.name}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {user?.email}
              </p>
            </div>
            <ChevronDown size={14} color="var(--color-text-muted)" />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 50 }}
                onClick={() => setShowUserMenu(false)}
              />
              <div
                className="animate-scaleIn"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-xl)',
                  width: '220px',
                  zIndex: 100,
                  overflow: 'hidden',
                }}
              >
                {/* User Info Header */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {user?.name}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {user?.email}
                  </p>
                </div>

                {/* Menu Items */}
                <div style={{ padding: '8px' }}>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-primary)',
                      fontSize: '14px',
                      fontWeight: 500,
                      transition: 'background var(--transition-fast)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <User size={15} color="var(--color-text-secondary)" />
                    My Profile
                  </Link>

                  <button
                    onClick={() => { setShowUserMenu(false); logout(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-danger)',
                      fontSize: '14px',
                      fontWeight: 500,
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-danger-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
