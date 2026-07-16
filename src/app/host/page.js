'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/Button';

export default function HostPage() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [balance, setBalance] = useState(0);
  const [form, setForm] = useState({ title: '', type: 'solo', entryFee: '10', totalSlots: '10', startTime: '' });
  const [myTournaments, setMyTournaments] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!api.isLoggedIn()) { router.replace('/login'); return; }
    setLoggedIn(true);
    api.getUserStats().then(d => setBalance(d.tokens));
    loadMyTournaments();
  }, []);

  async function loadMyTournaments() {
    try {
      const data = await api.getMyTournaments();
      setMyTournaments(data);
    } catch (e) { setMsg('Error loading tournaments'); }
  }

  const totalEntryFees = (parseInt(form.totalSlots) || 0) * (parseInt(form.entryFee) || 0);
  const commission = Math.floor(totalEntryFees * 0.05);
  const prizePool = totalEntryFees - commission;

  async function handleCreate(e) {
    e.preventDefault();
    setMsg('');
    if (!form.title.trim()) { setMsg('Title is required'); return; }
    if (parseInt(form.entryFee) < 1) { setMsg('Entry fee must be at least 1'); return; }
    try {
      await api.createTournament({
        title: form.title,
        type: form.type,
        entry_fee: parseInt(form.entryFee),
        total_slots: parseInt(form.totalSlots),
        start_time: form.startTime || null,
      });
      setMsg('Tournament created!');
      setForm({ title: '', type: 'solo', entryFee: '10', totalSlots: '10', startTime: '' });
      api.getUserStats().then(d => setBalance(d.tokens));
      loadMyTournaments();
    } catch (err) { setMsg('Error: ' + err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this tournament? Host tokens will not be refunded.')) return;
    try {
      await api.deleteTournament(id);
      loadMyTournaments();
    } catch (err) { setMsg('Error: ' + err.message); }
  }

  if (!loggedIn) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-16 px-5">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] bg-clip-text text-transparent">
            Host a Tournament
          </h1>
          <div className="glass px-4 py-2 rounded-xl text-sm">
            <span className="text-[#7777aa]">Balance: </span>
            <span className="text-[#ffd700] font-bold">{balance.toLocaleString()}</span>
            <span className="text-[#7777aa] ml-1">FF</span>
          </div>
        </div>

        {msg && (
          <div className="glass p-4 rounded-xl mb-6 text-sm border-l-4 border-[#00d4ff]">
            {msg}
          </div>
        )}

        <form onSubmit={handleCreate} className="glass p-6 mb-8 gradient-border">
          <h3 className="font-bold mb-4 text-lg">Create New Tournament</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field col-span-2 md:col-span-1" placeholder="Tournament Title" required />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="squad">Squad</option>
            </select>
            <input type="number" min="1" value={form.entryFee} onChange={e => setForm({...form, entryFee: e.target.value})} className="input-field" placeholder="Entry Fee (tokens)" required />
            <input type="number" min="1" value={form.totalSlots} onChange={e => setForm({...form, totalSlots: e.target.value})} className="input-field" placeholder="Total Slots" required />
            <input type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="input-field" />
          </div>

          <div className="glass p-4 rounded-xl mb-4 text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-[#7777aa]">Total Entry Fees</span><span>{totalEntryFees} FF</span></div>
            <div className="flex justify-between"><span className="text-[#7777aa]">Platform Commission (5%)</span><span className="text-[#ff6b6b]">-{commission} FF</span></div>
            <div className="flex justify-between text-base font-bold border-t border-[rgba(255,255,255,0.08)] pt-1.5 mt-1.5">
              <span className="text-[#00d4ff]">Prize Pool</span>
              <span className="text-[#ffd700]">{prizePool} FF</span>
            </div>
          </div>

          <Button type="submit" className="btn-gradient px-8 py-3 rounded-xl text-sm font-bold w-full md:w-auto">
            Create Tournament (Free)
          </Button>
        </form>

        <h2 className="text-xl font-bold mb-4">My Hosted Tournaments</h2>
        {myTournaments.length === 0 ? (
          <div className="glass p-8 rounded-xl text-center text-[#7777aa]">
            You haven't hosted any tournaments yet.
          </div>
        ) : (
          <div className="space-y-3">
            {myTournaments.map(t => (
              <div key={t.id} className="glass p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold truncate">{t.title}</span>
                    <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-[rgba(0,212,255,0.12)] text-[#00d4ff] font-semibold">{t.type}</span>
                    <span className={`text-xs uppercase px-2 py-0.5 rounded-full font-semibold ${
                      t.status === 'upcoming' ? 'bg-[rgba(255,193,7,0.12)] text-[#ffc107]' :
                      t.status === 'ongoing' ? 'bg-[rgba(0,212,255,0.12)] text-[#00d4ff]' :
                      'bg-[rgba(255,255,255,0.06)] text-[#7777aa]'
                    }`}>{t.status}</span>
                  </div>
                  <div className="text-sm text-[#7777aa] space-x-4">
                    <span>Prize: <span className="text-[#ffd700]">{t.prize_pool}</span></span>
                    <span>Fee: {t.entry_fee} FF</span>
                    <span>Slots: {t.slots_filled}/{t.total_slots}</span>
                    {t.start_time && <span>Starts: {new Date(t.start_time).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button onClick={() => router.push(`/tournaments/${t.id}`)} className="px-4 py-2 rounded-lg text-xs font-bold bg-[rgba(0,212,255,0.1)] text-[#00d4ff] border border-[rgba(0,212,255,0.2)] hover:bg-[rgba(0,212,255,0.2)] transition-all">View</Button>
                  <Button onClick={() => handleDelete(t.id)} className="px-4 py-2 rounded-lg text-xs font-bold bg-[rgba(255,107,107,0.1)] text-[#ff6b6b] border border-[rgba(255,107,107,0.2)] hover:bg-[rgba(255,107,107,0.2)] transition-all">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}