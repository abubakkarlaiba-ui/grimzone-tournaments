'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(api.user);
    if (!api.isLoggedIn() || !api.isAdmin()) window.location.href = '/login';
  }, []);

  if (!user) return <div className="text-center py-20 text-[#7777aa]">Loading...</div>;

  if (user?.role !== 'admin') {
    return <div className="text-center py-20 text-[#7777aa]"><div className="text-4xl mb-4">🚫</div><h3 className="text-lg font-bold text-white mb-2">Access Denied</h3><p className="text-sm">Admin only.</p></div>;
  }

  return (
    <div className="flex min-h-[80vh]">
      <aside className="w-56 bg-[#111122] border-r border-[rgba(255,255,255,0.06)] p-6 hidden md:block fixed top-16 left-0 bottom-0 overflow-y-auto">
        <div className="text-lg font-black text-white mb-6" style={{textShadow:'0 0 16px rgba(0,212,255,0.2)'}}>⚔️ Admin</div>
        <SidebarLink href="/admin" active>Dashboard</SidebarLink>
        <SidebarLink href="/admin/payments">Verify Payments</SidebarLink>
        <SidebarLink href="/admin/tournaments">Tournaments</SidebarLink>
        <SidebarLink href="/admin/users">Users</SidebarLink>
        <Link href="/" className="block py-2.5 px-3.5 rounded-lg text-sm font-semibold text-[#7777aa] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all mt-4">
          ← Back to Site
        </Link>
      </aside>
      <div className="flex-1 md:ml-56 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-extrabold">Admin Dashboard</h2>
          <span className="text-sm text-[#7777aa]">Welcome, {user.username}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '👥', label: 'Total Users', value: '-' },
            { icon: '🏆', label: 'Tournaments', value: '-' },
            { icon: '📋', label: 'Bookings', value: '-' },
            { icon: '⏳', label: 'Pending Payments', value: '-' },
          ].map((s, i) => (
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

function SidebarLink({ href, active, children }) {
  return (
    <Link href={href} className={`block py-2.5 px-3.5 rounded-lg text-sm font-semibold transition-all mb-1 ${active ? 'bg-[rgba(0,212,255,0.08)] text-[#00d4ff]' : 'text-[#7777aa] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)]'}`}>
      {children}
    </Link>
  );
}
