'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Button from '@/components/Button';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await api.login(username, password);
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
        <h2 className="text-2xl font-extrabold mb-1">Welcome Back</h2>
        <p className="text-sm text-[#7777aa] mb-6">Login to book tournaments and manage your tokens.</p>
        {error && <div className="p-3 mb-4 rounded-lg text-sm font-semibold bg-[rgba(231,76,60,0.08)] border border-[rgba(231,76,60,0.15)] text-[#e74c3c]">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#7777aa] mb-1.5">Username or Email</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="input-field" placeholder="Enter username or email" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#7777aa] mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Enter password" required />
          </div>
          <Button type="submit" disabled={loading} className="btn-gradient w-full py-3 mt-2">
            {loading ? <span className="btn-spinner" /> : 'Login'}
          </Button>
        </form>
        <div className="text-center mt-4 text-sm text-[#7777aa]">
          Don&apos;t have an account? <Link href="/register" className="text-[#00d4ff] font-semibold hover:underline">Register here</Link>
        </div>
      </div>
    </div>
  );
}
