export const metadata = {
  title: 'Rules',
  description: 'Fair play rules for all Free Fire tournament participants on GrimZone.',
  openGraph: { title: 'Rules - GrimZone', description: 'Fair play rules for all Free Fire tournament participants.' },
};

export default function RulesPage() {
  const rules = [
    { num: 1, title: 'Fair Competition', desc: 'All matches are monitored. Any form of cheating or hacking results in immediate disqualification.' },
    { num: 2, title: 'Halal Tournament Structure', desc: 'Non-gambling structure. Entry fees are for slot booking. One free-entry player/team participates without prize eligibility.' },
    { num: 3, title: 'Slot Booking', desc: 'First-come, first-served. Tokens are non-refundable once a slot is booked.' },
    { num: 4, title: 'Payment & Tokens', desc: 'Payments via JazzCash/EasyPaisa. Tokens credited after admin verification (up to 24 hours).' },
    { num: 5, title: 'Match Schedule', desc: 'Players must join on time. Late arrivals may lose their slot. Room ID/password shared before match.' },
    { num: 6, title: 'Anti-Hacker Monitoring', desc: 'Management team spectates matches. Hackers will be banned from future tournaments.' },
    { num: 7, title: 'Prize Distribution', desc: 'Prizes distributed within 24 hours. Winners contacted via WhatsApp.' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold mb-2">Tournament Rules</h1>
        <p className="text-[#7777aa]">Fair play rules for all participants</p>
      </div>
      <div className="space-y-3">
        {rules.map(r => (
          <div key={r.num} className="glass glass-hover p-5 flex gap-4 items-start">
            <div className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,rgba(0,212,255,0.12),rgba(139,92,246,0.08))] text-[#00d4ff] flex items-center justify-center font-extrabold text-sm flex-shrink-0 border border-[rgba(0,212,255,0.15)]">
              {r.num}
            </div>
            <div>
              <h4 className="font-bold mb-1">{r.title}</h4>
              <p className="text-sm text-[#7777aa] leading-relaxed">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
