'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') || '';

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword({ email, code, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-ink mb-1">Password updated</h1>
        <p className="text-sm text-ink/50">Taking you to login...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink mb-1">Set a new password</h1>
      <p className="text-sm text-ink/50 mb-6">
        Enter the code sent to <span className="text-ink">{email || 'your email'}</span>
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Reset code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            required
            placeholder="123456"
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-center text-lg tracking-[0.4em] text-ink placeholder:text-ink/20 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full bg-blue hover:bg-blue-deep disabled:opacity-50 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
        >
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>

      <p className="text-sm text-ink/50 text-center mt-6">
        <Link href="/login" className="text-blue font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-sm text-ink/40">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
