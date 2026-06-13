// Detect API base URL dynamically
// In development, Vite runs on port 5173, so point to backend on port 5000.
// In production, we serve from the same domain/port, so use relative path.
export const API_BASE = 
  window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost')
    ? `${window.location.protocol}//localhost:5000`
    : '';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 401) {
    // If unauthorized, clear invalid token and redirect to login page
    localStorage.removeItem('adminToken');
    // Don't redirect if we are already trying to login
    if (!window.location.pathname.endsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Not authorized, login expired.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
};
