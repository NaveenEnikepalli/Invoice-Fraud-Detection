import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiActivity } from 'react-icons/fi';
import analyticsService from '../services/analyticsService';
import invoiceService from '../services/invoiceService';
import Spinner from '../components/Spinner';
import { formatCurrency } from '../utils/format';

const COLORS = {
  Low: '#10b981',     // emerald 500
  Medium: '#f59e0b',  // amber 500
  High: '#f97316',    // orange 500
  Critical: '#ef4444',// red 500
  PENDING: '#a855f7', // purple 500
  REVIEW: '#fbbf24',  // amber 400
  APPROVED: '#34d399',// emerald 400
  REJECTED: '#f87171' // red 400
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [summary, setSummary] = useState({});
  const [fraudTrends, setFraudTrends] = useState([]);
  const [vendorRisk, setVendorRisk] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumRes, trendRes, riskRes, invoicesRes] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getFraudTrends(),
          analyticsService.getVendorRiskRanking(),
          invoiceService.getAllInvoices()
        ]);

        setSummary(sumRes.data || {});

        // Process fraud trends Map to Recharts Pie format
        const trends = trendRes.data || {};
        const formattedTrends = Object.keys(trends).map(key => ({
          name: key,
          value: trends[key]
        }));
        setFraudTrends(formattedTrends);

        // Process vendor risk (take top 8 for clean view)
        const vendors = riskRes.data || [];
        const formattedRisk = vendors.slice(0, 8).map(v => ({
          name: v.vendorName.length > 15 ? v.vendorName.substring(0, 15) + '...' : v.vendorName,
          'Risk Score': parseFloat(v.riskScore || 0)
        }));
        setVendorRisk(formattedRisk);

        // Process invoices to compile timeline chart and status counts
        const invoices = invoicesRes.data || [];
        
        // Group by Date for timeline
        const groupedByDate = {};
        invoices.forEach(inv => {
          const date = inv.invoiceDate || 'N/A';
          if (!groupedByDate[date]) {
            groupedByDate[date] = { count: 0, amount: 0, fraudScore: 0 };
          }
          groupedByDate[date].count += 1;
          groupedByDate[date].amount += parseFloat(inv.amount || 0);
          groupedByDate[date].fraudScore += parseFloat(inv.fraudScore || 0);
        });

        const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));
        const formattedTimeline = sortedDates.map(date => ({
          date: date,
          'Amount Spent': groupedByDate[date].amount,
          'Avg Fraud Score': Math.round(groupedByDate[date].fraudScore / groupedByDate[date].count),
          'Volume': groupedByDate[date].count
        }));
        setTimelineData(formattedTimeline);

        // Group by Status
        const groupedStatus = {};
        invoices.forEach(inv => {
          const status = inv.status || 'PENDING';
          groupedStatus[status] = (groupedStatus[status] || 0) + 1;
        });
        const formattedStatus = Object.keys(groupedStatus).map(key => ({
          name: key,
          value: groupedStatus[key]
        }));
        setStatusData(formattedStatus);

        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Spinner message="Compiling analytics dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white m-0">Analytics & Reports</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          Detailed metrics, risk profiles, and historical spending data.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Grid of charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Fraud Distribution (Pie Chart) */}
        <div className="glass-card p-6 flex flex-col h-[380px]">
          <div className="flex items-center gap-2 mb-4">
            <FiPieChart className="text-indigo-500 w-5 h-5" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-white m-0">
              Fraud Threat Distribution
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            {fraudTrends.every(d => d.value === 0) ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No threat classification data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fraudTrends}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {fraudTrends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      color: '#1e293b'
                    }}
                  />
                  <Legend verticalAlign="bottom" iconSize={10} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Vendor Analysis (Bar Chart) */}
        <div className="glass-card p-6 flex flex-col h-[380px]">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="text-indigo-500 w-5 h-5" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-white m-0">
              Vendor Risk Comparison
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            {vendorRisk.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No vendor risk data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorRisk}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }}
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <Bar dataKey="Risk Score" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {vendorRisk.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry['Risk Score'] > 60 ? COLORS.High : entry['Risk Score'] > 30 ? COLORS.Medium : COLORS.Low}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Invoice Spending Growth (Area Chart) */}
        <div className="glass-card p-6 flex flex-col h-[380px] md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="text-indigo-500 w-5 h-5" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-white m-0">
                Spending & Financial Timelines
              </h3>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Total Invoices: {summary.totalInvoices || 0} ({formatCurrency(summary.totalAmount)})
            </span>
          </div>
          <div className="flex-1 min-h-0">
            {timelineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No transaction history to display. Create some invoices to plot growth.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(tick) => `$${tick >= 1000 ? (tick/1000).toFixed(0)+'k' : tick}`}
                  />
                  <Tooltip
                    formatter={(val, name) => [name === 'Amount Spent' ? formatCurrency(val) : val, name]}
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Amount Spent"
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

        {/* Invoice Status Distribution (Pie Chart) */}
        <div className="glass-card p-6 flex flex-col h-[320px]">
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="text-indigo-500 w-5 h-5" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-white m-0">
              Workflow Status Overview
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            {statusData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No workflow status to show.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#a855f7'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <Legend verticalAlign="bottom" iconSize={10} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* High Risk Stats */}
        <div className="glass-card p-6 flex flex-col justify-between h-[320px]">
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white m-0">
              Key Risk Risk Markers
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              High risk nodes identified during automated system audit scan.
            </p>
          </div>

          <div className="space-y-4 my-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Flagged Invoices (Score &ge; 50%)</span>
              <span className="text-sm font-bold text-rose-500">{summary.flaggedInvoices || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">High Risk Vendors (Score &ge; 50%)</span>
              <span className="text-sm font-bold text-rose-500">{summary.highRiskVendors || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">System Risk Density</span>
              <span className="text-sm font-bold text-amber-500">
                {summary.totalInvoices
                  ? ((summary.flaggedInvoices / summary.totalInvoices) * 100).toFixed(1)
                  : '0.0'}%
              </span>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl text-[11px] text-indigo-600 dark:text-indigo-400 text-center font-medium leading-relaxed">
            Data aggregates refresh dynamically based on recent workflow status updates.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
