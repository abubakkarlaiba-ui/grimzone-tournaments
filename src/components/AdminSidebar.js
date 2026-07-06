'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/payments', label: 'Verify Payments' },
  { href: '/admin/tournaments', label: 'Tournaments' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/users', label: 'Users' },
];

export default function AdminSidebar() {
  const path = usePathname();

  return (
    <aside className="w-56 bg-[#111122] border-r border-[rgba(255,255,255,0.06)] p-6 hidden md:block fixed top-16 left-0 bottom-0 overflow-y-auto z-40">
      <div className="text-lg font-black text-white mb-6" style={{ textShadow: '0 0 16px rgba(0,212,255,0.2)' }}>
        ⚔️ Admin
      </div>
      {links.map((l) => {
        const active = path === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`block py-2.5 px-3.5 rounded-lg text-sm font-semibold transition-all mb-1 ${
              active
                ? 'bg-[rgba(0,212,255,0.08)] text-[#00d4ff]'
                : 'text-[#7777aa] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)]'
            }`}
          >
            {l.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="block py-2.5 px-3.5 rounded-lg text-sm font-semibold text-[#7777aa] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all mt-4"
      >
        ← Back to Site
      </Link>
    </aside>
  );
}
