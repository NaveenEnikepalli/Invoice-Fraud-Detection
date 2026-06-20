import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiFileText, FiCalendar, FiDollarSign, FiActivity,
  FiShield, FiUsers, FiMail, FiPhone, FiCheckCircle, FiAlertTriangle,
  FiChevronRight, FiClock, FiLayers
} from 'react-icons/fi';
import invoiceService from '../services/invoiceService';
import vendorService from '../services/vendorService';
import Spinner from '../components/Spinner';
import { formatCurrency, formatDate, getRiskBadgeColor, getRiskLevel } from '../utils/format';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States
  const [invoice, setInvoice] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    const fetchAllDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch main invoice DTO
        const invRes = await invoiceService.getInvoiceById(id);
        const invData = invRes.data;
        setInvoice(invData);

        // 2. Fetch explanation (reasons, riskScore, riskLevel, related invoices)
        const expRes = await invoiceService.getFraudExplanation(id);
        setExplanation(expRes.data);

        // 3. Fetch full Vendor info if vendorId exists
        if (invData?.vendorId) {
          const venRes = await vendorService.getVendorById(invData.vendorId);
          setVendor(venRes.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve invoice details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAllDetails();
    }
  }, [id]);

  if (loading) {
    return <Spinner message="Assembling complete transaction dossier..." />;
  }

  if (error || !invoice) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/invoices')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold bg-transparent border-0 cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Invoices</span>
        </button>
        <div className="glass-card p-8 text-center text-rose-500 border-rose-250 bg-rose-50/20 dark:bg-rose-950/10 rounded-xl">
          <p className="font-semibold">{error || 'Invoice details could not be found.'}</p>
        </div>
      </div>
    );
  }

  const score = parseFloat(invoice.fraudScore || 0);
  const isHighRisk = score >= 50;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate('/invoices')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold bg-transparent border-0 cursor-pointer transition-all self-start text-sm"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Ledger</span>
        </button>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Ledger-Entry ID: #{invoice.id}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
              invoice.status === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                : invoice.status === 'REJECTED'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50'
                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
            }`}
          >
            Workflow: {invoice.status}
          </span>
        </div>
      </div>

      {/* Main details grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Main Overview & Conflicts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Overview Card */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                <FiFileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-850 dark:text-white m-0">
                  {invoice.invoiceNumber}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registered date: {formatDate(invoice.invoiceDate)}
                </p>
              </div>
            </div>

            {/* Grid details */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  Amount (USD)
                </span>
                <span className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center">
                  <FiDollarSign className="w-5 h-5 text-slate-450 dark:text-slate-500 shrink-0" />
                  {formatCurrency(invoice.amount)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  Associated Vendor
                </span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 block mt-1">
                  {invoice.vendorName || 'Not Specifed'}
                </span>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  Memo Description
                </span>
                <p className="text-xs text-slate-655 dark:text-slate-450 mt-1.5 leading-relaxed bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100/80 dark:border-slate-800/60">
                  {invoice.description || 'No memo text details supplied for this invoice entry.'}
                </p>
              </div>
            </div>
          </div>

          {/* Related Invoices / Conflicts Card */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FiLayers className="text-indigo-500 w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
                Related Invoices & System Matches
              </h3>
            </div>

            {explanation && explanation.relatedInvoices && explanation.relatedInvoices.length > 0 ? (
              <div className="space-y-2">
                <div className="p-3 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-lg text-xs leading-normal">
                  <strong>Risk Match Flagged:</strong> {explanation.relatedInvoices.length} conflicting invoice(s) exist in the system. Duplicated or highly resembling numbering represents potential invoice spoofing attempts.
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {explanation.relatedInvoices.map((rel, idx) => (
                    <Link
                      key={idx}
                      to={`/invoices/${rel.invoiceId}`}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-900 dark:hover:border-indigo-500 transition-all flex items-center justify-between group cursor-pointer text-decoration-none"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">
                          {rel.invoiceNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          ID: #{rel.invoiceId}
                        </span>
                      </div>
                      <FiChevronRight className="text-slate-400 group-hover:text-indigo-500 w-4 h-4 transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 rounded-xl flex items-center gap-3">
                <FiCheckCircle className="w-8 h-8 shrink-0 animate-pulse-slow" />
                <div className="text-xs">
                  <p className="font-bold m-0 text-sm">No conflicting references</p>
                  <p className="text-slate-450 dark:text-slate-400 mt-0.5 m-0 leading-normal">
                    This invoice has a completely unique document identifier. No similar or duplicate billing codes exist for this vendor account.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Simulated Activity Timeline */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0 flex items-center gap-2">
              <FiClock className="text-indigo-500 w-4 h-4" />
              Audit Trail Activity Timeline
            </h3>

            <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-6 space-y-6">
              {/* Event 1 */}
              <div className="relative">
                <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-950">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 m-0">Invoice Created</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Logged on {formatDate(invoice.createdAt)}
                </p>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 border-2 border-white dark:border-slate-950">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-650" />
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 m-0">Fraud Scan Index Analyzed</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Evaluating {explanation?.fraudReasons?.length || 0} triggered anomaly risk markers. Threat Score set to {Math.round(score)}%.
                </p>
              </div>

              {/* Event 3 */}
              <div className="relative">
                <span className={`absolute -left-[30px] top-0.5 flex items-center justify-center w-5 h-5 rounded-full border-2 border-white dark:border-slate-950 ${
                  invoice.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950' : invoice.status === 'REJECTED' ? 'bg-rose-100 dark:bg-rose-950' : 'bg-amber-100 dark:bg-amber-950'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    invoice.status === 'APPROVED' ? 'bg-emerald-600' : invoice.status === 'REJECTED' ? 'bg-rose-600' : 'bg-amber-600'
                  }`} />
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 m-0">Workflow Stage Updated</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Document set to <strong>{invoice.status}</strong> status. Last changed on {formatDate(invoice.updatedAt)}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fraud Index and Vendor Context */}
        <div className="space-y-6">
          {/* Fraud Explanation Context */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <FiShield className="text-indigo-500 w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
                Fraud Risk Audit
              </h3>
            </div>

            {/* Large Score Indicator */}
            <div className="flex flex-col items-center py-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 rounded-xl">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider block ${getRiskBadgeColor(score)}`}>
                {getRiskLevel(score)} Risk Index
              </span>
              <span className="text-4xl font-black text-slate-800 dark:text-white mt-3 leading-none">
                {Math.round(score)}%
              </span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-2">
                Threat Probability
              </span>
            </div>

            {/* Why flagged list */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Triggered Rule Anomaly Markers
              </span>

              {explanation && explanation.fraudReasons && explanation.fraudReasons.length > 0 ? (
                <div className="space-y-2">
                  {explanation.fraudReasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-rose-100 dark:border-rose-950/40 bg-rose-50/10 dark:bg-rose-950/10 flex items-start gap-2 text-rose-700 dark:text-rose-400"
                    >
                      <FiAlertTriangle className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                      <span className="text-xs font-semibold">{reason}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/10 dark:bg-emerald-950/10 flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
                  <FiCheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold">No rules breached</span>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Card Context */}
          {vendor && (
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <FiUsers className="text-indigo-500 w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
                  Vendor Dossier Context
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 m-0">
                    {vendor.vendorName}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    Vendor Risk Index Score: {Math.round(vendor.riskScore || 0)}%
                  </span>
                </div>

                <div className="space-y-2 text-xs pt-2">
                  <div className="flex items-center gap-2 text-slate-550 dark:text-slate-400">
                    <FiMail className="w-4 h-4 shrink-0 text-slate-400" />
                    <span className="truncate">{vendor.vendorEmail || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-550 dark:text-slate-400">
                    <FiPhone className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>{vendor.vendorPhone || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getRiskBadgeColor(
                      vendor.riskScore
                    )}`}
                  >
                    Vendor Threat Level: {getRiskLevel(vendor.riskScore)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
