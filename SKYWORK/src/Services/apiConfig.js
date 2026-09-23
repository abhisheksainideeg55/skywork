/**
 * Central API Configuration
 * Supports environment variables (VITE_API_URL) and auto-detects Vercel deployment URL.
 */

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://server-seven-mu-75.vercel.app/api';
  }
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
