import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiLock, FiShield, FiBarChart2, FiUsers, FiCheckCircle, FiActivity, FiAlertCircle } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { title: 'Invoice Vault', desc: 'Store invoices securely, index structural records, and search files instantly.', icon: FiShield },
    { title: 'Fraud Scanner', desc: 'Scan and flag duplicate invoice numbers, amounts, vendor risk score anomalies, and frequency spikes.', icon: FiBarChart2 },
    { title: 'Vendor Intelligence', desc: 'Evaluate historical vendor analytics, invoice volume, average amount, and flagging history.', icon: FiUsers },
    { title: 'Investigation Workspace', desc: 'Investigate risks with detailed audit timeline logs, comparison checks, and analyst remarks.', icon: FiCheckCircle },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Section - Branding and Preview (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 dark:bg-slate-950 text-white p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

        {/* Top Branding */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-lg">
            <FiActivity className="w-5 h-5 animate-pulse-slow" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight m-0 leading-none">SentinelInvoice</h2>
            <span className="text-xs text-slate-400 font-medium">Invoice Fraud Protection Platform</span>
          </div>
        </div>

        {/* Hero Area */}
        <div className="my-auto relative z-10 max-w-lg space-y-6">
          <h1 className="text-3xl font-extrabold leading-tight text-white m-0">
            Invoice Fraud Protection Platform
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Store invoices securely, detect suspicious activity, investigate fraud, and protect your business from financial losses.
          </p>

          {/* Features Preview List */}
          <div className="grid gap-6 pt-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex gap-4 items-start">
                  <div className="p-2 bg-slate-800 rounded-lg text-indigo-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 m-0">{f.title}</h3>
                    <p className="text-xs text-slate-450 mt-1 leading-normal">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 relative z-10">
          &copy; {new Date().getFullYear()} SentinelInvoice. Secure protection active.
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            {/* Logo for mobile only */}
            <div className="flex lg:hidden items-center gap-3 justify-center mb-6">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white">
                <FiActivity className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white m-0">SentinelInvoice</h2>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight m-0">
              Welcome back
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Sign in to secure your invoices and scan for fraud threats.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 text-xs rounded-xl flex items-start gap-2.5">
              <FiAlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-semibold tracking-wide shadow-sm hover:shadow-md transition-all cursor-pointer mt-6 flex justify-center items-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Go to Register */}
          <div className="text-center text-xs text-slate-450 dark:text-slate-550 pt-2 border-t border-slate-100 dark:border-slate-850">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-indigo-600 dark:text-indigo-450 hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
