/**
 * Formats a number to currency USD representation.
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0.00';
  const num = parseFloat(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};

/**
 * Formats a ISO or standard string date into a readable form.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.NumberFormat('en-US').format ? date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) : dateStr;
  } catch (e) {
    return dateStr;
  }
};

/**
 * Formats a score to percentage.
 */
export const formatPercent = (value) => {
  if (value === null || value === undefined) return '0%';
  const num = parseFloat(value);
  return `${Math.round(num)}%`;
};

/**
 * Returns color configurations for fraud/risk values.
 */
export const getRiskBadgeColor = (score) => {
  const num = parseFloat(score || 0);
  if (num > 60) {
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50';
  }
  if (num > 30) {
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
  }
  return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
};

/**
 * Returns text classification for fraud/risk levels.
 */
export const getRiskLevel = (score) => {
  const num = parseFloat(score || 0);
  if (num > 60) return 'HIGH RISK';
  if (num > 30) return 'MEDIUM RISK';
  return 'LOW RISK';
};
