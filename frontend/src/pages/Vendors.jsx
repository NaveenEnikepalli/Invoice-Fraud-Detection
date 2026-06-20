import React, { useEffect, useState } from 'react';
import { FiUsers, FiPlus, FiSearch, FiX, FiCheck, FiMail, FiPhone, FiTrendingUp } from 'react-icons/fi';
import vendorService from '../services/vendorService';
import invoiceService from '../services/invoiceService';
import Spinner from '../components/Spinner';
import { formatCurrency, getRiskBadgeColor, getRiskLevel } from '../utils/format';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    riskScore: 0,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vendorsRes, invoicesRes] = await Promise.all([
        vendorService.getAllVendors(),
        invoiceService.getAllInvoices(),
      ]);
      setVendors(vendorsRes.data || []);
      setInvoices(invoicesRes.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch vendor data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'riskScore' ? parseFloat(value) || 0 : value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.vendorName.trim()) errors.vendorName = 'Vendor name is required';
    if (!formData.vendorEmail.trim()) {
      errors.vendorEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.vendorEmail)) {
      errors.vendorEmail = 'Invalid email format';
    }
    if (formData.riskScore < 0 || formData.riskScore > 100) {
      errors.riskScore = 'Risk score must be between 0 and 100';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      await vendorService.createVendor(formData);
      setFormData({ vendorName: '', vendorEmail: '', vendorPhone: '', riskScore: 0 });
      setShowAddForm(false);
      setFormErrors({});
      fetchData();
    } catch (err) {
      if (err.validationErrors) {
        setFormErrors(err.validationErrors);
      } else {
        setFormErrors({ api: err.message });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteVendor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor? This will fail if there are invoices associated with them.')) return;
    try {
      await vendorService.deleteVendor(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete vendor.');
    }
  };

  // Calculations
  const getVendorInvoices = (vendorId) => {
    return invoices.filter((inv) => inv.vendorId === vendorId);
  };

  const getVendorStats = (vendorId) => {
    const vendorInvs = getVendorInvoices(vendorId);
    const count = vendorInvs.length;
    const amount = vendorInvs.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    return { count, amount };
  };

  // Filter vendors
  const filteredVendors = vendors.filter((vendor) => {
    const search = searchTerm.toLowerCase();
    return (
      vendor.vendorName?.toLowerCase().includes(search) ||
      vendor.vendorEmail?.toLowerCase().includes(search) ||
      vendor.vendorPhone?.includes(search)
    );
  });

  const avgRisk = vendors.length
    ? vendors.reduce((sum, v) => sum + (v.riskScore || 0), 0) / vendors.length
    : 0;

  const totalSpent = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

  if (loading) return <Spinner message="Loading vendors data..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white m-0">Vendor Intelligence</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Analyze vendor threat profiles, monitor risk scores, and track flagged invoices.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          type="button"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md cursor-pointer transition-all self-start"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Errors */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Active Vendors
            </span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1 m-0">
              {vendors.length}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400">
            <FiUsers className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Avg Risk Score
            </span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1 m-0">
              {avgRisk.toFixed(1)}%
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400">
            <FiTrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Invoiced Amount
            </span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1 m-0">
              {formatCurrency(totalSpent)}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400">
            <span className="text-base font-bold">$</span>
          </div>
        </div>
      </div>

      {/* Main Vendor List View */}
      <div className="glass-card overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Showing {filteredVendors.length} of {vendors.length} vendors
          </span>
        </div>

        {/* Vendors Table */}
        <div className="overflow-x-auto">
          {filteredVendors.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No vendors found matching search criteria.
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Vendor Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Invoices</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Risk Rating</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredVendors.map((vendor) => {
                  const stats = getVendorStats(vendor.id);
                  return (
                    <tr
                      key={vendor.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                        {vendor.vendorName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 text-xs text-slate-400">
                          {vendor.vendorEmail && (
                            <span className="flex items-center gap-1.5">
                              <FiMail className="w-3 h-3" />
                              {vendor.vendorEmail}
                            </span>
                          )}
                          {vendor.vendorPhone && (
                            <span className="flex items-center gap-1.5">
                              <FiPhone className="w-3 h-3" />
                              {vendor.vendorPhone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {stats.count}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        {formatCurrency(stats.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRiskBadgeColor(
                              vendor.riskScore
                            )}`}
                          >
                            {vendor.riskScore ? `${vendor.riskScore}%` : '0%'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                            {getRiskLevel(vendor.riskScore)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteVendor(vendor.id)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-semibold border-0 bg-transparent hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Vendor Modal Dialog */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="glass-card w-full max-w-md bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-white m-0">Add New Vendor</h3>
              <button
                onClick={() => setShowAddForm(false)}
                type="button"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white bg-transparent border-0 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {formErrors.api && (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 text-xs rounded-lg">
                {formErrors.api}
              </div>
            )}

            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleInputChange}
                  placeholder="e.g. Acme Corp"
                  className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-hidden ${
                    formErrors.vendorName
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
                {formErrors.vendorName && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.vendorName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  Vendor Email *
                </label>
                <input
                  type="email"
                  name="vendorEmail"
                  value={formData.vendorEmail}
                  onChange={handleInputChange}
                  placeholder="e.g. billing@acme.com"
                  className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-hidden ${
                    formErrors.vendorEmail
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
                {formErrors.vendorEmail && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.vendorEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  Vendor Phone
                </label>
                <input
                  type="text"
                  name="vendorPhone"
                  value={formData.vendorPhone}
                  onChange={handleInputChange}
                  placeholder="e.g. +1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  Initial Risk Score (0-100)%
                </label>
                <input
                  type="number"
                  name="riskScore"
                  min="0"
                  max="100"
                  value={formData.riskScore}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                {formErrors.riskScore && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.riskScore}</p>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all"
                >
                  {submitLoading ? 'Submitting...' : 'Save Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
