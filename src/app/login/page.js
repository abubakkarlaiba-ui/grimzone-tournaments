'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const submitted = useRef(false);

  useEffect(() => {
    api.init();
  }, []);

  const fieldErrors = {};
  if (touched.username && !username.trim()) fieldErrors.username = 'Username is required';
  if (touched.password && !password.trim()) fieldErrors.password = 'Password is required';

  function getError(field) {
    return fieldErrors[field] || '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitted.current) return;
    setTouched({ username: true, password: true });
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    submitted.current = true;
    setLoading(true);
    try {
      await api.login(username.trim(), password);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials and try again.');
      submitted.current = false;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto my-10 px-5">
      <div className="glass p-8 gradient-border relative overflow-hidden">
        <h2 className="text-2xl font-extrabold mb-1">Welcome Back</h2>
        <p className="text-sm text-[#7777aa] mb-6">Login to book tournaments and manage your tokens.</p>
        {error && (
          <div className="p-3 mb-4 rounded-lg text-sm font-semibold bg-[rgba(231,76,60,0.08)] border border-[rgba(231,76,60,0.15)] text-[#e74c3c]" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="login-username" className="block text-sm font-semibold text-[#7777aa] mb-1.5">Username</label>
            <input id="login-username" type="text" value={username} onChange={e => setUsername(e.target.value)} onBlur={() => setTouched(prev => ({...prev, username: true}))} className={`input-field ${getError('username') ? 'border-[#e74c3c]' : ''}`} placeholder="Enter your username" required autoComplete="username" aria-invalid={!!getError('username')} aria-describedby={getError('username') ? 'username-error' : undefined} />
            {getError('username') && <p id="username-error" className="text-xs text-[#e74c3c] mt-1">{getError('username')}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="login-password" className="block text-sm font-semibold text-[#7777aa] mb-1.5">Password</label>
            <div className="relative">
              <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onBlur={() => setTouched(prev => ({...prev, password: true}))} className={`input-field pr-10 ${getError('password') ? 'border-[#e74c3c]' : ''}`} placeholder="Enter password" required autoComplete="current-password" aria-invalid={!!getError('password')} aria-describedby={getError('password') ? 'password-error' : undefined} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5555aa] text-xs px-2 py-1 rounded hover:text-[#00d4ff] transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {getError('password') && <p id="password-error" className="text-xs text-[#e74c3c] mt-1">{getError('password')}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-gradient w-full py-3 mt-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2">
            {loading && <span className="btn-spinner" />}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center mt-4 text-sm text-[#7777aa]">
          Don&apos;t have an account? <Link href="/register" className="text-[#00d4ff] font-semibold hover:underline">Register here</Link>
        </div>
      </div>
    </div>
  );
}