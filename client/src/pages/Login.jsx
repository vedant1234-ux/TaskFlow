/**
 * Login Page
 * Styled auth form with JWT login and redirect
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Fill demo credentials
  const fillDemoUser = () => {
    setForm({ email: 'demo@taskflow.com', password: 'demo123' });
  };

  const fillDemoAdmin = () => {
    setForm({ email: 'admin@taskflow.com', password: 'admin123' });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
          }}>
            <Zap size={28} color="#fff" fill="#fff" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Sign in to your TaskFlow account
          </p>
        </div>

        {/* Demo Banners */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {/* User Demo */}
          <div
            onClick={fillDemoUser}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, var(--color-primary-light), #E8E4FF)',
              border: '1px solid rgba(79, 70, 229, 0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.2)'}
          >
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
                🚀 User Demo
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                demo@taskflow.com
              </p>
            </div>
          </div>

          {/* Admin Demo */}
          <div
            onClick={fillDemoAdmin}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #FCE7F3, #FBCFE8)',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#EC4899'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.2)'}
          >
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#DB2777' }}>
                🛡️ Admin Demo
              </p>
              <p style={{ fontSize: '11px', color: '#9D174D', marginTop: '2px' }}>
                admin@taskflow.com
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                style={{ borderColor: errors.email ? 'var(--color-danger)' : undefined }}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    paddingRight: '44px',
                    borderColor: errors.password ? 'var(--color-danger)' : undefined,
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {/* Remember me + Forgot password */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Remember me</span>
            </label>
            <a href="#" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-primary)' }}>
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
            style={{ height: '46px', fontSize: '15px' }}
          >
            {!loading && 'Sign In →'}
          </button>
        </form>

        {/* Register Link */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
