// Detect API base URL dynamically
// In development, Vite runs on port 5173, so point to backend on port 5000.
// In production, we serve from the same domain/port, so use relative path.
export const API_BASE = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.localhost')
    ? `${window.location.protocol}//localhost:5000`
    : '');

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
    if (endpoint === '/api/auth/login') {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Invalid username or password');
    }
    
    // If unauthorized and not logging in, clear invalid token and redirect to login page
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

export const apiDownload = async (endpoint, filename) => {
  const token = localStorage.getItem('adminToken');
  
  const headers = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { headers });

  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    if (!window.location.pathname.endsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Not authorized, login expired.');
  }

  if (!response.ok) {
    // If it's a blob error, we can't always parse json, but we try
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
