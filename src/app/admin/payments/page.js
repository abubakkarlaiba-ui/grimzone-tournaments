'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!api.isLoggedIn() || !api.isAdmin()) window.location.href = '/login';
    else load();
  }, []);

  async function load() {
    try {
      const data = await api.getPayments();
      setPayments(data);
    } catch {}
  }

  async function handleVerify(id, action) {
    try {
      await api.verifyPayment(id, action);
      setMsg(`Payment ${action}ed`);
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  }

  return (
    <div className="flex min-h-[80vh]">
      <aside className="w-56 bg-[#111122] border-r border-[rgba(255,255,255,0.06)] p-6 hidden md:block fixed top-16 left-0 bottom-0 overflow-y-auto">
        <div className="text-lg font-black text-white mb-6" style={{textShadow:'0 0 16px rgba(0,212,255,0.2)'}}>⚔️ Admin</div>
        <Link href="/admin" className="block py-2.5 px-3.5 rounded-lg text-sm font-semibold text-[#7777aa] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all mb-1">Dashboard</Link>
        <Link href="/admin/payments" className="block py-2.5 px-3.5 rounded-lg text-sm font-semibold bg-[rgba(0,212,255,0.08)] text-[#00d4ff] transition-all mb-1">Verify Payments</Link>
        <Link href="/admin/tournaments" className="block py-2.5 px-3.5 rounded-lg text-sm font-semibold text-[#7777aa] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all mb-1">Tournaments</Link>
        <Link href="/admin/users" className="block py-2.5 px-3.5 rounded-lg text-sm font-semibold text-[#7777aa] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all mb-1">Users</Link>
        <Link href="/" className="block py-2.5 px-3.5 rounded-lg text-sm font-semibold text-[#7777aa] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all mt-4">← Back to Site</Link>
      </aside>
      <div className="flex-1 md:ml-56 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-extrabold">Verify Payments</h2>
        </div>
        {msg && <div className="p-3 mb-4 rounded-lg text-sm font-semibold bg-[rgba(46,204,113,0.08)] border border-[rgba(46,204,113,0.15)] text-[#2ecc71]">{msg}</div>}
        <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">User</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Amount</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Status</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-[#7777aa] text-sm">No payments pending.</td></tr>
              ) : payments.map((p, i) => (
                <tr key={i} className="border-b border-[rgba(255,255,255,0.06)] last:border-b-0">
                  <td className="p-3.5 text-sm">{p.user?.username || p.userId}</td>
                  <td className="p-3.5 text-sm">{p.amount}</td>
                  <td className="p-3.5 text-sm">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase ${p.status === 'verified' ? 'bg-[rgba(46,204,113,0.1)] border border-[rgba(46,204,113,0.15)] text-[#2ecc71]' : p.status === 'rejected' ? 'bg-[rgba(231,76,60,0.1)] border border-[rgba(231,76,60,0.15)] text-[#e74c3c]' : 'bg-[rgba(241,196,15,0.1)] border border-[rgba(241,196,15,0.15)] text-[#f1c40f]'}`}>{p.status || 'pending'}</span>
                  </td>
                  <td className="p-3.5 text-sm">
                    {p.status !== 'verified' && p.status !== 'rejected' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleVerify(p._id || p.id, 'verify')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[linear-gradient(135deg,#2ecc71,#27ae60)] transition-all hover:shadow-[0_0_16px_rgba(46,204,113,0.3)]">Verify</button>
                        <button onClick={() => handleVerify(p._id || p.id, 'reject')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[linear-gradient(135deg,#e74c3c,#c0392b)] transition-all hover:shadow-[0_0_16px_rgba(231,76,60,0.3)]">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
