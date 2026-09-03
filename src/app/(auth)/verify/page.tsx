'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingOverlay from '@/components/LoadingOverlay';

function VerifyForm() {
  const { verifyOtp, resendOtp } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtp({ email, code });
      if (!res.user.profile_completed) {
        router.push('/create-profile');
      } else {
        router.push('/browse');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');
    try {
      await resendOtp(email);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="animate-fade-in-up">
      {loading && <LoadingOverlay label="Verifying..." />}

      <h1 className="font-display text-xl font-bold text-fg mb-1">Check your email</h1>
      <p className="text-sm text-fg/50 mb-6">
        Enter the code we sent to <span className="text-fg">{email || 'your email'}</span>
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {resent && (
        <div className="mb-4 text-sm text-blue bg-blue/5 border border-blue/20 rounded-lg px-3 py-2">
          Code resent.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-fg/70 mb-1">Verification code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            required
            placeholder="123456"
            className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-center text-lg tracking-[0.4em] text-fg placeholder:text-fg/20 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full bg-blue hover:bg-blue-deep disabled:opacity-50 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      <p className="text-sm text-fg/50 text-center mt-6">
        Didn&apos;t get a code?{' '}
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-blue font-medium hover:underline disabled:opacity-50"
        >
          {resending ? 'Sending...' : 'Resend'}
        </button>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-sm text-fg/40">Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
