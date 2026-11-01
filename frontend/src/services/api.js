/**
 * CivicAssist AI - API Service
 * Communicates with Django REST Framework backend
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? (import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '') + (import.meta.env.VITE_API_BASE_URL.endsWith('/api') ? '' : '/api'))
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://127.0.0.1:8000/api'
      : '/api');

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.error || `HTTP error: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Grievances
  getGrievances: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'ALL') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const data = await request(`/grievances/${queryString}`);
    // DRF paginated responses return { count, results: [...] } or flat array
    return data.results ? data.results : data;
  },

  getGrievanceById: async (id) => {
    return await request(`/grievances/${id}/`);
  },

  trackTicket: async (ticketNumber) => {
    return await request(`/grievances/track/${ticketNumber.trim()}/`);
  },

  createGrievance: async (payload) => {
    return await request('/grievances/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateStatus: async (id, statusData) => {
    return await request(`/grievances/${id}/update-status/`, {
      method: 'POST',
      body: JSON.stringify(statusData),
    });
  },

  // AI Services
  previewAITriage: async ({ title, description, address, latitude, longitude }) => {
    return await request('/triage/preview/', {
      method: 'POST',
      body: JSON.stringify({ title, description, address, latitude, longitude }),
    });
  },

  // Analytics & Stats
  getAnalytics: async () => {
    return await request('/analytics/summary/');
  },

  // Departments
  getDepartments: async () => {
    const data = await request('/departments/');
    return data.results ? data.results : data;
  },
};
