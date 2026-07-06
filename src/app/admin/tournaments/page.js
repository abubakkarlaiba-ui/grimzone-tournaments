'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'solo', prizePool: '', entryFee: '', totalSlots: '' });

  useEffect(() => {
    api.init();
    if (!api.isLoggedIn() || !api.isAdmin()) { window.location.href = '/login'; return; }
    load();
  }, []);

  async function load() {
    try { setTournaments(await api.getTournaments()); } catch {}
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.createTournament(form);
      setMsg('Tournament created!');
      setShowForm(false);
      setForm({ title: '', type: 'solo', prizePool: '', entryFee: '', totalSlots: '' });
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this tournament?')) return;
    try {
      await api.deleteTournament(id);
      setMsg('Deleted');
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  }

  return (
    <div className="flex min-h-[80vh]">
      <AdminSidebar />
      <div className="flex-1 md:ml-56 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-extrabold">Manage Tournaments</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] shadow-[0_0_16px_rgba(0,212,255,0.15)] transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]">{showForm ? 'Cancel' : '+ New'}</button>
        </div>
        {msg && <div className="p-3 mb-4 rounded-lg text-sm font-semibold bg-[rgba(46,204,113,0.08)] border border-[rgba(46,204,113,0.15)] text-[#2ecc71]">{msg}</div>}

        {showForm && (
          <form onSubmit={handleCreate} className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 mb-6">
            <h3 className="font-bold mb-4">Create Tournament</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input value={form.title} onChange={e => setForm({...form,title:e.target.value})} className="p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="Title" required />
              <select value={form.type} onChange={e => setForm({...form,type:e.target.value})} className="p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]"><option value="solo">Solo</option><option value="duo">Duo</option><option value="squad">Squad</option></select>
              <input value={form.prizePool} onChange={e => setForm({...form,prizePool:e.target.value})} className="p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="Prize Pool (e.g. 500 PKR)" required />
              <input type="number" value={form.entryFee} onChange={e => setForm({...form,entryFee:e.target.value})} className="p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="Entry Fee (Tokens)" required />
              <input type="number" value={form.totalSlots} onChange={e => setForm({...form,totalSlots:e.target.value})} className="p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="Total Slots" />
            </div>
            <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[linear-gradient(135deg,#2ecc71,#27ae60)] shadow-[0_0_16px_rgba(46,204,113,0.15)] transition-all hover:shadow-[0_0_30px_rgba(46,204,113,0.3)]">Create</button>
          </form>
        )}

        <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">ID</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Title</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Type</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Prize</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Slots</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-[#7777aa] text-sm">No tournaments yet.</td></tr>
              ) : tournaments.map((t) => (
                <tr key={t.id} className="border-b border-[rgba(255,255,255,0.06)] last:border-b-0">
                  <td className="p-3.5 text-sm text-[#7777aa]">{t.id}</td>
                  <td className="p-3.5 text-sm font-semibold">{t.title}</td>
                  <td className="p-3.5 text-sm capitalize">{t.type}</td>
                  <td className="p-3.5 text-sm">{t.prizePool}</td>
                  <td className="p-3.5 text-sm">{(t.slotsFilled ?? 0)}/{t.totalSlots ?? 10}</td>
                  <td className="p-3.5 text-sm">
                    <button onClick={() => handleDelete(t.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[linear-gradient(135deg,#e74c3c,#c0392b)] transition-all hover:shadow-[0_0_16px_rgba(231,76,60,0.3)]">Delete</button>
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
