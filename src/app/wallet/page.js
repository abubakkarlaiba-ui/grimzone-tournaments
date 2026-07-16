'use client';
import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { api } from '@/lib/api';
import Button from '@/components/Button';

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const [sendUsername, setSendUsername] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendMsg, setSendMsg] = useState('');

  function fetchWallet() {
    setLoggedIn(api.isLoggedIn());
    if (api.isLoggedIn()) {
      api.getWallet().then(d => setBalance(d.tokens)).catch(() => setBalance(api.user?.tokens ?? 0));
    }
  }

  useEffect(() => {
    fetchWallet();
    const unsub = api.subscribe(fetchWallet);
    if (PUSHER_KEY && api.isLoggedIn() && api.user) {
      const pusher = new Pusher(PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2' });
      const channel = pusher.subscribe(`user-${api.user.id}`);
      channel.bind('tokens-updated', () => { fetchWallet(); });
      return () => {
        channel.unbind_all();
        pusher.unsubscribe(`user-${api.user.id}`);
        pusher.disconnect();
        unsub();
      };
    }
    return unsub;
  }, []);

  const packages = [
    { tokens: 50, price: '100 PKR', bonus: 0 },
    { tokens: 120, price: '200 PKR', bonus: 10 },
    { tokens: 300, price: '500 PKR', bonus: 30 },
    { tokens: 700, price: '1000 PKR', bonus: 100 },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (selected === null) return;
    const pkg = packages[selected];
    const form = new FormData();
    form.append('amount', pkg.price);
    form.append('tokens', String(pkg.tokens));
    form.append('screenshot', e.target.screenshot.files[0]);
    try {
      await api.submitPayment(form);
      setMsg('Payment submitted! Awaiting admin verification.');
    } catch (err) {
      setMsg('Error: ' + err.message);
    }
  }

  if (!loggedIn) return <div className="text-center py-20 text-[#7777aa]"><div className="text-4xl mb-4">🔒</div><h3 className="text-lg font-bold text-white mb-2">Please login</h3><p className="text-sm"><a href="/login" className="text-[#00d4ff] font-semibold">Login</a> to access your wallet.</p></div>;

  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <div className="bg-[linear-gradient(135deg,rgba(0,212,255,0.15),rgba(139,92,246,0.1))] rounded-xl p-8 text-center mb-8 border border-[rgba(0,212,255,0.1)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,212,255,0.1),transparent_70%)] pointer-events-none" />
        <div className="text-sm font-semibold opacity-70">Your Balance</div>
        <div className="text-4xl md:text-5xl font-black text-white mt-1" style={{textShadow:'0 0 30px rgba(0,212,255,0.3)'}}>{balance.toLocaleString()} <span className="text-[#00d4ff]">FF</span></div>
        <div className="text-sm opacity-60 mt-1">Buy more tokens to book tournament slots</div>
      </div>

      <h3 className="text-xl font-bold mb-5">Buy Tokens</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {packages.map((p, i) => (
          <div key={i} onClick={() => setSelected(i)}
            className={`glass border-2 rounded-xl p-6 text-center cursor-pointer transition-all ${selected === i ? 'border-[#00d4ff] shadow-[0_8px_32px_rgba(0,212,255,0.15)] -translate-y-1' : 'border-[rgba(255,255,255,0.06)] hover:border-[#00d4ff] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,212,255,0.1)]'}`}>
            <div className="text-2xl font-black text-white">{p.tokens}</div>
            <div className="text-lg font-bold text-[#00d4ff] mt-1">{p.price}</div>
            {p.bonus > 0 && <div className="text-xs text-[#2ecc71] mt-1.5 font-semibold">+{p.bonus} bonus</div>}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="glass p-6">
        <h4 className="font-bold mb-3">Upload Payment Screenshot</h4>
        <p className="text-xs text-[#7777aa] mb-4">Pay via JazzCash/EasyPaisa to <strong className="text-white">03XX-XXXXXXX</strong> and upload the screenshot below.</p>
        <input type="file" name="screenshot" accept="image/*" required className="w-full text-sm text-[#7777aa] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[rgba(0,212,255,0.12)] file:text-[#00d4ff] hover:file:bg-[rgba(0,212,255,0.2)] mb-4" />
        <Button type="submit" disabled={selected === null} className="btn-gradient w-full py-3">
          Submit Payment
        </Button>
        {msg && <div className="mt-4 p-3 rounded-lg text-sm font-semibold bg-[rgba(46,204,113,0.08)] border border-[rgba(46,204,113,0.15)] text-[#2ecc71]">{msg}</div>}
      </form>

      <div className="mt-12 border-t border-[rgba(255,255,255,0.06)] pt-8">
        <h3 className="text-xl font-bold mb-1">Send Coins</h3>
        <p className="text-sm text-[#7777aa] mb-4">Transfer tokens to another player instantly.</p>
        <form onSubmit={async (e) => {
          e.preventDefault();
          setSendMsg('');
          try {
            const d = await api.sendTokens(sendUsername.trim(), parseInt(sendAmount));
            setSendMsg(`Sent ${d.sent} FF to ${d.recipient}!`);
            setSendUsername('');
            setSendAmount('');
          } catch (err) {
            setSendMsg('Error: ' + err.message);
          }
        }} className="glass p-6">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input value={sendUsername} onChange={e => setSendUsername(e.target.value)} placeholder="Recipient username" required className="input-field flex-1" />
            <input value={sendAmount} onChange={e => setSendAmount(e.target.value)} type="number" min="1" placeholder="Amount" required className="input-field w-full md:w-40" />
          </div>
          <Button type="submit" className="btn-gradient w-full py-3">Send Tokens</Button>
          {sendMsg && <div className={`mt-4 p-3 rounded-lg text-sm font-semibold ${sendMsg.startsWith('Sent') ? 'bg-[rgba(46,204,113,0.08)] border border-[rgba(46,204,113,0.15)] text-[#2ecc71]' : 'bg-[rgba(255,107,107,0.08)] border border-[rgba(255,107,107,0.15)] text-[#ff6b6b]'}`}>{sendMsg}</div>}
        </form>
      </div>
    </div>
  );
}
