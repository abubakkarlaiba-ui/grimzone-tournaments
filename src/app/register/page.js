'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Button from '@/components/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', freefire_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.register(form.username, form.email, form.password, form.freefire_name);
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
      <div className="glass p-8 gradient-border relative overflow-hidden">
        <h2 className="text-2xl font-extrabold mb-1">Create Account</h2>
        <p className="text-sm text-[#7777aa] mb-6">Join GrimZone and start competing.</p>
        {error && <div className="p-3 mb-4 rounded-lg text-sm font-semibold bg-[rgba(231,76,60,0.08)] border border-[rgba(231,76,60,0.15)] text-[#e74c3c]">{error}</div>}
        <form onSubmit={handleSubmit}>
          {['username','email','freefire_name','password','confirm'].map(f => (
            <div className="mb-4" key={f}>
              <label className="block text-sm font-semibold text-[#7777aa] mb-1.5 capitalize">{f === 'confirm' ? 'Confirm Password' : f === 'freefire_name' ? 'FreeFire Name' : f}</label>
              <input type={f.includes('password')||f==='confirm'?'password':f==='email'?'email':'text'} value={form[f]} onChange={e => setForm({...form,[f]:e.target.value})} className="input-field" placeholder={f === 'freefire_name' ? 'Enter your FreeFire in-game name' : `Enter ${f}`} required={f !== 'freefire_name'} />
            </div>
          ))}
          <Button type="submit" disabled={loading} className="btn-gradient w-full py-3 mt-2">
            {loading ? <span className="btn-spinner" /> : 'Create Account'}
          </Button>
        </form>
        <div className="text-center mt-4 text-sm text-[#7777aa]">
          Already have an account? <Link href="/login" className="text-[#00d4ff] font-semibold hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
}
