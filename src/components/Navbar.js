'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Button from '@/components/Button';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loggedIn, setLoggedIn] = useState(api.isLoggedIn());
  const [user, setUser] = useState(api.user);

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

  return (
    <nav className="sticky top-0 z-50 bg-[rgba(10,10,15,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]">
      <div className="max-w-6xl mx-auto px-5 flex items-center h-16">
        <Link href="/" className="text-white font-black text-xl flex items-center gap-2.5" style={{textShadow:'0 0 20px rgba(0,212,255,0.3)'}}>
          <span className="text-xl">⚔️</span> GrimZone Tournaments
        </Link>

        <div className="hidden md:flex items-center gap-1 ml-auto mr-2">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/tournaments">Tournaments</NavLink>
          <NavLink href="/rules">Rules</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </div>

        {loggedIn && (
          <div className="hidden md:flex items-center gap-2 mr-2.5">
            <span className="text-xs text-[#5555aa] font-semibold bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-2.5 py-1 rounded-lg">#{user?.id}</span>
            {balance !== null && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(0,212,255,0.25)] bg-[linear-gradient(135deg,rgba(0,212,255,0.12),rgba(139,92,246,0.08))] text-[#00d4ff] font-extrabold text-sm shadow-[0_0_20px_rgba(0,212,255,0.12)]">
                <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-[linear-gradient(135deg,#ffd700,#ffaa00)] text-[#8b4513] text-[0.6rem] font-black shadow-[inset_0_-2px_3px_rgba(0,0,0,0.2),0_0_8px_rgba(255,215,0,0.5)] flex-shrink-0" style={{width:'22px',height:'22px',fontSize:'0.6rem'}}>FF</span>
                {balance.toLocaleString()}
              </div>
            )}
          </div>
        )}

        <div className="hidden md:flex items-center gap-1">
          {loggedIn ? (
            <>
              <Link href="/account" className="text-[#7777aa] hover:text-[#00d4ff] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)]">My Account</Link>
              <Link href="/wallet" className="text-[#7777aa] hover:text-[#00d4ff] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)]">Wallet</Link>
              <Link href="/teams" className="text-[#8b5cf6] hover:text-[#00d4ff] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)]">Teams</Link>
              <Link href="/booking" className="text-[#7777aa] hover:text-[#00d4ff] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)]">Book Slot</Link>
              {user?.role === 'owner' && <Link href="/owner" className="text-[#ffd700] hover:text-[#00d4ff] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(255,215,0,0.06)]">👑 Owner</Link>}
              {user?.role === 'admin' && <Link href="/admin" className="text-[#8b5cf6] hover:text-[#00d4ff] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(0,212,255,0.06)]">Admin</Link>}
              <Button onClick={() => api.logout()} className="text-white bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(255,255,255,0.1)] active:scale-95">Logout</Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(255,255,255,0.1)] active:scale-95">Login</Link>
              <Link href="/register" className="bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] text-white px-3.5 py-2 rounded-lg text-sm font-semibold shadow-[0_0_16px_rgba(0,212,255,0.2)] transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 active:scale-95">Register</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden ml-auto bg-none border-none text-white text-2xl cursor-pointer active:scale-90">
          {open ? <>&times;</> : <>&#9776;</>}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[rgba(10,10,15,0.98)] flex flex-col p-4 border-b border-[rgba(255,255,255,0.06)]">
          <MobileNav href="/" onClick={() => setOpen(false)}>Home</MobileNav>
          <MobileNav href="/tournaments" onClick={() => setOpen(false)}>Tournaments</MobileNav>
          <MobileNav href="/rules" onClick={() => setOpen(false)}>Rules</MobileNav>
          <MobileNav href="/contact" onClick={() => setOpen(false)}>Contact</MobileNav>
          {loggedIn && (
            <div className="flex flex-col items-center gap-1 py-3">
              <span className="text-xs text-[#5555aa] font-semibold">ID: #{user?.id}</span>
              {balance !== null && (
                <div className="flex items-center justify-center gap-2 text-[#00d4ff] font-extrabold">
                  <span className="w-5.5 h-5.5 rounded-full bg-[linear-gradient(135deg,#ffd700,#ffaa00)] text-[#8b4513] text-[0.6rem] font-black flex items-center justify-center flex-shrink-0" style={{width:'22px',height:'22px',fontSize:'0.6rem'}}>FF</span>
                  {balance.toLocaleString()}
                </div>
              )}
            </div>
          )}
          {loggedIn ? (
            <>
              <MobileNav href="/account" onClick={() => setOpen(false)}>My Account</MobileNav>
              <MobileNav href="/wallet" onClick={() => setOpen(false)}>Wallet</MobileNav>
              <MobileNav href="/teams" onClick={() => setOpen(false)} className="text-[#8b5cf6]">Teams</MobileNav>
              <MobileNav href="/booking" onClick={() => setOpen(false)}>Book Slot</MobileNav>
              {user?.role === 'owner' && <MobileNav href="/owner" onClick={() => setOpen(false)} className="text-[#ffd700]">👑 Owner</MobileNav>}
              {user?.role === 'admin' && <MobileNav href="/admin" onClick={() => setOpen(false)} className="text-[#8b5cf6]">Admin</MobileNav>}
              <Button onClick={() => { api.logout(); }} className="w-full text-center py-2.5 rounded-lg text-white bg-[rgba(255,255,255,0.06)] font-semibold active:scale-95">Logout</Button>
            </>
          ) : (
            <>
              <MobileNav href="/login" onClick={() => setOpen(false)}>Login</MobileNav>
              <Link href="/register" onClick={() => setOpen(false)} className="w-full text-center py-2.5 rounded-lg bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] text-white font-bold active:scale-95">Register</Link>
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

function MobileNav({ href, onClick, className, children }) {
  return (
    <Link href={href} onClick={onClick} className={`w-full text-center py-2.5 rounded-lg text-[#7777aa] hover:text-[#00d4ff] font-semibold hover:bg-[rgba(0,212,255,0.06)] transition-all ${className || ''}`}>
      {children}
    </Link>
  );
}
