export const API_BASE = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost')
    ? 'http://localhost:5000'
    : '');

