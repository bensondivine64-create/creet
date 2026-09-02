'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Recaptcha from '@/components/Recaptcha';
import GoogleButton from '@/components/GoogleButton';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ ...form, recaptcha_token: captchaToken });
      router.push(`/dashboard/${res.user.role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(credential: string) {
    setError('');
    try {
      const res = await loginWithGoogle(credential);
      router.push(`/dashboard/${res.user.role}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      if (message.toLowerCase().includes('choose an account type')) {
        router.push('/');
      } else {
        setError(message);
      }
    }
  }

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-fg mb-1">Log in to CREET</h1>
      <p className="text-sm text-fg/50 mb-6">Welcome back.</p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <GoogleButton onCredential={handleGoogle} />

      <div className="flex items-center gap-3 my-5">
        <div className="h-px bg-line flex-1" />
        <span className="text-xs text-fg/40">or</span>
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
            className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg placeholder:text-fg/30 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-fg/70">Password</label>
            <Link href="/forgot-password" className="text-xs text-blue hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg placeholder:text-fg/30 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
          />
        </div>

        <Recaptcha onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

        <button
          type="submit"
          disabled={loading || !captchaToken}
          className="w-full bg-blue hover:bg-blue-deep disabled:opacity-50 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-fg/50 text-center mt-6">
        New here?{' '}
        <Link href="/" className="text-blue font-medium hover:underline">
          Choose an account type
        </Link>
      </p>
    </div>
  );
}
