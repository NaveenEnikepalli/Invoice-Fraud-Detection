import api from '../api/axios';

const authService = {
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  register: async (payload) => {
    return api.post('/auth/register', payload);
  },

  getProfile: async (id) => {
    return api.get(`/users/profile/${id}`);
  },

  getAllUsers: async () => {
    return api.get('/users');
  },

  deleteUser: async (id) => {
    return api.delete(`/users/${id}`);
  },

  toggleUserActive: async (id) => {
    return api.put(`/users/${id}/toggle-active`);
  }
};

export default authService;
