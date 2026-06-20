import api from '../api/axios';

const analyticsService = {
  getSummary: () => api.get('/analytics/summary'),
  
  getFraudTrends: () => api.get('/analytics/fraud-trends'),
  
  getVendorRiskRanking: () => api.get('/analytics/vendor-risk'),
};

export default analyticsService;
