'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Recaptcha from '@/components/Recaptcha';
import GoogleButton from '@/components/GoogleButton';

export default function BuyerSignupPage() {
  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', username: '', email: '', password: '' });
  const [agreed, setAgreed] = useState(false);
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
      const res = await signup({ ...form, role: 'buyer', recaptcha_token: captchaToken });
      router.push(`/verify?email=${encodeURIComponent(res.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(credential: string) {
    setError('');
    try {
      const res = await loginWithGoogle(credential, 'buyer');
      router.push(`/dashboard/${res.user.role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  const canSubmit = agreed && captchaToken.length > 0;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink mb-1">Create your buyer account</h1>
      <p className="text-sm text-ink/50 mb-6">Browse, hire, and buy on CREET.</p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <GoogleButton onCredential={handleGoogle} />

      <div className="flex items-center gap-3 my-5">
        <div className="h-px bg-line flex-1" />
        <span className="text-xs text-ink/40">or</span>
        <div className="h-px bg-line flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Full name</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            minLength={3}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
          />
        </div>

        <Recaptcha onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

        <label className="flex items-start gap-2 text-sm text-ink/60">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 accent-blue"
          />
          <span>
            I agree to the{' '}
            <Link href="/terms" className="text-blue hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full bg-blue hover:bg-blue-deep disabled:opacity-50 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-ink/50 text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blue font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
