const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('scholarbeacon_admin_token');
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('scholarbeacon_admin_token', token);
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('scholarbeacon_admin_user');
  return user ? JSON.parse(user) : null;
}

export function setUser(user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('scholarbeacon_admin_user', JSON.stringify(user));
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('scholarbeacon_admin_token');
  localStorage.removeItem('scholarbeacon_admin_user');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.error?.message || data?.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.details = data?.error?.details || data?.details;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res?.data?.tokens?.accessToken) {
      setToken(res.data.tokens.accessToken);
      setUser(res.data.user);
    }
    return res;
  },

  getProfile: () => request('/auth/profile'),

  // Platform Stats
  getStats: () => request('/stats'),

  // Scholarships & Internships
  getScholarships: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
        query.append(key, value);
      }
    });
    return request(`/scholarships?${query.toString()}`);
  },

  getScholarshipById: (id) => request(`/scholarships/${id}`),

  createScholarship: (data) =>
    request('/scholarships', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateScholarship: (id, data) =>
    request(`/scholarships/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteScholarship: (id) =>
    request(`/scholarships/${id}`, {
      method: 'DELETE',
    }),

  // Official Sources
  getSources: () => request('/sources'),

  triggerSourceCrawl: (id) =>
    request(`/sources/${id}/crawl`, {
      method: 'POST',
    }),

  // Review Queue (Monitor Scheduler changes awaiting admin approval)
  getReviews: (status = 'pending') => request(`/reviews?status=${status}`),

  approveReview: (id) =>
    request(`/reviews/${id}/approve`, {
      method: 'POST',
    }),

  rejectReview: (id, reason = 'Rejected by administrator') =>
    request(`/reviews/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason: reason }),
    }),
};

