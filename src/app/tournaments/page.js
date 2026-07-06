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

export default async function TournamentsPage() {
  const tournaments = await getTournaments();
  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-extrabold">All Tournaments</h1>
        <span className="h-0.5 bg-[linear-gradient(90deg,#00d4ff,#8b5cf6)] rounded-full mt-1.5" style={{width:'60px'}} />
      </div>
      <p className="text-[#7777aa] mb-10">Browse and book your slot in upcoming Free Fire tournaments</p>

      {tournaments.length === 0 ? (
        <div className="text-center py-20 text-[#7777aa]">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-xl font-bold text-white mb-2">No tournaments available</h3>
          <p className="text-sm">Check back soon for upcoming battles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tournaments.map((t, i) => (
            <TournamentCard key={i} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function TournamentCard({ t }) {
  const fill = t.slotsFilled ?? 0;
  const total = t.totalSlots ?? 10;
  const pct = Math.round((fill / total) * 100);
  const typeColor = t.type === 'solo' ? '#00d4ff' : t.type === 'duo' ? '#8b5cf6' : '#ffd700';
  return (
    <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 transition-all hover:border-[rgba(0,212,255,0.15)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,transparent,#00d4ff,transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">{t.title}</h3>
        <span className="text-xs font-bold px-3 py-1 rounded uppercase tracking-wide" style={{background:`${typeColor}15`,color:typeColor,border:`1px solid ${typeColor}20`}}>{t.type}</span>
      </div>
      {t.time && (
        <div className="flex items-center gap-1.5 text-xs text-[#f1c40f] font-semibold mb-2">
          <span>⏰</span> {t.time}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 my-4">
        <div className="bg-[rgba(255,255,255,0.03)] p-2.5 rounded-lg text-center">
          <div className="text-[0.7rem] text-[#7777aa] uppercase font-semibold">Prize</div>
          <div className="text-lg font-extrabold text-white mt-0.5">{t.prizePool}</div>
        </div>
        <div className="bg-[rgba(255,255,255,0.03)] p-2.5 rounded-lg text-center">
          <div className="text-[0.7rem] text-[#7777aa] uppercase font-semibold">Entry</div>
          <div className="text-lg font-extrabold text-[#00d4ff] mt-0.5">{t.entryFee} FF</div>
        </div>
      </div>
      <div className="w-full h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full my-3 overflow-hidden">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#00d4ff,#8b5cf6)] shadow-[0_0_8px_rgba(0,212,255,0.3)]" style={{width:`${pct}%`}} />
      </div>
      <div className="flex justify-between text-xs text-[#7777aa] font-semibold mb-4"><span>{fill}/{total} slots</span><span>{pct}%</span></div>
      <Link href={`/tournaments/${t.id}`} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] shadow-[0_0_16px_rgba(0,212,255,0.15)] transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 active:scale-[0.97]">
        View Details
      </Link>
    </div>
  );
}
