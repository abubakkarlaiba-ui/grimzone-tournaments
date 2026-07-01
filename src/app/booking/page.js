'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function BookingForm() {
  const searchParams = useSearchParams();
  const [tournaments, setTournaments] = useState([]);
  const [selected, setSelected] = useState(searchParams.get('tournament') || '');
  const [msg, setMsg] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoggedIn(api.isLoggedIn());
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/tournaments/`)
      .then(r => r.json()).then(setTournaments).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setMsg('');
    try {
      const data = await api.createBooking({ tournamentTitle: selected });
      setMsg(`Slot booked! ${data.roomId ? `Room: ${data.roomId}${data.roomPassword ? ` Pass: ${data.roomPassword}` : ''}` : 'Awaiting room details.'}`);
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!loggedIn) return <div className="text-center py-20 text-[#7777aa]"><div className="text-4xl mb-4">🔒</div><h3 className="text-lg font-bold text-white mb-2">Please login</h3><p className="text-sm"><a href="/login" className="text-[#00d4ff] font-semibold">Login</a> to book a slot.</p></div>;

  return (
    <div className="max-w-lg mx-auto px-5 py-16">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-extrabold">Book a Slot</h1>
        <span className="h-0.5 bg-[linear-gradient(90deg,#00d4ff,#8b5cf6)] rounded-full mt-1.5" style={{width:'60px'}} />
      </div>
      <p className="text-[#7777aa] mb-8">Select a tournament and book your slot.</p>
      <form onSubmit={handleSubmit} className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,#00d4ff,#8b5cf6,#00d4ff)]" />
        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#7777aa] mb-1.5">Select Tournament</label>
          <select value={selected} onChange={e => setSelected(e.target.value)} className="w-full p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" required>
            <option value="">Choose a tournament...</option>
            {tournaments.map((t, i) => (
              <option key={i} value={t.title}>{t.title} - {t.entryFee} FF</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading || !selected} className="w-full py-3 rounded-lg font-bold text-white bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] shadow-[0_0_16px_rgba(0,212,255,0.2)] transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 disabled:opacity-50">
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
        {msg && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-semibold ${msg.includes('Error') ? 'bg-[rgba(231,76,60,0.08)] border border-[rgba(231,76,60,0.15)] text-[#e74c3c]' : 'bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.15)] text-[#00d4ff]'}`}>
            {msg}
          </div>
        )}
      </form>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-[#7777aa]">Loading...</div>}>
      <BookingForm />
    </Suspense>
  );
}
