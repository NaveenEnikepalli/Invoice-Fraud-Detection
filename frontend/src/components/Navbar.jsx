import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiCheckCircle, FiAlertCircle, FiLogOut } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [backendStatus, setBackendStatus] = useState('checking');

  // Simple title generator
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/invoices':
        return 'Invoice Management';
      case '/fraud-analysis':
        return 'Fraud Analysis';
      case '/vendors':
        return 'Vendor Management';
      case '/analytics':
        return 'Analytics & Reports';
      case '/settings':
        return 'Settings';
      case '/user-management':
        return 'User Directory';
      default:
        return 'SentinelInvoice';
    }
  };

  // Poll backend health status
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.get('/analytics/summary');
        setBackendStatus('online');
      } catch (err) {
        setBackendStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [location.pathname]); // Also verify on route changes

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between px-6 h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={toggleSidebar}
          type="button"
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 lg:hidden"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-slate-800 dark:text-white m-0">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Welcome message */}
        {user && (
          <span className="hidden md:inline text-xs font-semibold text-slate-505 dark:text-slate-400">
            Welcome, <span className="text-indigo-600 dark:text-indigo-400 font-bold">{user.fullName}</span>
          </span>
        )}

        {/* Backend health status badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/50">
          {backendStatus === 'checking' && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-slate-505 dark:text-slate-450">Connecting...</span>
            </>
          )}
          {backendStatus === 'online' && (
            <>
              <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-700 dark:text-emerald-400">System Online</span>
            </>
          )}
          {backendStatus === 'offline' && (
            <>
              <FiAlertCircle className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
              <span className="text-rose-700 dark:text-rose-400">System Offline</span>
            </>
          )}
        </div>

        <ThemeToggle />

        {/* Sign Out Button */}
        {user && (
          <button
            onClick={handleLogout}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-rose-200 dark:border-slate-800 dark:hover:border-rose-950/60 rounded-lg text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-white dark:bg-slate-900 transition-all cursor-pointer"
            title="Sign Out"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
