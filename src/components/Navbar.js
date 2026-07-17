'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/Button';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loggedIn, setLoggedIn] = useState(api.isLoggedIn());
  const [user, setUser] = useState(api.user);
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.toggle('scroll-lock', open);
    return () => document.body.classList.remove('scroll-lock');
  }, [open]);

  function refresh() {
    setLoggedIn(api.isLoggedIn());
    if (api.isLoggedIn()) {
      api.getUserStats().then(d => {
        api.user = d;
        localStorage.setItem('gz_user', JSON.stringify(d));
        setUser(d);
        setBalance(d.tokens);
      }).catch(() => {
        setUser(api.user);
        const tokens = api.user?.tokens ?? 0;
        setBalance(tokens);
      });
    } else {
      setUser(null);
      setBalance(null);
    }
  }

  useEffect(() => {
    refresh();
    return api.subscribe(refresh);
  }, []);

  function closeMenu() { setOpen(false); }

  return (
    <nav className="sticky top-0 z-50 bg-[rgba(10,10,15,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]" role="navigation" aria-label="Main navigation">
      <div className="max-w-6xl mx-auto px-5 flex items-center h-16">
        <Link href="/" className="text-white font-black text-xl flex items-center gap-2.5 shrink-0" style={{textShadow:'0 0 20px rgba(0,212,255,0.3)'}} aria-label="GrimZone Home">
          <span className="text-xl" aria-hidden="true">⚔️</span> GrimZone
        </Link>

        <div className="hidden md:flex items-center gap-1 ml-5">
          <NavLink href="/" active={pathname === '/'}>Home</NavLink>
          <NavLink href="/tournaments" active={pathname.startsWith('/tournaments')}>Tournaments</NavLink>
          <NavLink href="/world-chat" active={pathname.startsWith('/world-chat')}>World Chat</NavLink>
          <NavLink href="/rules" active={pathname.startsWith('/rules')}>Rules</NavLink>
          <NavLink href="/contact" active={pathname.startsWith('/contact')}>Contact</NavLink>
        </div>

        {loggedIn && (
          <div className="hidden md:flex items-center gap-2 ml-auto mr-2">
            <span className="text-xs text-[#5555aa] font-semibold bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-2.5 py-1 rounded-lg" aria-label={`User ID ${user?.id}`}>#{user?.id}</span>
            {balance !== null && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(0,212,255,0.25)] bg-[linear-gradient(135deg,rgba(0,212,255,0.12),rgba(139,92,246,0.08))] text-[#00d4ff] font-extrabold text-sm shadow-[0_0_20px_rgba(0,212,255,0.12)]" aria-label={`Balance: ${balance.toLocaleString()} Free Fire tokens`}>
                <span className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffd700,#ffaa00)] text-[#8b4513] text-[0.6rem] font-black shadow-[inset_0_-2px_3px_rgba(0,0,0,0.2),0_0_8px_rgba(255,215,0,0.5)] flex-shrink-0" style={{width:'22px',height:'22px'}} aria-hidden="true">FF</span>
                {balance.toLocaleString()}
              </div>
            )}
          </div>
        )}

        <div className="hidden md:flex items-center gap-1 shrink-0">
          {loggedIn ? (
            <>
              <Link href="/account" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)] ${pathname.startsWith('/account') ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.06)]' : 'text-[#7777aa] hover:text-[#00d4ff]'}`}>My Account</Link>
              <Link href="/wallet" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)] ${pathname.startsWith('/wallet') ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.06)]' : 'text-[#7777aa] hover:text-[#00d4ff]'}`}>Wallet</Link>
              <Link href="/host" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)] ${pathname.startsWith('/host') ? 'text-[#2ecc71] bg-[rgba(46,204,113,0.06)]' : 'text-[#2ecc71] hover:text-[#00d4ff]'}`}>Host</Link>
              <Link href="/teams" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)] ${pathname.startsWith('/teams') ? 'text-[#8b5cf6] bg-[rgba(139,92,246,0.06)]' : 'text-[#8b5cf6] hover:text-[#00d4ff]'}`}>Teams</Link>
              <Link href="/booking" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)] ${pathname.startsWith('/booking') ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.06)]' : 'text-[#7777aa] hover:text-[#00d4ff]'}`}>Book Slot</Link>
              {user?.role === 'owner' && <Link href="/owner" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${pathname.startsWith('/owner') ? 'text-[#ffd700] bg-[rgba(255,215,0,0.06)]' : 'text-[#ffd700] hover:text-[#00d4ff] hover:bg-[rgba(255,215,0,0.06)]'}`}>👑 Owner</Link>}
              {user?.role === 'admin' && <Link href="/admin" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)] ${pathname.startsWith('/admin') ? 'text-[#8b5cf6] bg-[rgba(139,92,246,0.06)]' : 'text-[#8b5cf6] hover:text-[#00d4ff]'}`}>Admin</Link>}
              <Button onClick={() => api.logout()} className="text-white bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(255,255,255,0.1)] active:scale-95">Logout</Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(255,255,255,0.1)] active:scale-95">Login</Link>
              <Link href="/register" className="bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] text-white px-3.5 py-2 rounded-lg text-sm font-semibold shadow-[0_0_16px_rgba(0,212,255,0.2)] transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 active:scale-95">Register</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden ml-auto bg-none border-none text-white text-2xl cursor-pointer active:scale-90 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)]" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open}>
          {open ? <>&times;</> : <>&#9776;</>}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[rgba(10,10,15,0.98)] flex flex-col p-4 border-b border-[rgba(255,255,255,0.06)]" role="menu">
          <MobileNav href="/" onClick={closeMenu} active={pathname === '/'}>Home</MobileNav>
          <MobileNav href="/tournaments" onClick={closeMenu} active={pathname.startsWith('/tournaments')}>Tournaments</MobileNav>
          <MobileNav href="/world-chat" onClick={closeMenu} active={pathname.startsWith('/world-chat')}>World Chat</MobileNav>
          <MobileNav href="/rules" onClick={closeMenu} active={pathname.startsWith('/rules')}>Rules</MobileNav>
          <MobileNav href="/contact" onClick={closeMenu} active={pathname.startsWith('/contact')}>Contact</MobileNav>
          {loggedIn && (
            <div className="flex flex-col items-center gap-1 py-3">
              <span className="text-xs text-[#5555aa] font-semibold">ID: #{user?.id}</span>
              {balance !== null && (
                <div className="flex items-center justify-center gap-2 text-[#00d4ff] font-extrabold">
                  <span className="w-5.5 h-5.5 rounded-full bg-[linear-gradient(135deg,#ffd700,#ffaa00)] text-[#8b4513] text-[0.6rem] font-black flex items-center justify-center flex-shrink-0" style={{width:'22px',height:'22px',fontSize:'0.6rem'}} aria-hidden="true">FF</span>
                  {balance.toLocaleString()}
                </div>
              )}
            </div>
          )}
          {loggedIn ? (
            <>
              <MobileNav href="/account" onClick={closeMenu} active={pathname.startsWith('/account')}>My Account</MobileNav>
              <MobileNav href="/wallet" onClick={closeMenu} active={pathname.startsWith('/wallet')}>Wallet</MobileNav>
              <MobileNav href="/host" onClick={closeMenu} active={pathname.startsWith('/host')} className="text-[#2ecc71]">Host</MobileNav>
              <MobileNav href="/teams" onClick={closeMenu} active={pathname.startsWith('/teams')} className="text-[#8b5cf6]">Teams</MobileNav>
              <MobileNav href="/booking" onClick={closeMenu} active={pathname.startsWith('/booking')}>Book Slot</MobileNav>
              {user?.role === 'owner' && <MobileNav href="/owner" onClick={closeMenu} active={pathname.startsWith('/owner')} className="text-[#ffd700]">👑 Owner</MobileNav>}
              {user?.role === 'admin' && <MobileNav href="/admin" onClick={closeMenu} active={pathname.startsWith('/admin')} className="text-[#8b5cf6]">Admin</MobileNav>}
              <Button onClick={() => { api.logout(); }} className="w-full text-center py-2.5 rounded-lg text-white bg-[rgba(255,255,255,0.06)] font-semibold active:scale-95">Logout</Button>
            </>
          ) : (
            <>
              <MobileNav href="/login" onClick={closeMenu} active={pathname.startsWith('/login')}>Login</MobileNav>
              <Link href="/register" onClick={closeMenu} className="w-full text-center py-2.5 rounded-lg bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] text-white font-bold active:scale-95">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${active ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.06)]' : 'text-[#7777aa] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.06)]'}`}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

function MobileNav({ href, onClick, active, className, children }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`w-full text-center py-2.5 rounded-lg font-semibold transition-all ${active ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.08)]' : 'text-[#7777aa] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.06)]'} ${className || ''}`}
      role="menuitem"
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}
