import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiChevronLeft, FiShield, FiAlertTriangle, FiCheckCircle, FiInfo,
  FiLayers, FiUsers, FiClock, FiSave, FiEye, FiFileText
} from 'react-icons/fi';
import invoiceService from '../services/invoiceService';
import Spinner from '../components/Spinner';
import { formatCurrency, formatDate, getRiskBadgeColor, getRiskLevel } from '../utils/format';

const FraudInvestigation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data States
  const [invoice, setInvoice] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Modal State
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [conflictingInvoice, setConflictingInvoice] = useState(null);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invRes, expRes] = await Promise.all([
        invoiceService.getInvoiceById(id),
        invoiceService.getFraudExplanation(id)
      ]);
      
      setInvoice(invRes.data);
      setExplanation(expRes.data);
      setNotes(invRes.data?.investigationNotes || '');
    } catch (err) {
      setError(err.message || 'Failed to fetch fraud workspace details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [id]);

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      setNotesSuccess(false);
      await invoiceService.updateNotes(id, notes);
      setNotesSuccess(true);
      setTimeout(() => setNotesSuccess(false), 3000);
    } catch (err) {
      alert(`Failed to save notes: ${err.message || err}`);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!invoice) return;
    try {
      setUpdatingStatus(true);
      // Create invoice request payload conforming to InvoiceRequestDTO
      const payload = {
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        invoiceDate: invoice.invoiceDate,
        status: newStatus,
        vendorId: invoice.vendorId,
        description: invoice.description,
        fraudScore: invoice.fraudScore
      };
      
      const res = await invoiceService.updateInvoice(id, payload);
      setInvoice(res.data);
      
      // Re-fetch explanation to refresh timeline activity logs
      const expRes = await invoiceService.getFraudExplanation(id);
      setExplanation(expRes.data);
    } catch (err) {
      alert(`Failed to update status: ${err.message || err}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openComparison = (conflictingInv) => {
    setConflictingInvoice(conflictingInv);
    setComparisonModalOpen(true);
  };

  const closeComparison = () => {
    setConflictingInvoice(null);
    setComparisonModalOpen(false);
  };

  if (loading) {
    return <Spinner message="Compiling fraud detection matrix..." />;
  }

  if (error) {
    return (
      <div className="glass-card p-6 border border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 text-sm rounded-xl">
        <h3 className="font-bold">Investigation Error</h3>
        <p className="mt-2">{error}</p>
        <button
          onClick={() => navigate('/fraud-analysis')}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold cursor-pointer border-0"
        >
          Back to Fraud Center
        </button>
      </div>
    );
  }

  const score = parseFloat(invoice?.fraudScore || 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/fraud-analysis')}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800 dark:text-white m-0">
                Fraud Investigation Workspace
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getRiskBadgeColor(score)}`}>
                {getRiskLevel(score)} Risk
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Invoice #{invoice?.invoiceNumber} &bull; Vendor: {invoice?.vendorName}
            </p>
          </div>
        </div>

        {/* Status Actions Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Workflow Status:</span>
          <select
            value={invoice?.status || 'PENDING'}
            disabled={updatingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold bg-white dark:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="PENDING">PENDING</option>
            <option value="REVIEW">UNDER REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Metrics & Conflicting Evidence */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Fraud Summary Card */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <FiShield className="text-indigo-500 w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
                Fraud Scan Summary
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Circular Gauge */}
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="48"
                    stroke="#f1f5f9"
                    strokeWidth={8}
                    className="dark:stroke-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="48"
                    stroke={score >= 61 ? '#ef4444' : score >= 31 ? '#f59e0b' : '#10b981'}
                    strokeWidth={8}
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 - (score / 100) * 2 * Math.PI * 48}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">
                    {Math.round(score)}%
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                    Risk Score
                  </span>
                </div>
              </div>

              {/* Summary details */}
              <div className="grid gap-4 sm:grid-cols-2 flex-1 w-full text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">Invoice Number</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{invoice?.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Vendor Name</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{invoice?.vendorName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Invoice Value</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(invoice?.amount)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Invoice Date</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{formatDate(invoice?.invoiceDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fraud Reasons Card */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <FiAlertTriangle className="text-rose-500 w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
                Triggered Infractions
              </h3>
            </div>

            {(!explanation?.fraudReasons || explanation.fraudReasons.length === 0) ? (
              <div className="p-4 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 rounded-xl flex items-center gap-2">
                <FiCheckCircle className="w-5 h-5 shrink-0" />
                <span className="text-xs font-semibold">Clean Profile. No threat rules triggered.</span>
              </div>
            ) : (
              <div className="grid gap-3">
                {explanation.fraudReasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-rose-100 dark:border-rose-950/40 bg-rose-50/10 dark:bg-rose-950/10 flex items-start gap-3 text-rose-700 dark:text-rose-450 text-xs"
                  >
                    <FiAlertTriangle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
                    <div>
                      <strong className="block font-bold">{reason}</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {reason.includes("Duplicate Invoice Number") && "An identical invoice number has already been processed for this vendor (+40)."}
                        {reason.includes("Duplicate Amount") && "Another invoice with the exact same amount has been submitted by this vendor (+30)."}
                        {reason.includes("Vendor Mismatch") && "The associated vendor has a high historical risk score index (+20)."}
                        {reason.includes("Frequency Anomaly") && "Multiple invoices submitted within a short 24-hour time window (+15)."}
                        {reason.includes("Suspicious Pattern") && "The invoice amount is unusually high or significantly exceeds historical averages (+25)."}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Invoices Card */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <FiLayers className="text-indigo-500 w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
                Related Conflicting Invoices
              </h3>
            </div>

            {(!explanation?.relatedInvoices || explanation.relatedInvoices.length === 0) ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                <FiInfo className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>No historical duplicate or date-conflicting invoices found.</span>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {explanation.relatedInvoices.map((rel, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">
                        Invoice #{rel.invoiceNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Amount: {formatCurrency(rel.amount)} &bull; Date: {formatDate(rel.invoiceDate)}
                      </span>
                    </div>
                    <button
                      onClick={() => openComparison(rel)}
                      className="p-1.5 rounded-lg text-indigo-650 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold"
                      title="Compare side-by-side"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>Compare</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Vendor stats, investigation notes, and timeline */}
        <div className="space-y-6">
          
          {/* Vendor Information Card */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <FiUsers className="text-indigo-500 w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
                Vendor Threat Profile
              </h3>
            </div>

            {explanation?.vendorInfo ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-100 block truncate">
                      {explanation.vendorInfo.vendorName}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate">{explanation.vendorInfo.vendorEmail}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadgeColor(explanation.vendorInfo.riskScore)}`}>
                    {Math.round(explanation.vendorInfo.riskScore)}% Risk
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-905 p-2.5 rounded-lg text-center">
                    <span className="text-slate-405 block text-[10px]">Total Invoices</span>
                    <span className="font-bold text-sm text-slate-800 dark:text-white">
                      {explanation.vendorInfo.totalInvoices || 0}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-905 p-2.5 rounded-lg text-center">
                    <span className="text-slate-405 block text-[10px]">Flagged Invoices</span>
                    <span className="font-bold text-sm text-rose-500">
                      {explanation.vendorInfo.totalFlaggedInvoices || 0}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">No vendor metrics loaded.</div>
            )}
          </div>

          {/* Investigation Notes Card */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FiFileText className="text-indigo-500 w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
                  Investigation Notes
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log notes about verification checks, duplicate matches, or vendor callbacks..."
                className="w-full min-h-[100px] p-3 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />

              <div className="flex items-center justify-between">
                {notesSuccess ? (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <FiCheckCircle className="w-3.5 h-3.5" /> Saved notes!
                  </span>
                ) : (
                  <span />
                )}

                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FiSave className="w-3.5 h-3.5" />
                  <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <FiClock className="text-indigo-500 w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
                Audit Timeline
              </h3>
            </div>

            {(!explanation?.timeline || explanation.timeline.length === 0) ? (
              <div className="text-xs text-slate-400 p-2">No timeline log records compiled.</div>
            ) : (
              <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 space-y-4 ml-1">
                {explanation.timeline.map((log, idx) => (
                  <div key={log.id || idx} className="relative text-xs">
                    {/* Circle marker */}
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-550 border-2 border-white dark:border-slate-950" />
                    
                    <span className="text-[10px] font-semibold text-slate-400 block leading-none">
                      {formatDate(log.createdAt)}
                    </span>
                    <strong className="block text-slate-700 dark:text-slate-200 mt-1">{log.action}</strong>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{log.userEmail || 'SYSTEM'}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Modal */}
      {comparisonModalOpen && conflictingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0 flex items-center gap-2">
                <FiLayers className="text-rose-500 w-5 h-5" />
                Side-by-Side Invoice Audit Mismatch
              </h3>
              <button
                onClick={closeComparison}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer border-0 bg-transparent"
              >
                Close
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 grid gap-6 md:grid-cols-2 text-sm leading-normal">
              {/* Primary Invoice (Current) */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider m-0">
                  Primary Invoice (Under Investigation)
                </h4>

                <div className="space-y-3">
                  <div className={`p-3 rounded-lg border ${
                    invoice.invoiceNumber === conflictingInvoice.invoiceNumber
                      ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-955/10 dark:border-rose-900/40 text-rose-700 dark:text-rose-400'
                      : 'bg-slate-50 border-slate-150 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-300'
                  }`}>
                    <span className="text-[10px] text-slate-400 dark:text-slate-550 block font-semibold">Invoice Number</span>
                    <span className="font-bold text-xs">{invoice.invoiceNumber}</span>
                  </div>

                  <div className={`p-3 rounded-lg border ${
                    invoice.vendorName === conflictingInvoice.vendorName
                      ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-955/10 dark:border-rose-900/40 text-rose-700 dark:text-rose-400'
                      : 'bg-slate-50 border-slate-150 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-300'
                  }`}>
                    <span className="text-[10px] text-slate-400 dark:text-slate-550 block font-semibold">Vendor Name</span>
                    <span className="font-bold text-xs">{invoice.vendorName}</span>
                  </div>

                  <div className={`p-3 rounded-lg border ${
                    parseFloat(invoice.amount) === parseFloat(conflictingInvoice.amount)
                      ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-955/10 dark:border-rose-900/40 text-rose-700 dark:text-rose-400'
                      : 'bg-slate-50 border-slate-150 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-300'
                  }`}>
                    <span className="text-[10px] text-slate-400 dark:text-slate-550 block font-semibold">Amount</span>
                    <span className="font-bold text-xs">{formatCurrency(invoice.amount)}</span>
                  </div>

                  <div className={`p-3 rounded-lg border ${
                    invoice.invoiceDate === conflictingInvoice.invoiceDate
                      ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-955/10 dark:border-rose-900/40 text-rose-700 dark:text-rose-400'
                      : 'bg-slate-50 border-slate-150 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-300'
                  }`}>
                    <span className="text-[10px] text-slate-400 dark:text-slate-550 block font-semibold">Invoice Date</span>
                    <span className="font-bold text-xs">{formatDate(invoice.invoiceDate)}</span>
                  </div>
                </div>
              </div>

              {/* Conflicting Invoice */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-rose-600 dark:text-rose-450 uppercase tracking-wider m-0">
                  Conflicting Invoice (From History)
                </h4>

                <div className="space-y-3">
                  <div className={`p-3 rounded-lg border ${
                    invoice.invoiceNumber === conflictingInvoice.invoiceNumber
                      ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-955/10 dark:border-rose-900/40 text-rose-700 dark:text-rose-400'
                      : 'bg-slate-50 border-slate-150 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-300'
                  }`}>
                    <span className="text-[10px] text-slate-400 dark:text-slate-550 block font-semibold">Invoice Number</span>
                    <span className="font-bold text-xs">{conflictingInvoice.invoiceNumber}</span>
                  </div>

                  <div className={`p-3 rounded-lg border ${
                    invoice.vendorName === conflictingInvoice.vendorName
                      ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-955/10 dark:border-rose-900/40 text-rose-700 dark:text-rose-400'
                      : 'bg-slate-50 border-slate-150 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-300'
                  }`}>
                    <span className="text-[10px] text-slate-400 dark:text-slate-550 block font-semibold">Vendor Name</span>
                    <span className="font-bold text-xs">{conflictingInvoice.vendorName}</span>
                  </div>

                  <div className={`p-3 rounded-lg border ${
                    parseFloat(invoice.amount) === parseFloat(conflictingInvoice.amount)
                      ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-955/10 dark:border-rose-900/40 text-rose-700 dark:text-rose-400'
                      : 'bg-slate-50 border-slate-150 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-300'
                  }`}>
                    <span className="text-[10px] text-slate-400 dark:text-slate-550 block font-semibold">Amount</span>
                    <span className="font-bold text-xs">{formatCurrency(conflictingInvoice.amount)}</span>
                  </div>

                  <div className={`p-3 rounded-lg border ${
                    invoice.invoiceDate === conflictingInvoice.invoiceDate
                      ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-955/10 dark:border-rose-900/40 text-rose-700 dark:text-rose-400'
                      : 'bg-slate-50 border-slate-150 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-300'
                  }`}>
                    <span className="text-[10px] text-slate-400 dark:text-slate-550 block font-semibold">Invoice Date</span>
                    <span className="font-bold text-xs">{formatDate(conflictingInvoice.invoiceDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 flex justify-end gap-3">
              <button
                onClick={closeComparison}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeComparison();
                  navigate(`/invoices/${conflictingInvoice.invoiceId}`);
                }}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white font-semibold text-xs rounded-lg cursor-pointer"
              >
                Go to Conflicting Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FraudInvestigation;
