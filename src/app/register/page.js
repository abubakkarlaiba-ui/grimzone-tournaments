'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.register(form.username, form.email, form.password);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto my-10 px-5">
      <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,#00d4ff,#8b5cf6,#00d4ff)]" />
        <h2 className="text-2xl font-extrabold mb-1">Create Account</h2>
        <p className="text-sm text-[#7777aa] mb-6">Join GrimZone and start competing.</p>
        {error && <div className="p-3 mb-4 rounded-lg text-sm font-semibold bg-[rgba(231,76,60,0.08)] border border-[rgba(231,76,60,0.15)] text-[#e74c3c]">{error}</div>}
        <form onSubmit={handleSubmit}>
          {['username','email','password','confirm'].map(f => (
            <div className="mb-4" key={f}>
              <label className="block text-sm font-semibold text-[#7777aa] mb-1.5 capitalize">{f === 'confirm' ? 'Confirm Password' : f}</label>
              <input type={f.includes('password')||f==='confirm'?'password':f==='email'?'email':'text'} value={form[f]} onChange={e => setForm({...form,[f]:e.target.value})} className="w-full p-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white text-sm focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_16px_rgba(0,212,255,0.1)] transition-all" placeholder={`Enter ${f}`} required />
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-bold text-white bg-[linear-gradient(135deg,#00d4ff,#8b5cf6)] shadow-[0_0_16px_rgba(0,212,255,0.2)] transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 disabled:opacity-50 mt-2">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <div className="text-center mt-4 text-sm text-[#7777aa]">
          Already have an account? <Link href="/login" className="text-[#00d4ff] font-semibold hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
}
