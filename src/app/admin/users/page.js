'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');
  const [tokenUser, setTokenUser] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');

  useEffect(() => {
    api.init();
    if (!api.isLoggedIn() || !api.isAdmin()) { window.location.href = '/login'; return; }
    load();
  }, []);

  async function load() {
    try { setUsers(await api.getUsers()); } catch {}
  }

  async function handleAddTokens(e) {
    e.preventDefault();
    if (!tokenUser || !tokenAmount) return;
    try {
      await api.addTokens(tokenUser, parseInt(tokenAmount));
      setMsg(`Added ${tokenAmount} tokens`);
      setTokenUser('');
      setTokenAmount('');
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  }

  return (
    <div className="flex min-h-[80vh]">
      <AdminSidebar />
      <div className="flex-1 md:ml-56 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-extrabold">Users</h2>
        </div>
        {msg && <div className="p-3 mb-4 rounded-lg text-sm font-semibold bg-[rgba(46,204,113,0.08)] border border-[rgba(46,204,113,0.15)] text-[#2ecc71]">{msg}</div>}

        <form onSubmit={handleAddTokens} className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 mb-6">
          <h3 className="font-bold mb-4">Add Tokens</h3>
          <div className="flex gap-3">
            <input value={tokenUser} onChange={e => setTokenUser(e.target.value)} className="flex-1 p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="User ID" required />
            <input type="number" value={tokenAmount} onChange={e => setTokenAmount(e.target.value)} className="w-32 p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="Amount" required />
            <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[linear-gradient(135deg,#2ecc71,#27ae60)] shadow-[0_0_16px_rgba(46,204,113,0.15)] transition-all hover:shadow-[0_0_30px_rgba(46,204,113,0.3)]">Add</button>
          </div>
        </form>

        <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">ID</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Username</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Email</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Tokens</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-[#7777aa] text-sm">No users yet.</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-[rgba(255,255,255,0.06)] last:border-b-0">
                  <td className="p-3.5 text-sm text-[#7777aa]">{u.id}</td>
                  <td className="p-3.5 text-sm font-semibold">{u.username}</td>
                  <td className="p-3.5 text-sm">{u.email}</td>
                  <td className="p-3.5 text-sm">{u.tokens ?? 0}</td>
                  <td className="p-3.5 text-sm"><span className="capitalize">{u.role || 'player'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
