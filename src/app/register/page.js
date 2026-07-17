'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const fields = [
  { key: 'username', label: 'Username', type: 'text', required: true, placeholder: 'Enter username' },
  { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter email' },
  { key: 'freefire_name', label: 'FreeFire Name', type: 'text', required: false, placeholder: 'Enter your FreeFire in-game name' },
  { key: 'password', label: 'Password', type: 'password', required: true, placeholder: 'Min 6 characters' },
  { key: 'confirm', label: 'Confirm Password', type: 'password', required: true, placeholder: 'Confirm password' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', freefire_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const submitted = useRef(false);

  function getFieldErrors() {
    const errs = {};
    if (touched.username && !form.username.trim()) errs.username = 'Username is required';
    if (touched.email && !form.email.trim()) errs.email = 'Email is required';
    if (touched.email && form.email.trim() && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (touched.password && !form.password) errs.password = 'Password is required';
    if (touched.password && form.password && form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (touched.confirm && form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  }

  const fieldErrors = getFieldErrors();

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitted.current) return;
    setTouched({ username: true, email: true, password: true, confirm: true });
    setError('');
    const errs = getFieldErrors();
    if (Object.keys(errs).length > 0) {
      setError(errs.password || errs.confirm || 'Please fix the errors below');
      return;
    }
    submitted.current = true;
    setLoading(true);
    try {
      await api.register(form.username, form.email, form.password, form.freefire_name);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Registration failed');
      submitted.current = false;
    } finally {
      setLoading(false);
    }
  }

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div className="max-w-md mx-auto my-10 px-5">
      <div className="glass p-8 gradient-border relative overflow-hidden">
        <h2 className="text-2xl font-extrabold mb-1">Create Account</h2>
        <p className="text-sm text-[#7777aa] mb-6">Join GrimZone and start competing.</p>
        {error && <div className="p-3 mb-4 rounded-lg text-sm font-semibold bg-[rgba(231,76,60,0.08)] border border-[rgba(231,76,60,0.15)] text-[#e74c3c]" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          {fields.map(f => {
            const err = fieldErrors[f.key];
            return (
              <div className="mb-4" key={f.key}>
                <label htmlFor={`reg-${f.key}`} className="block text-sm font-semibold text-[#7777aa] mb-1.5 capitalize">{f.label}</label>
                <input id={`reg-${f.key}`} type={f.type} value={form[f.key]} onChange={e => update(f.key, e.target.value)} onBlur={() => setTouched(prev => ({...prev, [f.key]: true}))} className={`input-field ${err ? 'border-[#e74c3c]' : ''}`} placeholder={f.placeholder} required={f.required} autoComplete={f.key === 'password' ? 'new-password' : f.key === 'email' ? 'email' : f.key === 'username' ? 'username' : 'off'} aria-invalid={!!err} aria-describedby={err ? `${f.key}-error` : undefined} />
                {err && <p id={`${f.key}-error`} className="text-xs text-[#e74c3c] mt-1">{err}</p>}
              </div>
            );
          })}
          <button type="submit" disabled={loading} className="btn-gradient w-full py-3 mt-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2">
            {loading && <span className="btn-spinner" />}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="text-center mt-4 text-sm text-[#7777aa]">
          Already have an account? <Link href="/login" className="text-[#00d4ff] font-semibold hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
}
