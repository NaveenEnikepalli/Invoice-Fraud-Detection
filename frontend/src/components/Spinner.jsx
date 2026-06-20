import React from 'react';

const Spinner = ({ size = 'medium', message = 'Loading data...' }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3 w-full min-h-[200px]">
      <div
        className={`animate-spin rounded-full border-t-indigo-600 border-r-transparent border-b-slate-200 border-l-slate-200 dark:border-b-slate-800 dark:border-l-slate-800 ${sizeClasses[size]}`}
        role="status"
      />
      {message && (
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500 animate-pulse-slow">
          {message}
        </p>
      )}
    </div>
  );
};

export default Spinner;
