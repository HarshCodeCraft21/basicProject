import axios from 'axios';

const API = axios.create({
  baseURL: 'https://basicproject-rjat.onrender.com/api',
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});


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
