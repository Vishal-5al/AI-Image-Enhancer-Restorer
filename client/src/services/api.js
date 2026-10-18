// API client for AI Image Restoration tool

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // System & Health
  getSystemStatus: async () => {
    const res = await fetch('/api/system/status');
    return await res.json();
  },

  updateHfToken: async (token) => {
    const res = await fetch('/api/system/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    return await res.json();
  },

  // Samples
  getSamples: async () => {
    const res = await fetch('/api/samples');
    return await res.json();
  },

  // Restoration
  restoreImage: async (formData) => {
    const res = await fetch('/api/restore', {
      method: 'POST',
      headers: {
        ...getAuthHeaders()
      },
      body: formData
    });
    return await res.json();
  },

  // History
  getHistory: async () => {
    const res = await fetch('/api/history', {
      headers: {
        ...getAuthHeaders()
      }
    });
    return await res.json();
  },

  deleteHistory: async (id) => {
    const res = await fetch(`/api/history/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    return await res.json();
  },

  // Authentication
  register: async (name, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return await res.json();
  },

  login: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  },

  getMe: async () => {
    const res = await fetch('/api/auth/me', {
      headers: {
        ...getAuthHeaders()
      }
    });
    return await res.json();
  }
};
