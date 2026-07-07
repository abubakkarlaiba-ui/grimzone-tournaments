'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/Button';

export default function TeamsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [tab, setTab] = useState('create');
  const [msg, setMsg] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const [createTitle, setCreateTitle] = useState('');
  const [createdTeam, setCreatedTeam] = useState(null);

  const [joinCode, setJoinCode] = useState('');
  const [lookedUpTeam, setLookedUpTeam] = useState(null);
  const [joinMsg, setJoinMsg] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    setLoggedIn(api.isLoggedIn());
    api.getTournaments().then(setTournaments).catch(() => {});
  }, []);

  async function handleCreateTeam(e) {
    e.preventDefault();
    if (!createTitle) return;
    setLoading(true);
    setMsg('');
    setCreatedTeam(null);
    try {
      const data = await api.createTeam(createTitle);
      setCreatedTeam(data);
      setMsg(`Team created! Code: ${data.code}`);
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLookupTeam(e) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLookupLoading(true);
    setLookedUpTeam(null);
    setJoinMsg('');
    try {
      const data = await api.getTeam(joinCode.trim().toUpperCase());
      setLookedUpTeam(data);
    } catch (err) {
      setJoinMsg('Team not found');
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleJoinTeam() {
    setJoinLoading(true);
    setJoinMsg('');
    try {
      const data = await api.joinTeam(joinCode.trim().toUpperCase());
      setJoinMsg(data.message);
      setLookedUpTeam(null);
    } catch (err) {
      setJoinMsg('Error: ' + err.message);
    } finally {
      setJoinLoading(false);
    }
  }

  function handleCopyCode() {
    if (codeRef.current) {
      navigator.clipboard.writeText(codeRef.current.textContent);
      setMsg('Copied!');
    }
  }

  if (!loggedIn) return <div className="text-center py-20 text-[#7777aa]"><div className="text-4xl mb-4">🔒</div><h3 className="text-lg font-bold text-white mb-2">Please login</h3><p className="text-sm"><a href="/login" className="text-[#00d4ff] font-semibold">Login</a> to create or join a team.</p></div>;

  const teamTournaments = tournaments.filter(t => t.type === 'duo' || t.type === 'squad');
  const myTeams = [];
  const tabs = [
    { key: 'create', label: 'Create Team' },
    { key: 'join', label: 'Join Team' },
  ];

  return (
    <div className="max-w-lg mx-auto px-5 py-16">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-extrabold">Teams</h1>
        <span className="h-0.5 bg-[linear-gradient(90deg,#8b5cf6,#00d4ff)] rounded-full mt-1.5" style={{width:'60px'}} />
      </div>
      <p className="text-[#7777aa] mb-6">Create a team for duo &amp; squad tournaments, or join one with a team code.</p>

      <div className="flex gap-1 bg-[rgba(255,255,255,0.03)] rounded-xl p-1 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setMsg(''); setJoinMsg(''); setCreatedTeam(null); setLookedUpTeam(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === t.key ? 'bg-[linear-gradient(135deg,#8b5cf6,#00d4ff)] text-white shadow-[0_0_12px_rgba(139,92,246,0.2)]' : 'text-[#7777aa] hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'create' && (
        <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,#8b5cf6,#00d4ff,#8b5cf6)]" />
          {!createdTeam ? (
            <form onSubmit={handleCreateTeam}>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#7777aa] mb-1.5">Select Duo / Squad Tournament</label>
                <select value={createTitle} onChange={e => setCreateTitle(e.target.value)} className="w-full p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff]" required>
                  <option value="">Choose a tournament...</option>
                  {teamTournaments.map((t, i) => (
                    <option key={i} value={t.title}>{t.title} ({t.type}) - {t.entry_fee} FF</option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={loading || !createTitle} className="w-full py-3 rounded-lg font-bold text-white bg-[linear-gradient(135deg,#8b5cf6,#00d4ff)] shadow-[0_0_16px_rgba(139,92,246,0.2)] transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 disabled:opacity-50 active:scale-[0.98]">
                {loading ? <span className="btn-spinner" /> : 'Create Team (Pay Entry Fee)'}
              </Button>
              {msg && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-semibold ${msg.includes('Error') ? 'bg-[rgba(231,76,60,0.08)] border border-[rgba(231,76,60,0.15)] text-[#e74c3c]' : 'bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.15)] text-[#00d4ff]'}`}>
                  {msg}
                </div>
              )}
            </form>
          ) : (
            <div className="text-center">
              <div className="text-xs text-[#7777aa] uppercase font-semibold mb-2">Team Code</div>
              <div ref={codeRef} className="text-5xl font-black tracking-[0.15em] bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] bg-clip-text text-transparent mb-4 select-all">
                {createdTeam.code}
              </div>
              <Button onClick={handleCopyCode} className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] active:scale-90 transition-all mb-6">
                Copy Code
              </Button>
              <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4 mb-4">
                <div className="text-sm text-[#7777aa] mb-1">{createdTeam.tournament_title} ({createdTeam.tournament_type})</div>
                <div className="text-sm text-white font-semibold">Members: <span className="text-[#00d4ff]">{createdTeam.members.length}</span> / {createdTeam.max_members}</div>
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                  {createdTeam.members.map((m, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.15)] text-[#00d4ff]">
                      {m.freefire_name || m.username}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#7777aa]">Share this code with your teammates to join.</p>
              <button onClick={() => { setCreatedTeam(null); setMsg(''); }} className="mt-4 text-xs text-[#7777aa] hover:text-white transition-colors">
                ← Create another team
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'join' && (
        <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,#00d4ff,#8b5cf6,#00d4ff)]" />
          {!lookedUpTeam ? (
            <form onSubmit={handleLookupTeam}>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#7777aa] mb-1.5">Enter Team Code</label>
                <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6} placeholder="e.g. X7K2M9" className="w-full p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm text-center text-xl font-black tracking-[0.15em] focus:outline-none focus:border-[#00d4ff] uppercase" required />
              </div>
              <Button type="submit" disabled={lookupLoading || joinCode.trim().length < 6} className="w-full py-3 rounded-lg font-bold text-white bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] shadow-[0_0_16px_rgba(0,212,255,0.2)] transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 disabled:opacity-50 active:scale-[0.98]">
                {lookupLoading ? <span className="btn-spinner" /> : 'Look Up Team'}
              </Button>
              {joinMsg && (
                <div className="mt-4 p-3 rounded-lg text-sm font-semibold bg-[rgba(231,76,60,0.08)] border border-[rgba(231,76,60,0.15)] text-[#e74c3c]">
                  {joinMsg}
                </div>
              )}
            </form>
          ) : (
            <div>
              <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs text-[#7777aa] uppercase font-semibold">Tournament</div>
                    <div className="text-white font-bold">{lookedUpTeam.tournament_title}</div>
                    <div className="text-xs text-[#7777aa] mt-1">Type: {lookedUpTeam.tournament_type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#7777aa] uppercase font-semibold">Members</div>
                    <div className="text-white font-bold">{lookedUpTeam.members?.length || 0} / {lookedUpTeam.max_members}</div>
                  </div>
                </div>
                {lookedUpTeam.members?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {lookedUpTeam.members.map((m, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.15)] text-[#8b5cf6]">
                        {m.user?.freefire_name || m.user?.username || 'Unknown'}
                      </span>
                    ))}
                  </div>
                )}
                {lookedUpTeam.is_locked ? (
                  <div className="text-center py-3 rounded-lg bg-[rgba(231,76,60,0.08)] border border-[rgba(231,76,60,0.15)] text-[#e74c3c] text-sm font-semibold">
                    This team is full
                  </div>
                ) : (
                  <Button onClick={handleJoinTeam} disabled={joinLoading} className="w-full py-3 rounded-lg font-bold text-white bg-[linear-gradient(135deg,#8b5cf6,#00d4ff)] shadow-[0_0_16px_rgba(139,92,246,0.2)] transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 disabled:opacity-50 active:scale-[0.98]">
                    {joinLoading ? <span className="btn-spinner" /> : 'Join Team (Pay Entry Fee)'}
                  </Button>
                )}
                <button onClick={() => { setLookedUpTeam(null); setJoinMsg(''); }} className="mt-3 text-xs text-[#7777aa] hover:text-white transition-colors w-full text-center">
                  ← Try another code
                </button>
              </div>
              {joinMsg && (
                <div className={`p-3 rounded-lg text-sm font-semibold ${joinMsg.includes('Error') ? 'bg-[rgba(231,76,60,0.08)] border border-[rgba(231,76,60,0.15)] text-[#e74c3c]' : 'bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.15)] text-[#00d4ff]'}`}>
                  {joinMsg}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
