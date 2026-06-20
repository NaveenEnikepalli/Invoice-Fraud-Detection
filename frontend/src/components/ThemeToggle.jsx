import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <FiSun className="w-5 h-5 animate-pulse-slow" />
      ) : (
        <FiMoon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
