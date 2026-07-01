import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#111122] border-t border-[rgba(255,255,255,0.06)] px-5 py-10 mt-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-[#00d4ff] font-extrabold text-lg mb-3" style={{textShadow:'0 0 12px rgba(0,212,255,0.2)'}}>⚔️ GrimZone Tournaments</h3>
          <p className="text-[#7777aa] text-sm leading-relaxed">Pakistan&apos;s premier Free Fire tournament platform. Compete, win, and dominate.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3">Quick Links</h4>
          <Link href="/tournaments" className="block text-[#7777aa] text-sm mb-1.5 hover:text-[#00d4ff] transition-colors hover:pl-1">Tournaments</Link>
          <Link href="/rules" className="block text-[#7777aa] text-sm mb-1.5 hover:text-[#00d4ff] transition-colors hover:pl-1">Rules</Link>
          <Link href="/contact" className="block text-[#7777aa] text-sm mb-1.5 hover:text-[#00d4ff] transition-colors hover:pl-1">Contact</Link>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3">Support</h4>
          <p className="text-[#7777aa] text-sm mb-1.5">WhatsApp: +92XXXXXXXXX</p>
          <p className="text-[#7777aa] text-sm mb-1.5">Email: support@grimzone.pk</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto text-center text-[#7777aa] text-xs pt-5 mt-8 border-t border-[rgba(255,255,255,0.06)]">
        &copy; {new Date().getFullYear()} GrimZone Tournaments. All rights reserved.
      </div>
    </footer>
  );
}
