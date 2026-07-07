'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AccountPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  function fetchStats() {
    if (!api.isLoggedIn()) { return; }
    api.getUserStats().then(d => { setStats(d); setLoading(false); }).catch(() => { setLoading(false); });
  }

  useEffect(() => {
    if (!api.isLoggedIn()) { router.push('/login'); return; }
    fetchStats();
    return api.subscribe(fetchStats);
  }, []);

  if (loading) return (
    <div className="max-w-xl mx-auto my-10 px-5">
      <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-8 text-center text-[#7777aa]">Loading...</div>
    </div>
  );

  if (!stats) return (
    <div className="max-w-xl mx-auto my-10 px-5">
      <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-8 text-center text-[#e74c3c]">Failed to load account data.</div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto my-10 px-5">
      <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,#00d4ff,#8b5cf6,#00d4ff)]" />
        <h2 className="text-2xl font-extrabold mb-1">My Account</h2>
        <p className="text-sm text-[#7777aa] mb-6">Your GrimZone profile and stats.</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 text-center">
            <div className="text-3xl mb-1">🏆</div>
            <div className="text-2xl font-black text-white">{stats.tournaments_played}</div>
            <div className="text-xs text-[#7777aa] mt-1 font-semibold">Tournaments Played</div>
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 text-center">
            <div className="text-3xl mb-1">💰</div>
            <div className="text-2xl font-black text-[#00d4ff]">{stats.tokens.toLocaleString()}</div>
            <div className="text-xs text-[#7777aa] mt-1 font-semibold">Total Winnings (FF Coins)</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <span className="text-sm text-[#7777aa]">User ID</span>
            <span className="text-sm font-semibold text-[#8b5cf6]">#{stats.id}</span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <span className="text-sm text-[#7777aa]">Username</span>
            <span className="text-sm font-semibold text-white">{stats.username}</span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <span className="text-sm text-[#7777aa]">Email</span>
            <span className="text-sm font-semibold text-white">{stats.email}</span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <span className="text-sm text-[#7777aa]">FreeFire Name</span>
            <span className="text-sm font-semibold text-white">{stats.freefire_name || <span className="text-[#7777aa] italic">Not set</span>}</span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <span className="text-sm text-[#7777aa]">Role</span>
            <span className="text-sm font-semibold capitalize text-[#8b5cf6]">{stats.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
