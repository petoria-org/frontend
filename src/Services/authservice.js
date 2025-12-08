// authService.js
import axios from 'axios';

// Base URL for your API - adjust according to your environment
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token in headers if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh and common errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await refreshAuthToken(refreshToken);
          if (response.success) {
            localStorage.setItem('accessToken', response.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh token failed - logout user
        logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Login user with identifier (email/username) and password
 * @param {Object} credentials - User credentials
 * @param {string} credentials.identifier - Email or username
 * @param {string} credentials.password - User password
 * @returns {Promise} Response data
 */
export const login = async ({ identifier, password }) => {
  try {
    const response = await apiClient.post('/users/login/', {
      identifier,
      password
    });

    if (response.data.success && response.data.data) {
      // Store tokens securely
      const { accessToken, refreshToken, user } = response.data.data;

      // Store tokens (consider using httpOnly cookies in production)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Set default authorization header for future requests
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }

    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;

      switch (status) {
        case 400:
          throw new Error(data.message || 'Invalid request. Please check your input.');
        case 401:
          throw new Error('Invalid email/username or password.');
        case 403:
          throw new Error('Account is disabled. Please contact support.');
        case 404:
          throw new Error('User not found.');
        case 429:
          throw new Error('Too many login attempts. Please try again later.');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(data.message || 'Login failed. Please try again.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }
};

/**
 * Logout user - clear tokens and user data
 */
export const logout = () => {
  // Clear all auth-related items from localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  // Remove authorization header
  delete apiClient.defaults.headers.common['Authorization'];

  // Optional: Call logout endpoint to invalidate token on server
  // apiClient.post('/auth/logout').catch(console.error);
};

/**
 * Refresh authentication token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise} Response data
 */
export const refreshAuthToken = async (refreshToken) => {
  try {
    const response = await apiClient.post('/auth/refresh-token', {
      refreshToken
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null if not logged in
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  // Optional: Add token validation/expiration check here
  return !!token;
};

/**
 * Get authentication token
 * @returns {string|null} Access token or null
 */
export const getToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Update user data in localStorage
 * @param {Object} userData - Updated user data
 */
export const updateUserData = (userData) => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
};

export default {
  login,
  logout,
  refreshAuthToken,
  getCurrentUser,
  isAuthenticated,
  getToken,
  updateUserData,
  apiClient
};