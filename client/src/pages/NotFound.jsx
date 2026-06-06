/**
 * NotFound (404) Page
 */

import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: '20px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        {/* 404 Text */}
        <div style={{
          fontSize: '120px',
          fontWeight: 800,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '16px',
          animation: 'bounceIn 0.5s ease',
        }}>
          404
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '36px', lineHeight: 1.7 }}>
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <Link className="btn btn-primary" to="/dashboard">
            <Home size={16} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
