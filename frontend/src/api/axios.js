import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach X-User-Email header
api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.email) {
          config.headers['X-User-Email'] = user.email;
        }
      } catch (err) {
        console.error('Failed to parse user for auth header:', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => {
    // If backend returns a standardized ApiResponse wrapper
    return response.data;
  },
  (error) => {
    // Handle network errors, timeouts, and standard backend validation shapes
    const customError = {
      message: 'An unexpected error occurred.',
      status: error.response?.status || null,
      data: error.response?.data || null,
      rawError: error,
    };

    if (!error.response) {
      customError.message = 'Network Error: Unable to reach the server. Please check if the backend is running.';
    } else if (error.response.status === 400 && error.response.data?.data) {
      customError.message = error.response.data.message || 'Validation failed';
      customError.validationErrors = error.response.data.data; // Handles the Map<String, String> of validation errors
    } else if (error.response.data?.message) {
      customError.message = error.response.data.message;
    }

    return Promise.reject(customError);
  }
);

export default api;
