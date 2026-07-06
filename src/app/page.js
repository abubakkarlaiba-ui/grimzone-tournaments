import Link from 'next/link';

const defaultTournaments = [
  { id:1, title:'Grand Battle Royale', type:'squad', prizePool:'2000 PKR', entryFee:25, totalSlots:12, slotsFilled:3, time:'5:15 PM' },
  { id:2, title:'Squad Showdown', type:'squad', prizePool:'1000 PKR', entryFee:15, totalSlots:12, slotsFilled:5, time:'6:00 PM' },
  { id:3, title:'Duo Rush', type:'duo', prizePool:'800 PKR', entryFee:10, totalSlots:25, slotsFilled:8, time:'7:30 PM' },
  { id:4, title:'Solo Clash', type:'solo', prizePool:'500 PKR', entryFee:5, totalSlots:50, slotsFilled:10, time:'8:00 PM' },
];

async function getTournaments() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/tournaments/`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch {}
  return defaultTournaments;
}

export default async function HomePage() {
  const tournaments = await getTournaments();

  return (
    <>
      <section className="relative overflow-hidden text-center px-5 py-24 bg-[linear-gradient(135deg,#0a0a0f_0%,#0d0a1a_40%,#0a1220_70%,#0a0a0f_100%)]">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(0,212,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(139,92,246,0.06) 0%, transparent 50%)',
          animation: 'heroPulse 6s ease-in-out infinite',
        }} />
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0,212,255,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }} />
        <style>{`@keyframes heroPulse { 0%,100% { transform:scale(1); opacity:0.6 } 50% { transform:scale(1.05); opacity:1 } }`}</style>

        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-block bg-[linear-gradient(135deg,rgba(0,212,255,0.12),rgba(139,92,246,0.08))] text-[#00d4ff] px-5 py-1.5 rounded-full text-xs font-bold mb-5 border border-[rgba(0,212,255,0.2)] uppercase tracking-wider">
            #1 Free Fire Tournament Platform
          </span>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4 text-transparent bg-clip-text bg-[linear-gradient(135deg,#fff_30%,#00d4ff_70%,#8b5cf6)]">
            Dominate the Battlefield
          </h1>
          <p className="text-[#7777aa] text-lg leading-relaxed mb-9 max-w-lg mx-auto">
            Compete in Free Fire tournaments, earn tokens, and win real prizes. Join thousands of players on GrimZone.
          </p>
          <div className="flex gap-3.5 justify-center flex-wrap">
            <Link href="/tournaments" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-bold text-white bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] shadow-[0_0_24px_rgba(0,212,255,0.2)] transition-all hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] hover:-translate-y-1 active:scale-95">
              Browse Tournaments
            </Link>
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-bold text-white bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] backdrop-blur-sm transition-all hover:border-[#00d4ff] hover:text-[#00d4ff] hover:shadow-[0_0_30px_rgba(0,212,255,0.15)] hover:-translate-y-1 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: '👥', number: '850+', label: 'Active Players' },
            { icon: '🏆', number: '120+', label: 'Tournaments' },
            { icon: '💰', number: '50K+', label: 'Prizes Awarded' },
            { icon: '⭐', number: '4.9', label: 'Player Rating' },
          ].map((s, i) => (
            <div key={i} className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 text-center transition-all hover:border-[rgba(0,212,255,0.12)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,transparent,#00d4ff,transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black text-white">{s.number}</div>
              <div className="text-xs text-[#7777aa] mt-1 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-extrabold">Live Tournaments</h2>
          <span className="w-15 h-0.5 bg-[linear-gradient(90deg,#00d4ff,#8b5cf6)] rounded-full mt-1" style={{width:'60px'}} />
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center py-16 text-[#7777aa]">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-bold text-white mb-2">No tournaments yet</h3>
            <p className="text-sm">Check back soon for upcoming battles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((t, i) => (
              <TournamentCard key={i} tournament={t} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function TournamentCard({ tournament }) {
  const fill = tournament.slotsFilled ?? 0;
  const total = tournament.totalSlots ?? 10;
  const pct = Math.round((fill / total) * 100);
  const typeColor = tournament.type === 'solo' ? '#00d4ff' : tournament.type === 'duo' ? '#8b5cf6' : '#ffd700';

  return (
    <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 transition-all hover:border-[rgba(0,212,255,0.15)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,transparent,#00d4ff,transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">{tournament.title}</h3>
        <span className="text-xs font-bold px-3 py-1 rounded uppercase tracking-wide" style={{
          background: `${typeColor}15`,
          color: typeColor,
          border: `1px solid ${typeColor}20`,
        }}>
          {tournament.type}
        </span>
      </div>
      {tournament.time && (
        <div className="flex items-center gap-1.5 text-xs text-[#f1c40f] font-semibold mb-2">
          <span>⏰</span> {tournament.time}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 my-4">
        <div className="bg-[rgba(255,255,255,0.03)] p-2.5 rounded-lg text-center">
          <div className="text-[0.7rem] text-[#7777aa] uppercase font-semibold">Prize</div>
          <div className="text-lg font-extrabold text-white mt-0.5">{tournament.prizePool}</div>
        </div>
        <div className="bg-[rgba(255,255,255,0.03)] p-2.5 rounded-lg text-center">
          <div className="text-[0.7rem] text-[#7777aa] uppercase font-semibold">Entry</div>
          <div className="text-lg font-extrabold text-[#00d4ff] mt-0.5">{tournament.entryFee} FF</div>
        </div>
      </div>
      <div className="w-full h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full my-3 overflow-hidden">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#00d4ff,#8b5cf6)] transition-all shadow-[0_0_8px_rgba(0,212,255,0.3)]" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-[#7777aa] font-semibold">
        <span>{fill}/{total} slots filled</span>
        <span>{pct}%</span>
      </div>
      <Link href={`/tournaments/${tournament.id || encodeURIComponent(tournament.title)}`} className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] shadow-[0_0_16px_rgba(0,212,255,0.15)] transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 active:scale-[0.97]">
            View Details
        </Link>
      </div>
  );
}
