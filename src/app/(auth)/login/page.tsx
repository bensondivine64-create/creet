'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/api';
import Recaptcha from '@/components/Recaptcha';
import GoogleButton from '@/components/GoogleButton';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [suspended, setSuspended] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function routeAfterAuth(user: { profile_completed: boolean; role: string }) {
    if (!user.profile_completed) {
      router.push('/create-profile');
    } else {
      router.push(`/dashboard/${user.role}`);
    }
  }

  function handleAuthError(err: unknown) {
    if (err instanceof ApiError && err.errorCode === 'account_suspended') {
      setSuspended(true);
      return;
    }
    setError(err instanceof Error ? err.message : 'Something went wrong');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ ...form, recaptcha_token: captchaToken });
      routeAfterAuth(res.user);
    } catch (err) {
      handleAuthError(err);
      setLoading(false);
    }
  }

  async function handleGoogle(credential: string) {
    setError('');
    setLoading(true);
    try {
      const res = await loginWithGoogle(credential);
      routeAfterAuth(res.user);
    } catch (err) {
      if (err instanceof ApiError && err.errorCode === 'account_suspended') {
        setSuspended(true);
        setLoading(false);
        return;
      }
      const message = err instanceof Error ? err.message : 'Something went wrong';
      if (message.toLowerCase().includes('choose an account type')) {
        router.push('/');
      } else {
        setError(message);
      }
      setLoading(false);
    }
  }

  if (suspended) {
    return (
      <div className="fixed inset-0 z-50 bg-paper flex flex-col items-center justify-center px-8 text-center">
        <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 4.5h.008M4.93 4.93l14.14 14.14M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="font-display text-xl font-bold text-fg mb-2">This account has been suspended</h1>
        <p className="text-sm text-muted max-w-xs">
          If you think this is a mistake, please contact CREET support for help.
        </p>
        <button
          onClick={() => setSuspended(false)}
          className="mt-8 text-sm text-fg underline underline-offset-2"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div>
      {loading && <LoadingOverlay label="Logging in..." />}

      <h1 className="font-display text-xl font-bold text-fg mb-1">Log in to CREET</h1>
      <p className="text-sm text-muted mb-6">Welcome back.</p>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <GoogleButton onCredential={handleGoogle} />

      <div className="flex items-center gap-3 my-5">
        <div className="h-px bg-line flex-1" />
        <span className="text-xs text-muted">or</span>
        <div className="h-px bg-line flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-fg/70 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-fg/70">Password</label>
            <Link href="/forgot-password" className="text-xs text-fg underline underline-offset-2">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
          />
        </div>

        <Recaptcha onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

        <button
          type="submit"
          disabled={loading || !captchaToken}
          className="w-full bg-blue disabled:opacity-50 active:scale-[0.98] transition-transform text-black text-sm font-semibold rounded-lg py-3"
        >
          Log in
        </button>
      </form>

      <p className="text-sm text-muted text-center mt-6">
        New here?{' '}
        <Link href="/" className="text-fg font-medium underline underline-offset-2">
          Choose an account type
        </Link>
      </p>
    </div>
  );
}
