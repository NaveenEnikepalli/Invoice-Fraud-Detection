import api from '../api/axios';

const vendorService = {
  getAllVendors: () => api.get('/vendors'),
  
  getVendorById: (id) => api.get(`/vendors/${id}`),
  
  createVendor: (vendorData) => api.post('/vendors', vendorData),
  
  updateVendor: (id, vendorData) => api.put(`/vendors/${id}`, vendorData),
  
  deleteVendor: (id) => api.delete(`/vendors/${id}`),
};

export default vendorService;
