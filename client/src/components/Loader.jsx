/**
 * Loader Component
 * Animated loading spinner with optional text
 */

const Loader = ({ size = 32, text = '', color = 'var(--color-primary)' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '14px',
    }}>
      {/* Spinner */}
      <div style={{
        width: size,
        height: size,
        border: `3px solid rgba(79, 70, 229, 0.15)`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {text && (
        <p style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
        }}>
          {text}
        </p>
      )}
    </div>
  );
};

/**
 * Skeleton Card for loading state
 */
export const SkeletonCard = () => (
  <div className="task-card" style={{ padding: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
      <div className="skeleton" style={{ height: '16px', width: '60%' }} />
      <div className="skeleton" style={{ height: '22px', width: '70px', borderRadius: '999px' }} />
    </div>
    <div className="skeleton" style={{ height: '12px', width: '90%', marginBottom: '8px' }} />
    <div className="skeleton" style={{ height: '12px', width: '70%', marginBottom: '20px' }} />
    <div style={{ display: 'flex', gap: '8px' }}>
      <div className="skeleton" style={{ height: '22px', width: '80px', borderRadius: '999px' }} />
      <div className="skeleton" style={{ height: '22px', width: '80px', borderRadius: '999px' }} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
      <div className="skeleton" style={{ height: '32px', width: '32px', borderRadius: '8px' }} />
      <div className="skeleton" style={{ height: '32px', width: '32px', borderRadius: '8px' }} />
      <div className="skeleton" style={{ height: '32px', width: '80px', borderRadius: '8px' }} />
    </div>
  </div>
);

export default Loader;
