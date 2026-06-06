/**
 * Date Formatting Utilities
 */

/**
 * Format a date to a human-readable string
 * @param {string|Date} date
 * @returns {string} e.g. "Jun 5, 2024"
 */
export const formatDate = (date) => {
  if (!date) return 'No date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Format a date as relative time
 * @param {string|Date} date
 * @returns {string} e.g. "2 hours ago", "in 3 days"
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffSecs) < 60) return rtf.format(diffSecs, 'second');
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, 'minute');
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');

  return formatDate(date);
};

/**
 * Check if a date is overdue
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isOverdue = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

/**
 * Format date for input[type="date"]
 * @param {string|Date} date
 * @returns {string} YYYY-MM-DD
 */
export const formatDateInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};
