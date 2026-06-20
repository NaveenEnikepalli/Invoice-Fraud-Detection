import React, { useState } from 'react';
import { FiDownload, FiFileText, FiUsers, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import api from '../api/axios';

const Reports = () => {
  const [downloading, setDownloading] = useState({});

  const handleDownload = async (endpoint, filename, reportKey) => {
    try {
      setDownloading((prev) => ({ ...prev, [reportKey]: true }));
      // Fetch the CSV directly from the server
      const blob = await api.get(endpoint, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Failed to download report: ${err.message || err}`);
    } finally {
      setDownloading((prev) => ({ ...prev, [reportKey]: false }));
    }
  };

  const reportsConfig = [
    {
      key: 'fraud',
      title: 'Fraud Alert Ledger',
      description: 'Comprehensive breakdown of all flagged invoices, risk score tiers, triggered fraud markers, and corresponding workflows.',
      icon: FiAlertTriangle,
      color: 'from-rose-500/10 to-orange-500/10 border-rose-200/50 dark:border-rose-900/30 text-rose-500',
      buttonColor: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20 text-white',
      endpoint: '/reports/fraud/csv',
      filename: 'fraud_alert_ledger.csv',
    },
    {
      key: 'vendorRisk',
      title: 'Vendor Risk Ratings',
      description: 'System-wide vendor profiles containing absolute risk scores, invoice volumes, total flagged infractions, and contact logs.',
      icon: FiUsers,
      color: 'from-amber-500/10 to-yellow-500/10 border-amber-200/50 dark:border-amber-900/30 text-amber-500',
      buttonColor: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/20 text-white',
      endpoint: '/reports/vendor-risk/csv',
      filename: 'vendor_risk_ratings.csv',
    },
    {
      key: 'invoiceSummary',
      title: 'Invoice Summary Directory',
      description: 'A structural log of all system invoices. Includes absolute values, current routing status, date of creation, and computed risk tiers.',
      icon: FiFileText,
      color: 'from-indigo-500/10 to-blue-500/10 border-indigo-200/50 dark:border-indigo-900/30 text-indigo-500',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/20 text-white',
      endpoint: '/reports/invoice-summary/csv',
      filename: 'invoice_summary_directory.csv',
    },
    {
      key: 'monthlyMetrics',
      title: 'Monthly Fraud Statistics',
      description: 'Historical performance evaluation grouped by month. Tracks aggregate invoices, average risk indexing, and saved fraud totals.',
      icon: FiTrendingUp,
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200/50 dark:border-emerald-900/30 text-emerald-500',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/20 text-white',
      endpoint: '/reports/monthly-fraud/csv',
      filename: 'monthly_fraud_statistics.csv',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white m-0">Corporate Reports</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          Export structured CSV reports directly. Downloads automatically attach audit credentials.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {reportsConfig.map((report) => {
          const Icon = report.icon;
          const isDownloading = downloading[report.key];

          return (
            <div
              key={report.key}
              className={`glass-card p-6 flex flex-col justify-between border bg-linear-to-br ${report.color} relative overflow-hidden group hover:shadow-md transition-all duration-300`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 shadow-xs border border-slate-100 dark:border-slate-800 transition-transform group-hover:scale-105">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white m-0">
                    {report.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[48px]">
                  {report.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                  Format: CSV Spreadsheet
                </span>

                <button
                  onClick={() => handleDownload(report.endpoint, report.filename, report.key)}
                  disabled={isDownloading}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs cursor-pointer select-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${report.buttonColor}`}
                >
                  <FiDownload className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                  <span>{isDownloading ? 'Exporting...' : 'Download Report'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;
