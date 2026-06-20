import React, { useEffect, useState } from 'react';
import { FiX, FiUploadCloud, FiCpu, FiAlertCircle, FiCheck } from 'react-icons/fi';
import vendorService from '../services/vendorService';
import documentService from '../services/documentService';
import Spinner from './Spinner';

const InvoiceForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [ocrError, setOcrError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    vendorId: '',
    amount: '',
    invoiceDate: '',
    status: 'PENDING',
    description: '',
    documentId: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load vendors for select dropdown
  useEffect(() => {
    const loadVendors = async () => {
      try {
        setLoadingVendors(true);
        const res = await vendorService.getAllVendors();
        setVendors(res.data || []);
      } catch (err) {
        console.error('Failed to load vendors:', err);
      } finally {
        setLoadingVendors(false);
      }
    };

    if (isOpen) {
      loadVendors();
    }
  }, [isOpen]);

  // Set form data for editing or reset for adding
  useEffect(() => {
    if (initialData) {
      setFormData({
        invoiceNumber: initialData.invoiceNumber || '',
        vendorId: initialData.vendorId || '',
        amount: initialData.amount || '',
        invoiceDate: initialData.invoiceDate || '',
        status: initialData.status || 'PENDING',
        description: '', // description is client-side only
        documentId: null,
      });
    } else {
      setFormData({
        invoiceNumber: '',
        vendorId: '',
        amount: '',
        invoiceDate: '',
        status: 'PENDING',
        description: '',
        documentId: null,
      });
    }
    setErrors({});
    setOcrSuccess(false);
    setOcrError(null);
  }, [initialData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'vendorId' ? Number(value) : value,
    }));
  };

  // Handle OCR Document Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setOcrLoading(true);
      setOcrError(null);
      setOcrSuccess(false);

      const res = await documentService.uploadDocument(file);
      
      if (res.success && res.data) {
        const extracted = res.data;
        
        // Find matching vendor ID from vendor list by name
        let matchedVendorId = '';
        if (extracted.vendorName && vendors.length > 0) {
          const matched = vendors.find(
            (v) => v.vendorName?.toLowerCase() === extracted.vendorName?.toLowerCase()
          );
          if (matched) matchedVendorId = matched.id;
        }

        setFormData((prev) => ({
          ...prev,
          invoiceNumber: extracted.invoiceNumber || prev.invoiceNumber,
          amount: extracted.amount !== null && extracted.amount !== undefined ? String(extracted.amount) : prev.amount,
          invoiceDate: extracted.invoiceDate || prev.invoiceDate,
          vendorId: matchedVendorId || prev.vendorId,
          documentId: extracted.documentId || null,
        }));

        setOcrSuccess(true);
      } else {
        setOcrError('OCR uploaded but failed to parse key invoice values.');
      }
    } catch (err) {
      setOcrError(err.message || 'OCR parsing failed.');
    } finally {
      setOcrLoading(false);
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.invoiceNumber.trim()) tempErrors.invoiceNumber = 'Invoice number is required';
    if (!formData.vendorId) tempErrors.vendorId = 'Please select a vendor';
    if (!formData.amount) {
      tempErrors.amount = 'Amount is required';
    } else if (Number(formData.amount) <= 0) {
      tempErrors.amount = 'Amount must be positive';
    }
    if (!formData.invoiceDate) tempErrors.invoiceDate = 'Invoice date is required';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      // Construct payload matching InvoiceRequestDTO
      const payload = {
        invoiceNumber: formData.invoiceNumber,
        amount: parseFloat(formData.amount),
        invoiceDate: formData.invoiceDate,
        status: formData.status,
        vendorId: Number(formData.vendorId),
        fraudScore: initialData ? initialData.fraudScore : 0.00,
        documentId: formData.documentId ? Number(formData.documentId) : null,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      if (err.validationErrors) {
        setErrors(err.validationErrors);
      } else {
        setErrors({ api: err.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="glass-card w-full max-w-xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-850 dark:text-white m-0">
            {initialData ? 'Edit Invoice' : 'Create New Invoice'}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white bg-transparent border-0 cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {errors.api && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 text-xs rounded-lg flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errors.api}</span>
          </div>
        )}

        {/* OCR Section (Only visible when creating an invoice) */}
        {!initialData && (
          <div className="p-4 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/20 dark:bg-indigo-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                <FiCpu className="w-4 h-4 shrink-0 animate-pulse-slow" />
                OCR SMART IMPORT
              </span>
              <span className="text-[9px] font-semibold text-indigo-500">
                Supports PDF & Images
              </span>
            </div>

            {ocrLoading ? (
              <Spinner size="small" message="Scanning document text..." />
            ) : (
              <div className="flex flex-col items-center justify-center p-3 text-center border-0">
                <label className="flex flex-col items-center justify-center cursor-pointer space-y-1 w-full">
                  <FiUploadCloud className="w-7 h-7 text-indigo-400 dark:text-indigo-600" />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    <strong className="text-indigo-600 dark:text-indigo-400 hover:underline">
                      Upload invoice document
                    </strong>{' '}
                    to auto-fill form
                  </span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                </label>
              </div>
            )}

            {ocrSuccess && (
              <div className="flex items-center gap-1.5 p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 text-[10px] rounded-lg">
                <FiCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Document processed! Fields successfully pre-filled.</span>
              </div>
            )}

            {ocrError && (
              <div className="flex items-center gap-1.5 p-2 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 text-[10px] rounded-lg">
                <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{ocrError}</span>
              </div>
            )}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                Invoice Number *
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                placeholder="e.g. INV-2026-0001"
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-hidden ${
                  errors.invoiceNumber
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
              {errors.invoiceNumber && (
                <p className="text-xs text-rose-500 mt-1">{errors.invoiceNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                Vendor *
              </label>
              <select
                name="vendorId"
                value={formData.vendorId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-hidden ${
                  errors.vendorId
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              >
                <option value="">Select a Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vendorName}
                  </option>
                ))}
              </select>
              {errors.vendorId && (
                <p className="text-xs text-rose-500 mt-1">{errors.vendorId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                Amount (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="e.g. 15000.75"
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-hidden ${
                  errors.amount
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
              {errors.amount && (
                <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                Invoice Date *
              </label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-hidden ${
                  errors.invoiceDate
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
              {errors.invoiceDate && (
                <p className="text-xs text-rose-500 mt-1">{errors.invoiceDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                Workflow Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="REVIEW">REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                Description / Memo
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional text details"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-transparent cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || ocrLoading}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Save Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
