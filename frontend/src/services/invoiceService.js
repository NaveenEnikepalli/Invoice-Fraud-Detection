import api from '../api/axios';

const invoiceService = {
  getAllInvoices: () => api.get('/invoices'),
  
  getInvoiceById: (id) => api.get(`/invoices/${id}`),
  
  createInvoice: (invoiceData) => api.post('/invoices', invoiceData),
  
  updateInvoice: (id, invoiceData) => api.put(`/invoices/${id}`, invoiceData),
  
  deleteInvoice: (id) => api.delete(`/invoices/${id}`),
  
  getInvoicesByVendor: (vendorId) => api.get(`/invoices/vendor/${vendorId}`),
  
  getFraudExplanation: (id) => api.get(`/invoices/${id}/explanation`),
  
  updateNotes: (id, notes) => api.put(`/invoices/${id}/notes`, { notes }),
};

export default invoiceService;
