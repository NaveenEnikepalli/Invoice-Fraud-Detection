import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText, FiShield, FiUsers, FiDollarSign, FiTrendingUp,
  FiAlertOctagon, FiPieChart, FiBarChart2, FiChevronRight, FiClock, FiActivity
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../api/axios';
import analyticsService from '../services/analyticsService';
import invoiceService from '../services/invoiceService';
import vendorService from '../services/vendorService';
import StatsCard from '../components/StatsCard';
import Spinner from '../components/Spinner';
import { formatCurrency, formatDate, getRiskBadgeColor } from '../utils/format';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States
  const [summary, setSummary] = useState({});
  const [vendorsCount, setVendorsCount] = useState(0);
  const [fraudTrend, setFraudTrend] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [highRiskVendors, setHighRiskVendors] = useState([]);
  const [riskDistributionData, setRiskDistributionData] = useState([]);
  const [vendorRiskData, setVendorRiskData] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  
  // Custom counts
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [fraudulentCount, setFraudulentCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [sumRes, trendRes, invsRes, vendorsRes, logsRes] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getFraudTrends(),
          invoiceService.getAllInvoices(),
          vendorService.getAllVendors(),
          api.get('/audit-logs')
        ]);

        // 1. Set stats summary
        const sumData = sumRes.data || {};
        setSummary(sumData);
        setVendorsCount(sumData.totalVendors || vendorsRes.data?.length || 0);

        // 2. Format fraud trend map to bar chart data
        const trends = trendRes.data || {};
        const formattedTrends = Object.keys(trends).map(key => ({
          category: key,
          Count: trends[key]
        }));
        setFraudTrend(formattedTrends);

        // 3. Process all invoices
        const allInvs = invsRes.data || [];
        
        // High Risk (score >= 31 && score <= 60) & Fraudulent (score >= 61)
        // Adjust counts according to Phase 18 risk tiers:
        // LOW: 0-30, MEDIUM: 31-60, HIGH: 61-100
        let mediumRisk = 0;
        let highRisk = 0;
        let lowCount = 0;
        let medCount = 0;
        let highCount = 0;

        allInvs.forEach(inv => {
          const score = parseFloat(inv.fraudScore || 0);
          if (score > 60) {
            highRisk++;
            highCount++;
          } else if (score > 30) {
            mediumRisk++;
            medCount++;
          } else {
            lowCount++;
          }
        });

        setHighRiskCount(mediumRisk); // maps to Score 31 - 60
        setFraudulentCount(highRisk); // maps to Score > 60

        // Risk Distribution Chart Data
        setRiskDistributionData([
          { name: 'Low Risk (0-30%)', value: lowCount, color: '#10b981' },
          { name: 'Medium Risk (31-60%)', value: medCount, color: '#f59e0b' },
          { name: 'High Risk (61-100%)', value: highCount, color: '#ef4444' }
        ]);

        // Dynamic timeline formatting
        const groupedByDate = {};
        allInvs.forEach(inv => {
          const date = inv.invoiceDate || 'N/A';
          groupedByDate[date] = (groupedByDate[date] || 0) + parseFloat(inv.amount || 0);
        });
        const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));
        const timeline = sortedDates.slice(-10).map(date => ({
          date: date,
          Amount: groupedByDate[date]
        }));
        setTimelineData(timeline);

        // Recent Invoices: take last 5
        const sortedInvs = [...allInvs].sort((a, b) => b.id - a.id);
        setRecentInvoices(sortedInvs.slice(0, 5));

        // Recent Fraud Alerts: invoices with score > 30, take 5
        const alerts = allInvs
          .filter(inv => parseFloat(inv.fraudScore || 0) > 30)
          .sort((a, b) => b.id - a.id)
          .slice(0, 5);
        setFraudAlerts(alerts);

        // 4. Vendor Analysis Chart & High Risk List
        const allVendors = vendorsRes.data || [];
        const topRiskVendors = [...allVendors]
          .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
          .slice(0, 5)
          .map(v => ({
            name: v.vendorName,
            Risk: parseFloat(v.riskScore || 0)
          }));
        setVendorRiskData(topRiskVendors);

        const highRiskVens = allVendors
          .filter(v => parseFloat(v.riskScore || 0) > 30)
          .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
          .slice(0, 5);
        setHighRiskVendors(highRiskVens);

        // 5. Activity Logs: take last 8
        const logsList = logsRes.data || [];
        const sortedLogs = [...logsList].sort((a, b) => b.id - a.id);
        setActivityLogs(sortedLogs.slice(0, 8));

        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Spinner message="Assembling executive insights..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white m-0">Dashboard</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Real-time fraud audit scores and invoice transaction logs.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Quick Operations Row & System Status */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Actions Row */}
        <div className="glass-card p-6 md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">Quick Operations</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/invoices?action=new')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer transition-all animate-hover-pulse"
            >
              + Create Invoice
            </button>
            <button
              onClick={() => navigate('/vendors')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl cursor-pointer transition-all border border-slate-200 dark:border-slate-800"
            >
              + Add Vendor
            </button>
            <button
              onClick={() => navigate('/fraud-analysis')}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-semibold text-xs rounded-xl cursor-pointer transition-all border border-rose-100 dark:border-rose-900/30"
            >
              🛡️ Open Fraud Center
            </button>
          </div>
        </div>

        {/* System Status Card */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">Sentinel Engine</h3>
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 rounded-full text-[9px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Active
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-slate-400">
            <div>
              <span className="block">Latency</span>
              <strong className="text-slate-700 dark:text-slate-200 font-semibold text-sm">12ms</strong>
            </div>
            <div>
              <span className="block">Scan Accuracy</span>
              <strong className="text-slate-700 dark:text-slate-200 font-semibold text-sm">99.8%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Phase 6 (6 Columns on Desktop) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
        <StatsCard
          title="Total Invoices"
          value={summary.totalInvoices || 0}
          icon={FiFileText}
          trend=""
          trendType="neutral"
        />
        <StatsCard
          title="Total Vendors"
          value={vendorsCount}
          icon={FiUsers}
          trend=""
          trendType="neutral"
        />
        <StatsCard
          title="Fraudulent"
          value={fraudulentCount}
          icon={FiShield}
          trend=""
          trendType="negative"
          subtitle="Score ≥ 61%"
        />
        <StatsCard
          title="High Risk"
          value={highRiskCount}
          icon={FiAlertOctagon}
          trend=""
          trendType="negative"
          subtitle="Score 31% - 60%"
        />
        <StatsCard
          title="Total Value"
          value={formatCurrency(summary.totalAmount)}
          icon={FiDollarSign}
          trend=""
          trendType="neutral"
        />
        <StatsCard
          title="Avg Risk Score"
          value={`${Math.round(summary.averageRiskScore || 0)}%`}
          icon={FiActivity}
          trend=""
          trendType="neutral"
        />
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Invoice Spending Trend */}
        <div className="glass-card p-6 flex flex-col h-[340px]">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="text-indigo-500 w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
              Invoice Spending Trend
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            {timelineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Create invoices with different dates to compile transaction trends.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(tick) => `$${tick >= 1000 ? (tick/1000).toFixed(0)+'k' : tick}`}
                  />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Spent']}
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Amount"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSpent)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Fraud Risk Category Counts */}
        <div className="glass-card p-6 flex flex-col h-[340px]">
          <div className="flex items-center gap-2 mb-4">
            <FiShield className="text-indigo-500 w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
              Fraud Risk Threats Breakdown
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            {fraudTrend.every(d => d.Count === 0) ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No threat classification counts detected.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fraudTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }}
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <Bar dataKey="Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Risk Distribution Chart */}
        <div className="glass-card p-6 flex flex-col h-[340px]">
          <div className="flex items-center gap-2 mb-4">
            <FiPieChart className="text-indigo-500 w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
              Invoice Risk Distribution
            </h3>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {riskDistributionData.every(d => d.value === 0) ? (
              <div className="text-slate-400 text-xs">No invoice risk details found.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Vendor Analysis Chart */}
        <div className="glass-card p-6 flex flex-col h-[340px]">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="text-indigo-500 w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
              Top Vendors by Risk Score
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            {vendorRiskData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No vendor risk logs compiled.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorRiskData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <Bar dataKey="Risk" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Lists Row (4 Columns on Desktop) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Recent Invoices List */}
        <div className="glass-card p-6 flex flex-col h-[380px]">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 m-0">
            Recent Invoices
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {recentInvoices.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center">
                No invoices found.
              </div>
            ) : (
              recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900 transition-all cursor-pointer group"
                >
                  <div className="space-y-1 min-w-0">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">{inv.vendorName}</span>
                  </div>
                  <div className="text-right space-y-1 shrink-0">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">
                      {formatCurrency(inv.amount)}
                    </span>
                    <span className="text-[9px] text-slate-400 block">{formatDate(inv.invoiceDate)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Fraud Alerts */}
        <div className="glass-card p-6 flex flex-col h-[380px]">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 m-0 flex items-center gap-2">
            <FiAlertOctagon className="text-rose-500 w-4 h-4 animate-bounce" />
            Threat Alerts Feed
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {fraudAlerts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 rounded-xl border border-dashed border-emerald-100 dark:border-emerald-900/40 text-xs text-center p-6">
                All secure. No threat flags raised.
              </div>
            ) : (
              fraudAlerts.map((alert) => {
                const rs = parseFloat(alert.fraudScore || 0);
                return (
                  <div
                    key={alert.id}
                    onClick={() => navigate(`/fraud-investigation/${alert.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg border border-rose-100 hover:border-rose-200 dark:border-rose-950/40 dark:hover:border-rose-900/60 bg-rose-50/5 dark:bg-rose-950/5 transition-all cursor-pointer group"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 block truncate group-hover:text-rose-700 dark:group-hover:text-rose-450">
                        {alert.invoiceNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">{alert.vendorName}</span>
                    </div>
                    <div className="text-right space-y-1 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border block ${getRiskBadgeColor(rs)}`}>
                        {Math.round(rs)}%
                      </span>
                      <span className="text-[9px] font-medium text-slate-500">{formatCurrency(alert.amount)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* High Risk Vendors List */}
        <div className="glass-card p-6 flex flex-col h-[380px]">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 m-0 flex items-center gap-2">
            <FiUsers className="text-amber-500 w-4 h-4" />
            High Risk Vendors
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {highRiskVendors.length === 0 ? (
              <div className="h-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 rounded-xl border border-dashed border-emerald-100 dark:border-emerald-900/40 text-xs text-center p-6">
                No high risk vendors flagged.
              </div>
            ) : (
              highRiskVendors.map((v) => {
                const rs = parseFloat(v.riskScore || 0);
                return (
                  <div
                    key={v.id}
                    onClick={() => navigate('/vendors')}
                    className="flex items-center justify-between p-3 rounded-lg border border-amber-100 hover:border-amber-200 dark:border-amber-950/40 dark:hover:border-amber-900/60 bg-amber-50/5 dark:bg-amber-950/5 transition-all cursor-pointer group"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 block truncate group-hover:text-amber-700 dark:group-hover:text-amber-450">
                        {v.vendorName}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">{v.vendorEmail || 'No email'}</span>
                    </div>
                    <div className="text-right space-y-1 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border block ${getRiskBadgeColor(rs)}`}>
                        {Math.round(rs)}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="glass-card p-6 flex flex-col h-[380px]">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 m-0 flex items-center gap-2">
            <FiClock className="text-indigo-500 w-4 h-4" />
            Audit Log Feed
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {activityLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No activity logs available.
              </div>
            ) : (
              activityLogs.map((log, idx) => (
                <div key={log.id || idx} className="relative pl-3.5 border-l border-indigo-100 dark:border-indigo-900/60 text-[11px] space-y-0.5" style={{ minWidth: 0 }}>
                  <div className="absolute -left-[5.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-950" />
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-bold text-slate-700 dark:text-slate-305 truncate">{log.action}</span>
                    <span className="text-[9px] text-slate-400 shrink-0">{formatDate(log.createdAt)}</span>
                  </div>
                  <p className="text-[10px] text-slate-505 dark:text-slate-400 leading-normal m-0" style={{ wordBreak: 'break-word' }}>{log.details}</p>
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 font-medium block">By: {log.userEmail || 'SYSTEM'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
