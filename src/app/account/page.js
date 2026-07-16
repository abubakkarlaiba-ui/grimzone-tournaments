'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AccountPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpError, setCpError] = useState('');
  const [cpSuccess, setCpSuccess] = useState('');
  const [cpLoading, setCpLoading] = useState(false);

  function fetchStats() {
    if (!api.isLoggedIn()) { return; }
    api.getUserStats().then(d => { setStats(d); setLoading(false); }).catch(() => { setLoading(false); });
  }

  useEffect(() => {
    if (!api.isLoggedIn()) { router.push('/login'); return; }
    fetchStats();
    return api.subscribe(fetchStats);
  }, []);

  async function handleChangePassword(e) {
    e.preventDefault();
    setCpError('');
    setCpSuccess('');
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setCpError('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      setCpError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setCpError('New passwords do not match');
      return;
    }
    setCpLoading(true);
    try {
      const res = await api.changePassword(oldPassword, newPassword);
      setCpSuccess(res.message || 'Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setCpError(err.message);
    } finally {
      setCpLoading(false);
    }
  }

  if (loading) return (
    <div className="max-w-xl mx-auto my-10 px-5">
      <div className="glass p-8 text-center">Loading...</div>
    </div>
  );

  if (!stats) return (
    <div className="max-w-xl mx-auto my-10 px-5">
      <div className="glass p-8 text-center text-[#e74c3c]">Failed to load account data.</div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto my-10 px-5">
      <div className="glass p-8 gradient-border relative overflow-hidden mb-6">
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

      <div className="glass p-8 gradient-border relative overflow-hidden">
        <button onClick={() => { setShowChangePassword(!showChangePassword); setCpError(''); setCpSuccess(''); }} className="w-full text-left">
          <h3 className="text-lg font-bold text-[#00d4ff]">Change Password {showChangePassword ? '▲' : '▼'}</h3>
        </button>

        {showChangePassword && (
          <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
            {cpError && <div className="bg-[rgba(231,76,60,0.1)] border border-[rgba(231,76,60,0.3)] text-[#e74c3c] text-sm rounded-lg px-4 py-3">{cpError}</div>}
            {cpSuccess && <div className="bg-[rgba(46,204,113,0.1)] border border-[rgba(46,204,113,0.3)] text-[#2ecc71] text-sm rounded-lg px-4 py-3">{cpSuccess}</div>}

            <div>
              <label className="block text-sm font-semibold text-[#7777aa] mb-1.5">Current Password</label>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="input-field" placeholder="Enter current password" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#7777aa] mb-1.5">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" placeholder="Enter new password (min 6 characters)" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#7777aa] mb-1.5">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" placeholder="Confirm new password" required />
            </div>
            <button type="submit" disabled={cpLoading} className="btn-primary w-full justify-center">
              {cpLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
