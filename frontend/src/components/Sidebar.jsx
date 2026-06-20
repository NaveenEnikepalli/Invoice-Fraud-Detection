import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FiGrid,
  FiFileText,
  FiShield,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiActivity,
  FiUserCheck,
  FiDownload
} from 'react-icons/fi';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: FiGrid },
    { name: 'Invoice Vault', path: '/invoices', icon: FiFileText },
    { name: 'Fraud Scanner', path: '/fraud-analysis', icon: FiShield },
    { name: 'Vendor Intelligence', path: '/vendors', icon: FiUsers },
    { name: 'Risk Analytics', path: '/analytics', icon: FiBarChart2 },
    { name: 'Reports Center', path: '/reports', icon: FiDownload },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ];

  // Initials for avatar
  const getInitials = (name) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Area */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white">
            <FiActivity className="w-5 h-5 animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800 dark:text-white tracking-tight leading-none m-0">
              SentinelInvoice
            </h1>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Fraud Detection Engine
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 border-l-4 border-transparent'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              {getInitials(user?.fullName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none truncate">
                {user?.fullName || 'Anonymous User'}
              </p>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-none block mt-1 truncate">
                {user?.email || ''}
              </span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
