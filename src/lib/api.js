const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const listeners = new Set();

function notify() {
  listeners.forEach(fn => fn());
}

export const api = {
  token: null,
  user: null,

  init() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('gz_token');
      this.user = JSON.parse(localStorage.getItem('gz_user') || 'null');
    }
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
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
    notify();
    return data;
  },

  async register(username, email, password, freefire_name) {
    const data = await this.request('POST', '/auth/register/', { username, email, password, freefire_name });
    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('gz_token', data.token);
    localStorage.setItem('gz_user', JSON.stringify(data.user));
    notify();
    return data;
  },

  async getUserStats() {
    return this.request('GET', '/auth/stats/');
  },

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('gz_token');
    localStorage.removeItem('gz_user');
    notify();
    if (typeof window !== 'undefined') window.location.href = '/';
  },

  isLoggedIn() { return !!this.token; },
  isAdmin() { return this.user?.role === 'admin' || this.user?.role === 'owner'; },
  isOwner() { return this.user?.role === 'owner'; },

  getTournaments() { return this.request('GET', '/tournaments/'); },
  createTournament(data) { return this.request('POST', '/tournaments/', data); },
  updateTournament(id, data) { return this.request('PATCH', `/tournaments/${id}/`, data); },
  deleteTournament(id) { return this.request('DELETE', `/tournaments/${id}/`); },

  getWallet() { return this.request('GET', '/wallet/'); },
  getBookings() { return this.request('GET', '/bookings/'); },
  async createBooking(data) { const d = await this.request('POST', '/bookings/', data); notify(); return d; },
  submitPayment(formData) { return this.upload('/payments/', formData); },

  getPayments() { return this.request('GET', '/admin/payments/'); },
  verifyPayment(id, action) { return this.request('POST', `/admin/payments/${id}/verify/`, { action }); },
  getUsers() { return this.request('GET', '/admin/users/'); },
  updateUserRole(userId, role) { return this.request('POST', `/admin/users/${userId}/role/`, { role }); },
  async addTokens(userId, amount) { const d = await this.request('POST', '/admin/tokens/', { userId, amount }); notify(); return d; },
  async deductTokens(userId, amount) { const d = await this.request('POST', '/admin/tokens/deduct/', { userId, amount }); notify(); return d; },
  getAdminStats() { return this.request('GET', '/admin/stats/'); },
  getAdminBookings() { return this.request('GET', '/admin/bookings/'); },
  setRoomId(bookingId, roomId, roomPassword) { return this.request('POST', '/admin/set-room/', { bookingId, roomId, roomPassword }); },

  getMyTeams() { return this.request('GET', '/teams/'); },
  async createTeam(tournament_title) { const d = await this.request('POST', '/teams/create/', { tournament_title }); notify(); return d; },
  async joinTeam(code) { const d = await this.request('POST', '/teams/join/', { code }); notify(); return d; },
  getTeam(code) { return this.request('GET', `/teams/${code}/`); },
};

api.init();
