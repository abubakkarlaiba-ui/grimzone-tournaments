'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.init();
    if (!api.isLoggedIn() || !api.isAdmin()) { window.location.href = '/login'; return; }
    load();
  }, []);

  async function load() {
    try { setPayments(await api.getPayments()); } catch {}
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
      <AdminSidebar />
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
                <tr><td colSpan="4" className="p-8 text-center text-[#7777aa] text-sm">No payments.</td></tr>
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
                        <button onClick={() => handleVerify(p.id, 'verify')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[linear-gradient(135deg,#2ecc71,#27ae60)] transition-all hover:shadow-[0_0_16px_rgba(46,204,113,0.3)]">Verify</button>
                        <button onClick={() => handleVerify(p.id, 'reject')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[linear-gradient(135deg,#e74c3c,#c0392b)] transition-all hover:shadow-[0_0_16px_rgba(231,76,60,0.3)]">Reject</button>
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
