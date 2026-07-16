'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/Button';

function BookingForm() {
  const searchParams = useSearchParams();
  const [tournaments, setTournaments] = useState([]);
  const [selected, setSelected] = useState(searchParams.get('tournament_id') || '');
  const [msg, setMsg] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoggedIn(api.isLoggedIn());
    api.getTournaments().then(setTournaments).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setMsg('');
    try {
      const data = await api.createBooking({ tournament_id: parseInt(selected) });
      setMsg(`Slot booked! ${data.room_id ? `Room: ${data.room_id}${data.room_password ? ` Pass: ${data.room_password}` : ''}` : 'Awaiting room details.'}`);
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!loggedIn) return <div className="text-center py-20 text-[#7777aa]"><div className="text-4xl mb-4">🔒</div><h3 className="text-lg font-bold text-white mb-2">Please login</h3><p className="text-sm"><a href="/login" className="text-[#00d4ff] font-semibold">Login</a> to book a slot.</p></div>;

  const soloTournaments = tournaments.filter(t => t.type === 'solo');

  return (
    <div className="max-w-lg mx-auto px-5 py-16">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-extrabold">Book a Slot</h1>
        <span className="h-0.5 bg-[linear-gradient(90deg,#00d4ff,#8b5cf6)] rounded-full mt-1.5" style={{width:'60px'}} />
      </div>
      <p className="text-[#7777aa] mb-8">Select a solo tournament and book your slot. For duo &amp; squad tournaments, <a href="/teams" className="text-[#00d4ff] font-semibold hover:underline">create or join a team</a>.</p>
      <form onSubmit={handleSubmit} className="glass p-6 gradient-border relative overflow-hidden">
        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#7777aa] mb-1.5">Select Solo Tournament</label>
            <select value={selected} onChange={e => setSelected(e.target.value)} className="input-field" required>
              <option value="">Choose a tournament...</option>
              {soloTournaments.map(t => (
                <option key={t.id} value={t.id}>{t.title} - {t.entry_fee} FF</option>
              ))}
            </select>
        </div>
        <Button type="submit" disabled={loading || !selected} className="btn-gradient w-full py-3">
          {loading ? <span className="btn-spinner" /> : 'Confirm Booking'}
        </Button>
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
