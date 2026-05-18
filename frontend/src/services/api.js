import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3000/api';
  }
  return 'https://basicproject-rjat.onrender.com/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach authorization header if token exists in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


API.interceptors.response.use(
  (response) => response,
  (error) => {
    
    const message =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'An unexpected connection error occurred. Please try again.';

    const errors = 
      error.response && error.response.data && error.response.data.errors
        ? error.response.data.errors
        : null;

    
    error.apiMessage = message;
    error.apiErrors = errors;

    return Promise.reject(error);
  }
);

export default API;
