import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiFileText, FiPlus, FiSearch, FiSliders, FiShield, FiEdit, FiTrash2, FiExternalLink } from 'react-icons/fi';
import invoiceService from '../services/invoiceService';
import Spinner from '../components/Spinner';
import InvoiceForm from '../components/InvoiceForm';
import { formatCurrency, formatDate, getRiskBadgeColor, getRiskLevel } from '../utils/format';

const Invoices = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getAllInvoices();
      setInvoices(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch invoices.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingInvoice(null);
    setModalOpen(true);
  };

  useEffect(() => {
    loadInvoices();
    if (searchParams.get('action') === 'new') {
      openAddModal();
    }
  }, [searchParams]);

  const handleCreateInvoice = async (payload) => {
    try {
      await invoiceService.createInvoice(payload);
      loadInvoices();
    } catch (err) {
      throw err; // Propagates validation errors back to the form
    }
  };

  const handleUpdateInvoice = async (payload) => {
    if (!editingInvoice) return;
    try {
      await invoiceService.updateInvoice(editingInvoice.id, payload);
      loadInvoices();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await invoiceService.deleteInvoice(id);
      loadInvoices();
    } catch (err) {
      alert(err.message || 'Failed to delete invoice.');
    }
  };

  const openEditModal = (invoice) => {
    setEditingInvoice(invoice);
    setModalOpen(true);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber?.toLowerCase().includes(search) ||
      inv.vendorName?.toLowerCase().includes(search);
    
    const matchesStatus = !statusFilter || inv.status === statusFilter;
    
    let matchesRisk = true;
    const score = parseFloat(inv.fraudScore || 0);
    if (riskFilter === 'HIGH') matchesRisk = score > 60;
    else if (riskFilter === 'MEDIUM') matchesRisk = score > 30 && score <= 60;
    else if (riskFilter === 'LOW') matchesRisk = score <= 30;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  if (loading && invoices.length === 0) return <Spinner message="Loading invoice vault..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white m-0">Invoice Vault</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Store invoices securely, index structural records, and search files instantly.
          </p>
        </div>
        <button
          onClick={openAddModal}
          type="button"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md cursor-pointer transition-all self-start"
        >
          <FiPlus className="w-4 h-4" />
          <span>New Invoice</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Main Ledger Card */}
      <div className="glass-card overflow-hidden">
        {/* Filters Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by invoice # or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase">
              <FiSliders className="w-3.5 h-3.5" />
              <span>Filters</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 focus:outline-hidden"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="REVIEW">REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 focus:outline-hidden"
            >
              <option value="">All Risks</option>
              <option value="HIGH">HIGH RISK (&gt;60%)</option>
              <option value="MEDIUM">MEDIUM RISK (31% - 60%)</option>
              <option value="LOW">LOW RISK (&le;30%)</option>
            </select>

            {invoices.length > 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto md:ml-0 font-medium">
                Matches: {filteredInvoices.length}
              </span>
            )}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No invoices found matching current filters.
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Invoice Number</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Invoice Date</th>
                  <th className="px-6 py-4">Threat Index</th>
                  <th className="px-6 py-4">Workflow Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredInvoices.map((inv) => {
                  const score = parseFloat(inv.fraudScore || 0);
                  const isHighRisk = score > 30;
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-350">
                        {inv.vendorName || `Vendor ID: ${inv.vendorId}`}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="px-6 py-4">
                        {formatDate(inv.invoiceDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getRiskBadgeColor(
                              score
                            )}`}
                          >
                            {Math.round(score)}%
                          </span>
                          {isHighRisk && (
                            <button
                              onClick={() => navigate(`/fraud-analysis?invoiceId=${inv.id}`)}
                              type="button"
                              className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 p-0.5 bg-transparent border-0 cursor-pointer"
                              title="View fraud details"
                            >
                              <FiShield className="w-3.5 h-3.5 animate-pulse-slow" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            inv.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                              : inv.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50'
                              : inv.status === 'REVIEW'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
                              : 'bg-slate-100 text-slate-650 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => navigate(`/fraud-analysis?invoiceId=${inv.id}`)}
                            type="button"
                            className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-150 dark:hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer"
                            title="Audit Details"
                          >
                            <FiExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(inv)}
                            type="button"
                            className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-slate-150 dark:hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer"
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(inv.id)}
                            type="button"
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-150 dark:hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Form Dialog Modal */}
      <InvoiceForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}
        initialData={editingInvoice}
      />
    </div>
  );
};

export default Invoices;
