'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword({ email });
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in-up">
      {loading && <LoadingOverlay label="Sending reset code..." />}

      <h1 className="font-display text-xl font-bold text-fg mb-1">Reset your password</h1>
      <p className="text-sm text-fg/50 mb-6">
        We&apos;ll email you a code to reset your password.
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-fg/70 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-line bg-black px-3.5 py-3 text-sm text-fg placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-blue/40 focus:border-blue/50 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="ripple btn-elevated w-full bg-blue hover:bg-blue-deep disabled:opacity-50 active:scale-[0.98] text-black text-sm font-semibold rounded-xl py-3.5 transition-colors"
        >
          {loading ? 'Sending...' : 'Send reset code'}
        </button>
      </form>

      <p className="text-sm text-fg/50 text-center mt-6">
        <Link href="/login" className="text-fg font-medium underline underline-offset-2 hover:text-white">
          Back to login
        </Link>
      </p>
    </div>
  );
}
