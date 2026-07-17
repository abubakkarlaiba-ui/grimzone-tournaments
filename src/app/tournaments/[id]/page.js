'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Pusher from 'pusher-js';
import { api } from '@/lib/api';
import Button from '@/components/Button';

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '';

function calcBreakdown(entryFee, totalSlots, actualPrizeStr) {
  const total = entryFee * totalSlots;
  const prizePool = parseInt(actualPrizeStr) || total;
  const commission = total - prizePool;
  const winners = totalSlots > 8
    ? [
        { place:'1st', pct:50, pctVal:0.50, color:'#ffd700', glow:'rgba(255,215,0,0.15)' },
        { place:'2nd', pct:30, pctVal:0.30, color:'#c0c0c0', glow:'rgba(192,192,192,0.1)' },
        { place:'3rd', pct:20, pctVal:0.20, color:'#cd7f32', glow:'rgba(205,127,50,0.1)' },
      ]
    : [
        { place:'1st', pct:100, pctVal:1.0, color:'#ffd700', glow:'rgba(255,215,0,0.15)' },
      ];
  return { totalCollection: total, commission, prizePool, winners };
}

function Countdown({ target }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = new Date(target).getTime() - now.getTime();
  if (diff <= 0) return null;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="text-center py-6">
      <div className="text-xs text-[#7777aa] uppercase font-semibold tracking-wider mb-3">Starts in</div>
      <div className="flex justify-center gap-4">
        {d > 0 && (
          <div className="text-center">
            <div className="text-3xl font-black text-white bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-2 min-w-[70px]">{pad(d)}</div>
            <div className="text-[0.6rem] text-[#7777aa] uppercase tracking-wider mt-1">Days</div>
          </div>
        )}
        <div className="text-center">
          <div className="text-3xl font-black text-[#00d4ff] bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.15)] rounded-xl px-4 py-2 min-w-[70px]">{pad(h)}</div>
          <div className="text-[0.6rem] text-[#7777aa] uppercase tracking-wider mt-1">Hours</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-[#8b5cf6] bg-[rgba(139,92,246,0.06)] border border-[rgba(139,92,246,0.15)] rounded-xl px-4 py-2 min-w-[70px]">{pad(m)}</div>
          <div className="text-[0.6rem] text-[#7777aa] uppercase tracking-wider mt-1">Mins</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-[#ffd700] bg-[rgba(255,215,0,0.06)] border border-[rgba(255,215,0,0.15)] rounded-xl px-4 py-2 min-w-[70px]">{pad(s)}</div>
          <div className="text-[0.6rem] text-[#7777aa] uppercase tracking-wider mt-1">Secs</div>
        </div>
      </div>
    </div>
  );
}

export default function TournamentDetail() {
  const params = useParams();
  const [t, setT] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [roomPass, setRoomPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.init();
    setLoggedIn(api.isLoggedIn());
    setUser(api.user);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/tournaments/${params.id}/`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setT(data);
        setRoomId(data.room_id || '');
        setRoomPass(data.room_password || '');
      })
      .catch(() => {});

    if (api.isLoggedIn()) {
      api.getUserBookings().then(setBookings).catch(() => {});
    }

    if (PUSHER_KEY) {
      const pusher = new Pusher(PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2' });
      const channel = pusher.subscribe(`tournament-${params.id}`);
      channel.bind('room-updated', (data) => {
        setT(prev => prev ? { ...prev, room_id: data.room_id, room_password: data.room_password } : prev);
        setRoomId(data.room_id || '');
        setRoomPass(data.room_password || '');
      });
      return () => {
        channel.unbind_all();
        pusher.unsubscribe(`tournament-${params.id}`);
        pusher.disconnect();
      };
    }
  }, []);

  async function handleSaveRoom(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await api.setTournamentRoom(params.id, roomId, roomPass);
      setMsg('Room saved!');
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!t) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-12">
        <Link href="/tournaments" className="text-sm text-[#7777aa] hover:text-[#00d4ff] transition-colors mb-6 inline-block">← Back to Tournaments</Link>
        <div className="text-center py-20 text-[#7777aa]">
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="text-xl font-bold text-white mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  const fill = t.slots_filled ?? 0;
  const total = t.total_slots ?? 10;
  const pct = Math.round((fill / total) * 100);
  const bd = calcBreakdown(t.entry_fee, total, t.prize_pool);
  const typeColor = t.type === 'solo' ? '#00d4ff' : t.type === 'duo' ? '#8b5cf6' : '#ffd700';

  const hasStartTime = !!t.start_time;
  const now = new Date();
  const startDate = hasStartTime ? new Date(t.start_time) : null;
  const hasStarted = hasStartTime && startDate <= now;
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  const hasBooking = bookings.some(b => b.tournament_title === t.title);
  const showRoom = hasStarted && (isAdmin || hasBooking);

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <Link href="/tournaments" className="text-sm text-[#7777aa] hover:text-[#00d4ff] transition-colors mb-6 inline-block">← Back to Tournaments</Link>

      <div className="glass rounded-2xl p-8 mb-8 gradient-border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-bold px-3 py-1 rounded uppercase tracking-wide" style={{background:`${typeColor}15`,color:typeColor,border:`1px solid ${typeColor}20`}}>{t.type}</span>
            <h1 className="text-3xl font-black mt-3">{t.title}</h1>
            {t.start_time && (
              <p className="text-[#f1c40f] text-sm font-semibold mt-1">
                ⏰ {new Date(t.start_time).toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {!hasStarted && (
              <Link href={`/booking?tournament=${encodeURIComponent(t.title)}`} className="px-8 py-3.5 rounded-lg font-bold text-white bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] shadow-[0_0_24px_rgba(0,212,255,0.2)] transition-all hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] hover:-translate-y-1 active:scale-95">
                Book Slot
              </Link>
            )}
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }} className="text-xs text-[#7777aa] hover:text-[#00d4ff] transition-colors flex items-center gap-1" aria-label="Share tournament">
              📤 Share
            </button>
          </div>
        </div>

        {hasStartTime && !hasStarted && <Countdown target={t.start_time} />}

        {hasStarted && (
          <div className="bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.12)] rounded-xl p-5 mt-4">
            <div className="text-xs text-[#00d4ff] uppercase font-semibold tracking-wider mb-1">Tournament Started</div>
            {showRoom ? (
              isAdmin ? (
                <form onSubmit={handleSaveRoom} className="mt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-[#7777aa] font-semibold mb-1">Room ID</label>
                      <input value={roomId} onChange={e => setRoomId(e.target.value)} className="input-field" placeholder="Enter Room ID" required />
                    </div>
                    <div>
                      <label className="block text-xs text-[#7777aa] font-semibold mb-1">Room Password</label>
                      <input value={roomPass} onChange={e => setRoomPass(e.target.value)} className="input-field" placeholder="Enter Room Password" />
                    </div>
                  </div>
                  <Button type="submit" disabled={saving || !roomId} className="btn-gradient px-6 py-2 text-sm">Save Room</Button>
                  {msg && <p className="text-xs text-[#2ecc71] mt-2 font-semibold">{msg}</p>}
                </form>
              ) : (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-3 py-2 px-4 rounded-lg bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.1)]">
                    <span className="text-sm text-[#7777aa]">Room ID:</span>
                    <span className="text-lg font-black text-white tracking-wider">{t.room_id}</span>
                    <button onClick={() => { navigator.clipboard.writeText(t.room_id); }} className="ml-auto text-xs text-[#7777aa] hover:text-[#00d4ff] transition-colors px-2 py-1 rounded hover:bg-[rgba(0,212,255,0.1)]" aria-label="Copy Room ID">📋 Copy</button>
                  </div>
                  {t.room_password && (
                    <div className="flex items-center gap-3 py-2 px-4 rounded-lg bg-[rgba(139,92,246,0.06)] border border-[rgba(139,92,246,0.1)]">
                      <span className="text-sm text-[#7777aa]">Password:</span>
                      <span className="text-lg font-black text-[#8b5cf6] tracking-wider">{t.room_password}</span>
                      <button onClick={() => { navigator.clipboard.writeText(t.room_password); }} className="ml-auto text-xs text-[#7777aa] hover:text-[#8b5cf6] transition-colors px-2 py-1 rounded hover:bg-[rgba(139,92,246,0.1)]" aria-label="Copy Password">📋 Copy</button>
                    </div>
                  )}
                </div>
              )
            ) : (
              <p className="text-sm text-[#7777aa] mt-1">Room details will appear here for booked players.</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 my-6">
          <div className="bg-[rgba(255,255,255,0.03)] p-4 rounded-xl text-center">
            <div className="text-xs text-[#7777aa] uppercase font-semibold">Prize Pool</div>
            <div className="text-xl font-extrabold text-white mt-1">{t.prize_pool}</div>
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] p-4 rounded-xl text-center">
            <div className="text-xs text-[#7777aa] uppercase font-semibold">Entry Fee</div>
            <div className="text-xl font-extrabold text-[#00d4ff] mt-1">{t.entry_fee} FF</div>
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] p-4 rounded-xl text-center">
            <div className="text-xs text-[#7777aa] uppercase font-semibold">Total Slots</div>
            <div className="text-xl font-extrabold text-white mt-1">{total}</div>
          </div>
        </div>

        <div className="w-full h-2 bg-[rgba(255,255,255,0.06)] rounded-full my-4 overflow-hidden">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#00d4ff,#8b5cf6)] shadow-[0_0_8px_rgba(0,212,255,0.3)]" style={{width:`${pct}%`}} />
        </div>
        <div className="flex justify-between text-sm text-[#7777aa] font-semibold"><span>{fill}/{total} slots filled</span><span>{pct}%</span></div>
      </div>

      <div className="glass rounded-2xl p-8">
        <h2 className="text-xl font-black mb-6">Prize Breakdown</h2>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-[rgba(255,255,255,0.03)]">
            <span className="text-sm text-[#7777aa]">Entry Fee <span className="text-white">{t.entry_fee} FF</span> × <span className="text-white">{total}</span> slots</span>
            <span className="text-sm font-bold text-white">{bd.totalCollection.toFixed(0)} FF</span>
          </div>
          <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-[rgba(255,255,255,0.03)]">
            <span className="text-sm text-[#7777aa]">Commission ({bd.totalCollection > 0 ? Math.round(bd.commission / bd.totalCollection * 100) : 0}%)</span>
            <span className="text-sm font-bold text-[#e74c3c]">-{bd.commission.toFixed(0)} FF</span>
          </div>
          <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(0,212,255,0.1)]">
            <span className="text-sm font-bold text-white">Prize Pool ({bd.totalCollection > 0 ? Math.round(bd.prizePool / bd.totalCollection * 100) : 0}%)</span>
            <span className="text-sm font-bold text-[#00d4ff]">{bd.prizePool.toFixed(0)} FF</span>
          </div>
        </div>
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
          <h3 className="text-sm font-bold text-[#7777aa] uppercase tracking-wider mb-4">Winners</h3>
          <div className="grid grid-cols-1 md:grid-cols-{bd.winners.length} gap-3" style={{gridTemplateColumns:`repeat(${bd.winners.length}, minmax(0, 1fr))`}}>
            {bd.winners.map((p, i) => (
              <div key={i} className="text-center p-5 rounded-xl border" style={{background:`${p.glow}`,borderColor:`${p.color}20`}}>
                <div className="text-2xl mb-1">{['🥇','🥈','🥉'][i]}</div>
                <div className="text-sm font-bold" style={{color:p.color}}>{p.place} Place</div>
                <div className="text-xs text-[#7777aa]">{p.pct}% of prize pool</div>
                <div className="text-lg font-extrabold text-white mt-2">{(bd.prizePool * p.pctVal).toFixed(0)} FF</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
