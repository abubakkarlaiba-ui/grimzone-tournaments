'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.init();
    if (!api.isLoggedIn() || !api.isAdmin()) { window.location.href = '/login'; return; }
    setUser(api.user);
    api.getAdminStats().then(setStats).catch(() => {});
  }, []);

  if (!user) return <div className="text-center py-20 text-[#7777aa]">Loading...</div>;

  if (user?.role !== 'admin') {
    return <div className="text-center py-20 text-[#7777aa]"><div className="text-4xl mb-4">🚫</div><h3 className="text-lg font-bold text-white mb-2">Access Denied</h3><p className="text-sm">Admin only.</p></div>;
  }

  const cards = [
    { icon: '👥', label: 'Total Users', value: stats?.total_users ?? '-' },
    { icon: '🏆', label: 'Tournaments', value: stats?.total_tournaments ?? '-' },
    { icon: '📋', label: 'Bookings', value: stats?.total_bookings ?? '-' },
    { icon: '⏳', label: 'Pending Payments', value: stats?.pending_payments ?? '-' },
  ];

  return (
    <div className="flex min-h-[80vh]">
      <AdminSidebar />
      <div className="flex-1 md:ml-56 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-extrabold">Admin Dashboard</h2>
          <span className="text-sm text-[#7777aa]">Welcome, {user.username}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((s, i) => (
            <div key={i} className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,transparent,#00d4ff,transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-xs text-[#7777aa] mt-1 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
