const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const api = {
  token: null,
  user: null,

  init() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('gz_token');
      this.user = JSON.parse(localStorage.getItem('gz_user') || 'null');
    }
  },

  async request(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (this.token) opts.headers.Authorization = `Bearer ${this.token}`;
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    let data;
    try {
      data = await res.json();
    } catch {
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      return {};
    }
    if (!res.ok) {
      const msgs = [];
      if (typeof data === 'object' && data !== null) {
        if (data.error) msgs.push(data.error);
        if (data.detail) msgs.push(data.detail);
        for (const [field, errors] of Object.entries(data)) {
          if (Array.isArray(errors)) msgs.push(errors.join(' '));
        }
      }
      throw new Error(msgs.join(' ') || 'Request failed');
    }
    return data;
  },

  async login(username, password) {
    const data = await this.request('POST', '/auth/login/', { username, password });
    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('gz_token', data.token);
    localStorage.setItem('gz_user', JSON.stringify(data.user));
    return data;
  },

  async register(username, email, password) {
    const data = await this.request('POST', '/auth/register/', { username, email, password });
    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('gz_token', data.token);
    localStorage.setItem('gz_user', JSON.stringify(data.user));
    return data;
  },

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('gz_token');
    localStorage.removeItem('gz_user');
    if (typeof window !== 'undefined') window.location.href = '/';
  },

  isLoggedIn() { return !!this.token; },
  isAdmin() { return this.user?.role === 'admin'; },

  getTournaments() { return this.request('GET', '/tournaments/'); },
  createTournament(data) { return this.request('POST', '/tournaments/', data); },
  updateTournament(id, data) { return this.request('PATCH', `/tournaments/${id}/`, data); },
  deleteTournament(id) { return this.request('DELETE', `/tournaments/${id}/`); },

  getWallet() { return this.request('GET', '/wallet/'); },
  getBookings() { return this.request('GET', '/bookings/'); },
  createBooking(data) { return this.request('POST', '/bookings/', data); },
  submitPayment(formData) { return this.upload('/payments/', formData); },

  getPayments() { return this.request('GET', '/admin/payments/'); },
  verifyPayment(id, action) { return this.request('POST', `/admin/payments/${id}/`, { action }); },
  getUsers() { return this.request('GET', '/admin/users/'); },
  addTokens(userId, amount) { return this.request('POST', '/admin/tokens/', { userId, amount }); },
  getAdminStats() { return this.request('GET', '/admin/stats/'); },
  getAdminBookings() { return this.request('GET', '/admin/bookings/'); },
  setRoomId(bookingId, roomId, roomPassword) { return this.request('POST', '/admin/set-room/', { bookingId, roomId, roomPassword }); },
};

api.init();
