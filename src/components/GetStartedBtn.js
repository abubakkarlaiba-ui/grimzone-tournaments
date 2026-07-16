'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function GetStartedBtn() {
  const [href, setHref] = useState('/register');

  useEffect(() => {
    api.init();
    if (api.isLoggedIn()) {
      setHref('/tournaments');
    }
  }, []);

  return (
    <Link href={href} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-bold text-white bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] backdrop-blur-sm transition-all hover:border-[#00d4ff] hover:text-[#00d4ff] hover:shadow-[0_0_30px_rgba(0,212,255,0.15)] hover:-translate-y-1 active:scale-95">
      Get Started
    </Link>
  );
}