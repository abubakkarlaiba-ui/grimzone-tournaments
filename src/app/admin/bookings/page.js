'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [msg, setMsg] = useState('');
  const [roomForm, setRoomForm] = useState({ bookingId: '', roomId: '', roomPassword: '' });

  useEffect(() => {
    api.init();
    if (!api.isLoggedIn() || !api.isAdmin()) { window.location.href = '/login'; return; }
    load();
  }, []);

  async function load() {
    try { setBookings(await api.getAdminBookings()); } catch {}
  }

  async function handleSetRoom(e) {
    e.preventDefault();
    if (!roomForm.bookingId || !roomForm.roomId) return;
    try {
      await api.setRoomId(roomForm.bookingId, roomForm.roomId, roomForm.roomPassword);
      setMsg(`Room set for booking #${roomForm.bookingId}`);
      setRoomForm({ bookingId: '', roomId: '', roomPassword: '' });
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  }

  return (
    <div className="flex min-h-[80vh]">
      <AdminSidebar />
      <div className="flex-1 md:ml-56 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-extrabold">Manage Bookings</h2>
        </div>
        {msg && <div className="p-3 mb-4 rounded-lg text-sm font-semibold bg-[rgba(46,204,113,0.08)] border border-[rgba(46,204,113,0.15)] text-[#2ecc71]">{msg}</div>}

        <form onSubmit={handleSetRoom} className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 mb-6">
          <h3 className="font-bold mb-4">Set Room ID</h3>
          <div className="flex gap-3">
            <input type="number" value={roomForm.bookingId} onChange={e => setRoomForm({...roomForm,bookingId:e.target.value})} className="w-24 p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="Booking ID" required />
            <input value={roomForm.roomId} onChange={e => setRoomForm({...roomForm,roomId:e.target.value})} className="flex-1 p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="Room ID" required />
            <input value={roomForm.roomPassword} onChange={e => setRoomForm({...roomForm,roomPassword:e.target.value})} className="w-32 p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="Password (optional)" />
            <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] shadow-[0_0_16px_rgba(0,212,255,0.15)] transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]">Set Room</button>
          </div>
        </form>

        <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">ID</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Player</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Tournament</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Room ID</th>
                <th className="text-left p-3.5 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-[#7777aa] text-sm">No bookings yet.</td></tr>
              ) : bookings.map((b) => (
                <tr key={b.id} className="border-b border-[rgba(255,255,255,0.06)] last:border-b-0">
                  <td className="p-3.5 text-sm text-[#7777aa]">{b.id}</td>
                  <td className="p-3.5 text-sm font-semibold">{b.user?.username || b.userId}</td>
                  <td className="p-3.5 text-sm">{b.tournamentTitle || '-'}</td>
                  <td className="p-3.5 text-sm">{b.roomId || <span className="text-[#f1c40f]">Not set</span>}</td>
                  <td className="p-3.5 text-sm">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase ${b.roomId ? 'bg-[rgba(46,204,113,0.1)] border border-[rgba(46,204,113,0.15)] text-[#2ecc71]' : 'bg-[rgba(241,196,15,0.1)] border border-[rgba(241,196,15,0.15)] text-[#f1c40f]'}`}>
                      {b.roomId ? 'Ready' : 'Pending'}
                    </span>
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
