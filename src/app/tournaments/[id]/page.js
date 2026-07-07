import Link from 'next/link';

const defaultTournaments = [
  { id:1, title:'Grand Battle Royale', type:'squad', prize_pool:'2000 PKR', entry_fee:25, total_slots:12, slots_filled:3, time:'5:15 PM' },
  { id:2, title:'Squad Showdown', type:'squad', prize_pool:'1000 PKR', entry_fee:15, total_slots:12, slots_filled:5, time:'6:00 PM' },
  { id:3, title:'Duo Rush', type:'duo', prize_pool:'800 PKR', entry_fee:10, total_slots:25, slots_filled:8, time:'7:30 PM' },
  { id:4, title:'Solo Clash', type:'solo', prize_pool:'500 PKR', entry_fee:5, total_slots:50, slots_filled:10, time:'8:00 PM' },
];

function calcBreakdown(entryFee, totalSlots) {
  const total = entryFee * totalSlots;
  const commission = total * 0.3;
  const prizePool = total - commission;
  return {
    totalCollection: total,
    commission,
    prizePool,
    first: prizePool * 0.5,
    second: prizePool * 0.3,
    third: prizePool * 0.2,
  };
}

async function getTournament(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/tournaments/${id}/`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch {}
  return defaultTournaments.find(t => t.id === parseInt(id)) || null;
}

export default async function TournamentDetail({ params }) {
  const t = await getTournament(params.id);
  if (!t) return <div className="text-center py-20 text-[#7777aa]"><h2 className="text-xl font-bold text-white mb-2">Tournament not found</h2><Link href="/tournaments" className="text-[#00d4ff] hover:underline">← Back</Link></div>;

  const fill = t.slots_filled ?? 0;
  const total = t.total_slots ?? 10;
  const pct = Math.round((fill / total) * 100);
  const bd = calcBreakdown(t.entry_fee, total);
  const typeColor = t.type === 'solo' ? '#00d4ff' : t.type === 'duo' ? '#8b5cf6' : '#ffd700';

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <Link href="/tournaments" className="text-sm text-[#7777aa] hover:text-[#00d4ff] transition-colors mb-6 inline-block">← Back to Tournaments</Link>

      <div className="glass rounded-2xl p-8 mb-8 gradient-border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-bold px-3 py-1 rounded uppercase tracking-wide" style={{background:`${typeColor}15`,color:typeColor,border:`1px solid ${typeColor}20`}}>{t.type}</span>
            <h1 className="text-3xl font-black mt-3">{t.title}</h1>
            {t.time && <p className="text-[#f1c40f] text-sm font-semibold mt-1">⏰ {t.time}</p>}
          </div>
          <Link href={`/booking?tournament=${encodeURIComponent(t.title)}`} className="px-8 py-3.5 rounded-lg font-bold text-white bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] shadow-[0_0_24px_rgba(0,212,255,0.2)] transition-all hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] hover:-translate-y-1 active:scale-95">
            Book Slot
          </Link>
        </div>

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
            <span className="text-sm text-[#7777aa]">Commission (30%)</span>
            <span className="text-sm font-bold text-[#e74c3c]">-{bd.commission.toFixed(0)} FF</span>
          </div>
          <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(0,212,255,0.1)]">
            <span className="text-sm font-bold text-white">Prize Pool (70%)</span>
            <span className="text-sm font-bold text-[#00d4ff]">{bd.prizePool.toFixed(0)} FF</span>
          </div>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
          <h3 className="text-sm font-bold text-[#7777aa] uppercase tracking-wider mb-4">Top 3 Winners</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { place:'1st', pct:50, amount:bd.first, color:'#ffd700', glow:'rgba(255,215,0,0.15)' },
              { place:'2nd', pct:30, amount:bd.second, color:'#c0c0c0', glow:'rgba(192,192,192,0.1)' },
              { place:'3rd', pct:20, amount:bd.third, color:'#cd7f32', glow:'rgba(205,127,50,0.1)' },
            ].map((p, i) => (
              <div key={i} className="text-center p-5 rounded-xl border" style={{background:`${p.glow}`,borderColor:`${p.color}20`}}>
                <div className="text-2xl mb-1">{['🥇','🥈','🥉'][i]}</div>
                <div className="text-sm font-bold" style={{color:p.color}}>{p.place} Place</div>
                <div className="text-xs text-[#7777aa]">{p.pct}% of prize pool</div>
                <div className="text-lg font-extrabold text-white mt-2">{p.amount.toFixed(0)} FF</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
