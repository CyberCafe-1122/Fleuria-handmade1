const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('fleuria_admin_token');

  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      // Session expired
      localStorage.removeItem('fleuria_admin_token');
      localStorage.removeItem('fleuria_admin_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
      throw new Error('Your session has expired. Please log in again.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
  upload: (endpoint, formData) => request(endpoint, { method: 'POST', body: formData })
};

export default api;
