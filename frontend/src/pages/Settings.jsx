import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { FiSun, FiMoon, FiUser, FiMail, FiLock, FiLogOut } from 'react-icons/fi';
import { formatDate } from '../utils/format';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white m-0">Settings</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          Manage theme preferences and review your user profile details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Theme Preferences Card */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white m-0">Theme Preferences</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Customize the appearance of the dashboard interface.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              type="button"
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-500 dark:border-slate-800 dark:hover:border-slate-700'
              }`}
            >
              <FiSun className="w-6 h-6" />
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => theme === 'light' && toggleTheme()}
              type="button"
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-950/30 text-indigo-400'
                  : 'border-slate-200 hover:border-slate-300 text-slate-500 dark:border-slate-800 dark:hover:border-slate-700'
              }`}
            >
              <FiMoon className="w-6 h-6" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Profile Settings Card */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white m-0">Profile Information</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Your registered SentinelInvoice credentials.
            </p>
          </div>

          {user ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80">
                <FiUser className="text-indigo-500 w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Full Name</span>
                  <span className="text-slate-700 dark:text-slate-250 font-semibold">{user.fullName}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80">
                <FiMail className="text-indigo-500 w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Email Address</span>
                  <span className="text-slate-700 dark:text-slate-250 font-semibold">{user.email}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">No profile session loaded.</div>
          )}
        </div>

        {/* Account & Security Information */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white m-0">Account Information</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Review access controls and credential security parameters.
            </p>
          </div>

          {user ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-600 dark:text-slate-350">Login Email</span>
                <span className="font-semibold text-slate-800 dark:text-white">{user.email}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-600 dark:text-slate-350">Password Encryption</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <FiLock className="w-3.5 h-3.5" /> BCrypt Enabled
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-600 dark:text-slate-350">Registration Date</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Security credentials offline.</div>
          )}
        </div>

        {/* About Card */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white m-0">About Application</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Details about SentinelInvoice system capabilities.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100 dark:border-slate-805/60">
              SentinelInvoice is an enterprise-grade transaction auditing and fraud detection system designed to inspect financial records for suspicious activities, double billing conflicts, vendor anomalies, and pattern spoofing.
            </p>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>System Version</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">1.0.0 (Production Build)</span>
            </div>
          </div>
        </div>

        {/* Logout Action Area */}
        <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 md:col-span-2 border border-rose-100/50 dark:border-rose-950/20 bg-rose-50/5 dark:bg-rose-950/5">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white m-0">Terminate Session</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 m-0">
              Safely exit the SentinelInvoice application and invalidate local access tokens.
            </p>
          </div>
          <button
            onClick={logout}
            type="button"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer border-0 w-full sm:w-auto"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Secure Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
