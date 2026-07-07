'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/Button';

export default function OwnerDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');
  const [msgError, setMsgError] = useState(false);
  function showMsg(m, isError) { setMsg(m); setMsgError(!!isError); }
  const [tab, setTab] = useState('overview');
  const [form, setForm] = useState({ title: '', type: 'solo', prizePool: '', entryFee: '', totalSlots: '' });
  const [tokenUser, setTokenUser] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [deductUser, setDeductUser] = useState('');
  const [deductAmount, setDeductAmount] = useState('');
  const [roomForm, setRoomForm] = useState({ bookingId: '', roomId: '', roomPassword: '' });

  useEffect(() => {
    api.init();
    if (!api.isLoggedIn() || !api.isOwner()) { window.location.href = '/login'; return; }
    setUser(api.user);
    api.getAdminStats().then(setStats).catch(() => {});
    api.getTournaments().then(setTournaments).catch(() => {});
    api.getPayments().then(setPayments).catch(() => {});
    api.getAdminBookings().then(setBookings).catch(() => {});
    api.getUsers().then(setUsers).catch(() => {});
  }, []);

  if (!user) return <div className="text-center py-20 text-[#7777aa]">Loading...</div>;
  if (!api.isOwner()) return <div className="text-center py-20 text-[#7777aa]"><div className="text-4xl mb-4">🚫</div><h3 className="text-lg font-bold text-white mb-2">Access Denied</h3><p className="text-sm">Only the owner can access this page.</p></div>;

  const statsCards = [
    { icon: '👥', label: 'Users', value: stats?.total_users ?? '-' },
    { icon: '🏆', label: 'Tournaments', value: stats?.total_tournaments ?? '-' },
    { icon: '📋', label: 'Bookings', value: stats?.total_bookings ?? '-' },
    { icon: '⏳', label: 'Pending Payments', value: stats?.pending_payments ?? '-' },
  ];

  async function createTournament(e) {
    e.preventDefault();
    try {
      await api.createTournament({
        title: form.title,
        type: form.type,
        prize_pool: form.prizePool,
        entry_fee: parseInt(form.entryFee) || 0,
        total_slots: parseInt(form.totalSlots) || 10,
      });
      showMsg('Tournament created!');
      setForm({ title: '', type: 'solo', prizePool: '', entryFee: '', totalSlots: '' });
      setTournaments(await api.getTournaments());
      setStats(await api.getAdminStats());
    } catch (err) { showMsg('Error: ' + err.message, true); }
  }

  async function deleteTournament(id) {
    if (!confirm('Delete?')) return;
    try {
      await api.deleteTournament(id);
      showMsg('Deleted');
      setTournaments(await api.getTournaments());
      setStats(await api.getAdminStats());
    } catch (err) { showMsg('Error: ' + err.message, true); }
  }

  async function handleVerify(id, action) {
    try {
      await api.verifyPayment(id, action);
      showMsg(`Payment ${action}ed`);
      setPayments(await api.getPayments());
      setStats(await api.getAdminStats());
    } catch (err) { showMsg('Error: ' + err.message, true); }
  }

  async function handleAddTokens(e) {
    e.preventDefault();
    const uid = tokenUser.trim();
    const amt = parseInt(tokenAmount);
    if (!uid || isNaN(amt) || amt <= 0) { showMsg('Enter a valid user ID and amount', true); return; }
    try {
      await api.addTokens(uid, amt);
      showMsg(`Added ${amt} tokens to user #${uid}`);
      setTokenUser(''); setTokenAmount('');
      setUsers(await api.getUsers());
    } catch (err) { showMsg('Error: ' + err.message, true); }
  }

  async function handleDeductTokens(e) {
    e.preventDefault();
    const uid = deductUser.trim();
    const amt = parseInt(deductAmount);
    if (!uid || isNaN(amt) || amt <= 0) { showMsg('Enter a valid user ID and amount', true); return; }
    try {
      await api.deductTokens(uid, amt);
      showMsg(`Deducted ${amt} tokens from user #${uid}`);
      setDeductUser(''); setDeductAmount('');
      setUsers(await api.getUsers());
    } catch (err) { showMsg('Error: ' + err.message, true); }
  }

  async function handleSetRoom(e) {
    e.preventDefault();
    if (!roomForm.bookingId || !roomForm.roomId) return;
    try {
      await api.setRoomId(roomForm.bookingId, roomForm.roomId, roomForm.roomPassword);
      showMsg(`Room set for booking #${roomForm.bookingId}`);
      setRoomForm({ bookingId: '', roomId: '', roomPassword: '' });
      setBookings(await api.getAdminBookings());
    } catch (err) { showMsg('Error: ' + err.message, true); }
  }

  async function handleRoleUpdate(userId, role) {
    try {
      await api.updateUserRole(userId, role);
      showMsg(`User #${userId} role set to ${role}`);
      setUsers(await api.getUsers());
    } catch (err) { showMsg('Error: ' + err.message, true); }
  }

  const tabs = ['overview', 'tournaments', 'payments', 'bookings', 'users'];

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <h2 className="text-2xl font-extrabold">Owner Dashboard</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-[rgba(139,92,246,0.12)] text-[#8b5cf6] border border-[rgba(139,92,246,0.2)]">👑 Owner</span>
          <span className="text-sm text-[#7777aa]">{user.username}</span>
        </div>
      </div>

      {msg && <div className={`p-3 mb-4 rounded-lg text-sm font-semibold ${msgError ? 'bg-[rgba(231,76,60,0.08)] border-[rgba(231,76,60,0.15)] text-[#e74c3c]' : 'bg-[rgba(46,204,113,0.08)] border-[rgba(46,204,113,0.15)] text-[#2ecc71]'} border`}>{msg}<button onClick={() => setMsg('')} className="float-right text-[#7777aa]">✕</button></div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statsCards.map((s, i) => (
          <div key={i} className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-xs text-[#7777aa] mt-1 font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <Button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize active:scale-95 ${tab === t ? 'bg-[linear-gradient(135deg,#8b5cf6,#00d4ff)] text-white shadow-[0_0_16px_rgba(139,92,246,0.2)]' : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] text-[#7777aa] hover:text-white'}`}>{t}</Button>
        ))}
        <a href="/" className="px-4 py-2 rounded-lg text-sm font-bold text-[#7777aa] hover:text-[#00d4ff] ml-auto">← Back to Site</a>
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
            <h3 className="font-bold mb-4">Recent Tournaments</h3>
            {tournaments.slice(0, 4).map((t) => (
              <div key={t.id} className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.06)] last:border-0">
                <span className="text-sm">{t.title}</span>
                <span className="text-xs text-[#7777aa]">{(t.slots_filled ?? 0)}/{t.total_slots ?? 10}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
            <h3 className="font-bold mb-4">Pending Payments</h3>
            {payments.filter(p => p.status === 'pending').slice(0, 4).map((p) => (
              <div key={p.id} className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.06)] last:border-0">
                <span className="text-sm">{p.user?.username || p.userId}</span>
                <div className="flex gap-2">
                  <Button onClick={() => handleVerify(p.id, 'verify')} className="px-2 py-0.5 rounded text-xs font-bold text-white bg-[#2ecc71] hover:brightness-110 hover:-translate-y-0.5 active:scale-90 transition-all">✓</Button>
                  <Button onClick={() => handleVerify(p.id, 'reject')} className="px-2 py-0.5 rounded text-xs font-bold text-white bg-[#e74c3c] hover:brightness-110 hover:-translate-y-0.5 active:scale-90 transition-all">✕</Button>
                </div>
              </div>
            ))}
            {payments.filter(p => p.status === 'pending').length === 0 && <p className="text-sm text-[#7777aa]">None pending.</p>}
          </div>
          <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
            <h3 className="font-bold mb-4">Set Room</h3>
            <form onSubmit={handleSetRoom} className="flex gap-2">
              <input type="number" value={roomForm.bookingId} onChange={e => setRoomForm({...roomForm,bookingId:e.target.value})} className="w-20 p-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-xs focus:outline-none focus:border-[#00d4ff]" placeholder="B ID" required />
              <input value={roomForm.roomId} onChange={e => setRoomForm({...roomForm,roomId:e.target.value})} className="flex-1 p-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-xs focus:outline-none focus:border-[#00d4ff]" placeholder="Room ID" required />
              <input value={roomForm.roomPassword} onChange={e => setRoomForm({...roomForm,roomPassword:e.target.value})} className="w-20 p-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-xs focus:outline-none focus:border-[#00d4ff]" placeholder="Pass" />
              <Button type="submit" className="px-3 py-2 rounded-lg text-xs font-bold text-white bg-[linear-gradient(135deg,#8b5cf6,#00d4ff)] hover:-translate-y-0.5 active:scale-90 transition-all">Set</Button>
            </form>
          </div>
          <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
            <h3 className="font-bold mb-4">Add Tokens</h3>
            <form onSubmit={handleAddTokens} className="flex gap-2">
              <input value={tokenUser} onChange={e => setTokenUser(e.target.value)} className="flex-1 p-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-xs focus:outline-none focus:border-[#00d4ff]" placeholder="User ID" required />
              <input type="number" value={tokenAmount} onChange={e => setTokenAmount(e.target.value)} className="w-20 p-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-xs focus:outline-none focus:border-[#00d4ff]" placeholder="Amount" required />
              <Button type="submit" className="px-3 py-2 rounded-lg text-xs font-bold text-white bg-[#2ecc71] hover:brightness-110 hover:-translate-y-0.5 active:scale-90 transition-all">Add</Button>
            </form>
          </div>
          <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
            <h3 className="font-bold mb-4">Deduct Tokens</h3>
            <form onSubmit={handleDeductTokens} className="flex gap-2">
              <input value={deductUser} onChange={e => setDeductUser(e.target.value)} className="flex-1 p-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-xs focus:outline-none focus:border-[#00d4ff]" placeholder="User ID" required />
              <input type="number" value={deductAmount} onChange={e => setDeductAmount(e.target.value)} className="w-20 p-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-xs focus:outline-none focus:border-[#00d4ff]" placeholder="Amount" required />
              <Button type="submit" className="px-3 py-2 rounded-lg text-xs font-bold text-white bg-[#e74c3c] hover:brightness-110 hover:-translate-y-0.5 active:scale-90 transition-all">Deduct</Button>
            </form>
          </div>
        </div>
      )}

      {tab === 'tournaments' && (
        <div>
          <form onSubmit={createTournament} className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 mb-6">
            <h3 className="font-bold mb-4">Create Tournament</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              <input value={form.title} onChange={e => setForm({...form,title:e.target.value})} className="p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="Title" required />
              <select value={form.type} onChange={e => setForm({...form,type:e.target.value})} className="p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff)]"><option value="solo">Solo</option><option value="duo">Duo</option><option value="squad">Squad</option></select>
              <input value={form.prizePool} onChange={e => setForm({...form,prizePool:e.target.value})} className="p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="Prize Pool" required />
              <input type="number" value={form.entryFee} onChange={e => setForm({...form,entryFee:e.target.value})} className="p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="Entry Fee" required />
              <input type="number" value={form.totalSlots} onChange={e => setForm({...form,totalSlots:e.target.value})} className="p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="Total Slots" />
            </div>
            <Button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[linear-gradient(135deg,#2ecc71,#27ae60)] hover:brightness-110 hover:-translate-y-0.5 active:scale-95 transition-all">Create</Button>
          </form>
          <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead><tr>{['ID','Title','Type','Prize','Slots','',''].map(h => <th key={h} className="text-left p-3 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">{h}</th>)}</tr></thead>
              <tbody>{tournaments.map(t => <tr key={t.id} className="border-b border-[rgba(255,255,255,0.06)]"><td className="p-3 text-xs text-[#7777aa]">{t.id}</td><td className="p-3 text-sm font-semibold">{t.title}</td><td className="p-3 text-sm capitalize">{t.type}</td><td className="p-3 text-sm">{t.prize_pool}</td><td className="p-3 text-sm">{(t.slots_filled ?? 0)}/{t.total_slots ?? 10}</td><td className="p-3"><a href={`/tournaments/${t.id}`} className="text-[#00d4ff] text-xs hover:underline">View</a></td><td className="p-3"><Button onClick={() => deleteTournament(t.id)} className="px-2 py-1 rounded text-xs font-bold text-white bg-[#e74c3c] hover:brightness-110 active:scale-90 transition-all">Delete</Button></td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr>{['User','Amount','Status',''].map(h => <th key={h} className="text-left p-3 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">{h}</th>)}</tr></thead>
            <tbody>{payments.length === 0 ? <tr><td colSpan="4" className="p-8 text-center text-[#7777aa] text-sm">No payments.</td></tr> : payments.map(p => <tr key={p.id} className="border-b border-[rgba(255,255,255,0.06)]"><td className="p-3 text-sm">{p.user?.username || p.userId}</td><td className="p-3 text-sm">{p.amount}</td><td className="p-3 text-sm"><span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${p.status === 'verified' ? 'text-[#2ecc71] bg-[rgba(46,204,113,0.1)]' : p.status === 'rejected' ? 'text-[#e74c3c] bg-[rgba(231,76,60,0.1)]' : 'text-[#f1c40f] bg-[rgba(241,196,15,0.1)]'}`}>{p.status || 'pending'}</span></td><td className="p-3">{p.status !== 'verified' && p.status !== 'rejected' && <div className="flex gap-1"><Button onClick={() => handleVerify(p.id,'verify')} className="px-2 py-1 rounded text-xs font-bold text-white bg-[#2ecc71] hover:brightness-110 active:scale-90 transition-all">Verify</Button><Button onClick={() => handleVerify(p.id,'reject')} className="px-2 py-1 rounded text-xs font-bold text-white bg-[#e74c3c] hover:brightness-110 active:scale-90 transition-all">Reject</Button></div>}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr>{['ID','Player','Tournament','Room ID','Status'].map(h => <th key={h} className="text-left p-3 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">{h}</th>)}</tr></thead>
            <tbody>{bookings.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-[#7777aa] text-sm">No bookings.</td></tr> : bookings.map(b => <tr key={b.id} className="border-b border-[rgba(255,255,255,0.06)]"><td className="p-3 text-xs text-[#7777aa]">{b.id}</td><td className="p-3 text-sm font-semibold">{b.user?.username || b.userId}</td><td className="p-3 text-sm">{b.tournamentTitle || '-'}</td><td className="p-3 text-sm">{b.roomId || <span className="text-[#f1c40f] text-xs">Not set</span>}</td><td className="p-3 text-sm"><span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${b.roomId ? 'text-[#2ecc71] bg-[rgba(46,204,113,0.1)]' : 'text-[#f1c40f] bg-[rgba(241,196,15,0.1)]'}`}>{b.roomId ? 'Ready' : 'Pending'}</span></td></tr>)}</tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <form onSubmit={handleAddTokens} className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
              <h3 className="font-bold mb-4">Add Tokens</h3>
              <div className="flex gap-3">
                <input value={tokenUser} onChange={e => setTokenUser(e.target.value)} className="flex-1 p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="User ID" required />
                <input type="number" value={tokenAmount} onChange={e => setTokenAmount(e.target.value)} className="w-32 p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="Amount" required />
                <Button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#2ecc71] hover:brightness-110 hover:-translate-y-0.5 active:scale-95 transition-all">Add</Button>
              </div>
            </form>
            <form onSubmit={handleDeductTokens} className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
              <h3 className="font-bold mb-4">Deduct Tokens</h3>
              <div className="flex gap-3">
                <input value={deductUser} onChange={e => setDeductUser(e.target.value)} className="flex-1 p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="User ID" required />
                <input type="number" value={deductAmount} onChange={e => setDeductAmount(e.target.value)} className="w-32 p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" placeholder="Amount" required />
                <Button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#e74c3c] hover:brightness-110 hover:-translate-y-0.5 active:scale-95 transition-all">Deduct</Button>
              </div>
            </form>
          </div>
          <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead><tr>{['ID','Username','Email','Tokens','Role','Actions'].map(h => <th key={h} className="text-left p-3 text-xs font-bold text-[#7777aa] uppercase border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">{h}</th>)}</tr></thead>
              <tbody>{users.map(u => <tr key={u.id} className="border-b border-[rgba(255,255,255,0.06)]">
                <td className="p-3 text-xs text-[#7777aa]">{u.id}</td>
                <td className="p-3 text-sm font-semibold">{u.username} {u.role === 'owner' ? '👑' : ''}</td>
                <td className="p-3 text-sm">{u.email}</td>
                <td className="p-3 text-sm">{u.tokens ?? 0}</td>
                <td className="p-3 text-sm capitalize"><span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${u.role === 'owner' ? 'text-[#8b5cf6] bg-[rgba(139,92,246,0.1)]' : u.role === 'admin' ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.1)]' : 'text-[#7777aa] bg-[rgba(255,255,255,0.04)]'}`}>{u.role || 'player'}</span></td>
                <td className="p-3">
                  {u.role !== 'owner' && (
                    <div className="flex gap-1">
                      {u.role === 'admin' ? (
                        <Button onClick={() => handleRoleUpdate(u.id, 'player')} className="px-2 py-1 rounded text-xs font-bold text-white bg-[#e74c3c] hover:brightness-110 active:scale-90 transition-all">Demote</Button>
                      ) : (
                        <Button onClick={() => handleRoleUpdate(u.id, 'admin')} className="px-2 py-1 rounded text-xs font-bold text-white bg-[#2ecc71] hover:brightness-110 active:scale-90 transition-all">Promote</Button>
                      )}
                    </div>
                  )}
                </td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
