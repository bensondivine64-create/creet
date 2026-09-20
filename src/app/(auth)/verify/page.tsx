'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingOverlay from '@/components/LoadingOverlay';
import OtpInput from '@/components/OtpInput';

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

  async function submitCode(fullCode: string) {
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtp({ email, code: fullCode });
      if (!res.user.profile_completed) {
        router.push('/create-profile');
      } else {
        router.push('/browse');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code');
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length === 6) submitCode(code);
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
        <div className="mb-4 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          Code resent.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-fg/70 mb-2.5">Verification code</label>
          <OtpInput onChange={setCode} onComplete={submitCode} disabled={loading} />
        </div>

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="ripple btn-elevated w-full bg-blue hover:bg-blue-deep disabled:opacity-50 active:scale-[0.98] text-black text-sm font-semibold rounded-xl py-3.5 transition-colors"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      <p className="text-sm text-fg/50 text-center mt-6">
        Didn&apos;t get a code?{' '}
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-fg font-medium underline underline-offset-2 hover:text-white disabled:opacity-50"
        >
          {resending ? 'Sending...' : 'Resend'}
        </button>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-5 w-40 bg-line/20 rounded" /><div className="h-3 w-56 bg-line/20 rounded" /><div className="h-12 w-full bg-line/20 rounded-lg mt-6" /></div>}>
      <VerifyForm />
    </Suspense>
  );
}
