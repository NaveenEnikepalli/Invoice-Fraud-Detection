import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiInfo, FiChevronRight, FiSearch, FiLayers } from 'react-icons/fi';
import invoiceService from '../services/invoiceService';
import Spinner from '../components/Spinner';
import { formatCurrency, getRiskBadgeColor, getRiskLevel } from '../utils/format';

const FraudAnalysis = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedInvoiceId = searchParams.get('invoiceId');

  const [invoices, setInvoices] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [explanation, setExplanation] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorList, setErrorList] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all invoices for the list
  const fetchInvoices = async () => {
    try {
      setLoadingList(true);
      const res = await invoiceService.getAllInvoices();
      // Sort: high fraud scores first
      const sorted = (res.data || []).sort((a, b) => (b.fraudScore || 0) - (a.fraudScore || 0));
      setInvoices(sorted);
      setErrorList(null);
    } catch (err) {
      setErrorList(err.message || 'Failed to load invoices list.');
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch specific explanation
  const fetchExplanation = async (id) => {
    try {
      setLoadingDetail(true);
      const res = await invoiceService.getFraudExplanation(id);
      setExplanation(res.data);
      setErrorDetail(null);
    } catch (err) {
      setErrorDetail(err.message || 'Failed to load fraud explanation.');
      setExplanation(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (selectedInvoiceId) {
      fetchExplanation(selectedInvoiceId);
    } else {
      setExplanation(null);
    }
  }, [selectedInvoiceId]);

  const handleSelectInvoice = (id) => {
    setSearchParams({ invoiceId: id });
  };

  const clearSelection = () => {
    setSearchParams({});
  };

  // Filter invoices for search
  const filteredInvoices = invoices.filter((inv) => {
    const search = searchTerm.toLowerCase();
    return (
      inv.invoiceNumber?.toLowerCase().includes(search) ||
      inv.vendorName?.toLowerCase().includes(search)
    );
  });

  // Circle properties for circular gauge
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  const getCircleStroke = (score) => {
    if (score >= 75) return '#ef4444'; // Red
    if (score >= 25) return '#f59e0b'; // Amber
    return '#10b981'; // Emerald
  };

  const canonicalScore = explanation
    ? parseFloat(explanation.fraudScore ?? explanation.riskScore ?? 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white m-0">Fraud Scanner</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          Automatically analyze invoices, detect duplicate records, and flag suspicious activities.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left/Main Column: Invoices List */}
        <div className={`glass-card p-4 space-y-4 lg:col-span-1 ${selectedInvoiceId ? 'hidden lg:block' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">Fraud Risk Feed</h3>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-full text-slate-500 font-semibold uppercase">
              Priority View
            </span>
          </div>

          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Filter by invoice/vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {loadingList ? (
            <Spinner size="small" message="" />
          ) : errorList ? (
            <div className="text-xs text-rose-500 p-2 bg-rose-50 rounded-lg border border-rose-100">
              {errorList}
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No invoices found.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredInvoices.map((inv) => {
                const isSelected = selectedInvoiceId === String(inv.id);
                const score = parseFloat(inv.fraudScore || 0);
                return (
                  <button
                    key={inv.id}
                    onClick={() => handleSelectInvoice(inv.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 block truncate">
                          {inv.invoiceNumber}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded-xs text-[9px] font-semibold border ${getRiskBadgeColor(score)}`}>
                          {Math.round(score)}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">{inv.vendorName}</span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {formatCurrency(inv.amount)}
                      </span>
                    </div>
                    <FiChevronRight className="text-slate-400 w-4 h-4 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Fraud Explanation */}
        <div className={`lg:col-span-2 space-y-6 ${!selectedInvoiceId ? 'block' : ''}`}>
          {loadingDetail ? (
            <div className="glass-card p-12 flex items-center justify-center">
              <Spinner message="Fetching fraud audit logs..." />
            </div>
          ) : errorDetail ? (
            <div className="glass-card p-6 border border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 text-sm rounded-xl">
              <p className="font-semibold">{errorDetail}</p>
              <button
                onClick={clearSelection}
                className="mt-4 text-xs font-semibold underline text-rose-800 dark:text-rose-300 bg-transparent border-0 cursor-pointer"
              >
                Go Back to Invoices
              </button>
            </div>
          ) : explanation ? (
            <div className="space-y-6">
              {/* Main Card with Circular progress and Status details */}
              <div className="glass-card p-6 flex flex-col md:flex-row items-center gap-8 relative">
                {/* Back button for mobile screen views */}
                <button
                  onClick={clearSelection}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white lg:hidden bg-transparent border-0 cursor-pointer"
                >
                  Close
                </button>

                {/* SVG Circular progress */}
                <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      stroke="#f1f5f9"
                      strokeWidth={strokeWidth}
                      className="dark:stroke-slate-800"
                      fill="transparent"
                    />
                    {/* Animated foreground Circle */}
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      stroke={getCircleStroke(canonicalScore)}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={
                        circumference - (canonicalScore / 100) * circumference
                      }
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-800 dark:text-white leading-none">
                      {Math.round(canonicalScore)}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                      Risk Score
                    </span>
                  </div>
                </div>

                {/* Score context detail */}
                <div className="space-y-3 flex-1 text-center md:text-left">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                      Analytica-Scan ID: #{explanation.invoiceId}
                    </span>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-1 m-0">
                      {explanation.invoiceNumber}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getRiskBadgeColor(
                        canonicalScore
                      )}`}
                    >
                      {getRiskLevel(canonicalScore)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800">
                      Status: {explanation.fraudStatus || 'PENDING'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                    This risk calculation represents structural, behavioral, and data validation scans against duplicate counts, similar matching algorithms, and suspicious amount categories.
                  </p>
                </div>
              </div>

              {/* Reasons detailed cards */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <FiShield className="text-indigo-500 w-5 h-5" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
                    Fraud Reasons & Audits
                  </h3>
                </div>

                {(!explanation.fraudReasons || explanation.fraudReasons.length === 0) ? (
                  <div className="p-4 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 rounded-xl flex items-center gap-2">
                    <FiCheckCircle className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-semibold">No critical fraud rules triggered.</span>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {explanation.fraudReasons.map((reason, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-rose-100 dark:border-rose-950/40 bg-rose-50/10 dark:bg-rose-950/10 flex items-start gap-2.5 text-rose-705 dark:text-rose-400 text-xs"
                      >
                        <FiAlertTriangle className="w-4 h-4 shrink-0 mt-0.5 animate-pulse text-rose-500" />
                        <div>
                          <strong className="block font-bold">{reason}</strong>
                          {reason.includes("Duplicate") && (
                            <span className="text-[10px] text-slate-450 block mt-0.5">An identical invoice number exists from this vendor.</span>
                          )}
                          {reason.includes("Similar") && (
                            <span className="text-[10px] text-slate-450 block mt-0.5">Typographical alterations detected on the invoice number.</span>
                          )}
                          {reason.includes("Amount") && (
                            <span className="text-[10px] text-slate-450 block mt-0.5">Invoice amount is extremely high or deviates significantly from vendor averages.</span>
                          )}
                          {reason.includes("Vendor") && (
                            <span className="text-[10px] text-slate-450 block mt-0.5">The vendor has a historically high risk index score.</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Related Invoices Matches Card */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <FiLayers className="text-indigo-500 w-5 h-5" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
                    Related Conflicting Invoices
                  </h3>
                </div>

                {(!explanation.relatedInvoices || explanation.relatedInvoices.length === 0) ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                    <FiInfo className="w-4 h-4 text-indigo-550 shrink-0" />
                    <span>No related matching invoices found in history database.</span>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {explanation.relatedInvoices.map((rel, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(`/invoices/${rel.invoiceId}`)}
                        className="p-3 rounded-lg border border-slate-150 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-900 transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">
                            {rel.invoiceNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Audit Details ID: #{rel.invoiceId}
                          </span>
                        </div>
                        <FiChevronRight className="text-slate-400 group-hover:text-indigo-500 w-4 h-4 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-start gap-3">
                <FiInfo className="text-indigo-500 w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-505 dark:text-slate-400 space-y-1">
                  <span className="font-semibold block text-slate-700 dark:text-slate-300">Action Recommended:</span>
                  {Math.round(canonicalScore) >= 75 ? (
                    <span>This invoice is highly suspicious. Recommend changing status to <strong>REJECTED</strong> immediately and auditing vendor phone/email settings.</span>
                  ) : Math.round(canonicalScore) >= 25 ? (
                    <span>This invoice has medium threats. Please send it to <strong>REVIEW</strong> status and request manual verification.</span>
                  ) : (
                    <span>Risk threat profile is minimal. Recommend marking as <strong>APPROVED</strong>.</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3 h-[400px]">
              <FiShield className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-bounce" />
              <div>
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">No Invoice Selected</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-normal">
                  Select an invoice from the left panel feed to view its detailed fraud metrics, triggered markers, and audit logs.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FraudAnalysis;
