'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setLoggedIn(api.isLoggedIn());
    setUser(api.user);
    if (api.isLoggedIn()) {
      const tokens = api.user?.tokens ?? 0;
      setBalance(tokens);
      api.getWallet().then(d => { setBalance(d.tokens); }).catch(() => {});
    }
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-[rgba(10,10,15,0.95)] backdrop-blur-md border-b border-[rgba(255,255,255,0.06)]">
      <div className="max-w-6xl mx-auto px-5 flex items-center h-16">
        <Link href="/" className="text-white font-black text-xl flex items-center gap-2.5" style={{textShadow:'0 0 20px rgba(0,212,255,0.3)'}}>
          <span className="text-xl">⚔️</span> GrimZone Tournaments
        </Link>

        <div className="hidden md:flex items-center gap-1 ml-auto">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/tournaments">Tournaments</NavLink>
          <NavLink href="/rules">Rules</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </div>

        {loggedIn && balance !== null && (
          <div className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(0,212,255,0.25)] bg-[linear-gradient(135deg,rgba(0,212,255,0.12),rgba(139,92,246,0.08))] text-[#00d4ff] font-extrabold text-sm mr-2.5 shadow-[0_0_20px_rgba(0,212,255,0.12)]">
            <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-[linear-gradient(135deg,#ffd700,#ffaa00)] text-[#8b4513] text-[0.6rem] font-black shadow-[inset_0_-2px_3px_rgba(0,0,0,0.2),0_0_8px_rgba(255,215,0,0.5)] flex-shrink-0" style={{width:'22px',height:'22px',fontSize:'0.6rem'}}>FF</span>
            {balance.toLocaleString()}
          </div>
        )}

        <div className="hidden md:flex items-center gap-1">
          {loggedIn ? (
            <>
              <Link href="/wallet" className="text-[#7777aa] hover:text-[#00d4ff] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)]">Wallet</Link>
              <Link href="/booking" className="text-[#7777aa] hover:text-[#00d4ff] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)]">Book Slot</Link>
              {user?.role === 'admin' && <Link href="/admin" className="text-[#8b5cf6] hover:text-[#00d4ff] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)]">Admin</Link>}
              <button onClick={() => api.logout()} className="text-white bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(255,255,255,0.1)]">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(255,255,255,0.1)]">Login</Link>
              <Link href="/register" className="bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] text-white px-3.5 py-2 rounded-lg text-sm font-semibold shadow-[0_0_16px_rgba(0,212,255,0.2)] transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:-translate-y-0.5">Register</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden ml-auto bg-none border-none text-white text-2xl cursor-pointer">
          {open ? <>&times;</> : <>&#9776;</>}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[rgba(10,10,15,0.98)] flex flex-col p-4 border-b border-[rgba(255,255,255,0.06)]">
          <MobileNav href="/" onClick={() => setOpen(false)}>Home</MobileNav>
          <MobileNav href="/tournaments" onClick={() => setOpen(false)}>Tournaments</MobileNav>
          <MobileNav href="/rules" onClick={() => setOpen(false)}>Rules</MobileNav>
          <MobileNav href="/contact" onClick={() => setOpen(false)}>Contact</MobileNav>
          {loggedIn && balance !== null && (
            <div className="flex items-center justify-center gap-2 py-3 text-[#00d4ff] font-extrabold">
              <span className="w-5.5 h-5.5 rounded-full bg-[linear-gradient(135deg,#ffd700,#ffaa00)] text-[#8b4513] text-[0.6rem] font-black flex items-center justify-center flex-shrink-0" style={{width:'22px',height:'22px',fontSize:'0.6rem'}}>FF</span>
              {balance.toLocaleString()}
            </div>
          )}
          {loggedIn ? (
            <>
              <MobileNav href="/wallet" onClick={() => setOpen(false)}>Wallet</MobileNav>
              <MobileNav href="/booking" onClick={() => setOpen(false)}>Book Slot</MobileNav>
              <button onClick={() => { api.logout(); }} className="w-full text-center py-2.5 rounded-lg text-white bg-[rgba(255,255,255,0.06)] font-semibold">Logout</button>
            </>
          ) : (
            <>
              <MobileNav href="/login" onClick={() => setOpen(false)}>Login</MobileNav>
              <Link href="/register" onClick={() => setOpen(false)} className="w-full text-center py-2.5 rounded-lg bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] text-white font-bold">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }) {
  return (
    <Link href={href} className="text-[#7777aa] hover:text-[#00d4ff] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)]">
      {children}
    </Link>
  );
}

function MobileNav({ href, onClick, children }) {
  return (
    <Link href={href} onClick={onClick} className="w-full text-center py-2.5 rounded-lg text-[#7777aa] hover:text-[#00d4ff] font-semibold hover:bg-[rgba(0,212,255,0.06)] transition-all">
      {children}
    </Link>
  );
}
