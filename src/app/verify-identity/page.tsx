'use client';

import Link from 'next/link';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    </svg>
  );
}

export default function VerifyIdentityPage() {
  const { user, loading } = useRequireAnyAuth();

  if (loading || !user) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line/60 safe-top">
        <Link href="/settings" className="text-sm text-fg/50 hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-fg">Verification</span>
        <span className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="h-14 w-14 rounded-full bg-blue/15 text-blue flex items-center justify-center mb-6">
          <ShieldIcon />
        </div>

        {user.is_premium ? (
          <>
            <h1 className="font-display text-2xl font-bold text-fg mb-2">You&apos;re already verified</h1>
            <p className="text-sm text-fg/60 leading-relaxed mb-8">
              Your Premium subscription includes the verified badge, shown next to your name across CREET.
            </p>
            <Link
              href="/profile"
              className="block text-center w-full border border-line text-fg text-sm font-semibold rounded-lg py-3.5"
            >
              View your profile
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-fg mb-2">
              Verification comes with Premium
            </h1>
            <p className="text-sm text-fg/60 leading-relaxed mb-8">
              CREET doesn&apos;t have a separate identity-verification step — the verified badge is included
              automatically with a Premium subscription, along with priority placement and other perks.
            </p>
            <Link
              href="/premium"
              className="block text-center w-full bg-blue text-black text-sm font-semibold rounded-lg py-3.5"
            >
              See Premium plans
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
