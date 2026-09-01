'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';

export default function ProfilePage() {
  const { user, loading } = useRequireAnyAuth();
  const { logout } = useAuth();

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-ink/40 text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-paper pb-10">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <Link href="/browse" className="text-sm text-ink/50 hover:text-ink transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-ink">Profile</span>
        <button onClick={logout} className="text-xs text-ink/50 hover:text-blue transition-colors">
          Log out
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center gap-4">
          <span className="h-16 w-16 rounded-full bg-ink text-white text-xl font-bold flex items-center justify-center shrink-0">
            {user.full_name.charAt(0).toUpperCase()}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-xl font-bold text-ink">{user.full_name}</h1>
              {user.is_verified && (
                <span className="text-blue text-sm" title="Verified">✓</span>
              )}
            </div>
            <div className="text-sm text-ink/50">@{user.username}</div>
            <div className="text-xs text-ink/40 capitalize mt-0.5">{user.role}</div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {!user.is_verified && (
            <Link
              href="/verify-identity"
              className="flex items-center justify-between border border-line rounded-xl px-4 py-3.5 hover:border-ink transition-colors"
            >
              <div>
                <div className="font-semibold text-ink text-sm">Get Verified</div>
                <div className="text-xs text-ink/50 mt-0.5">
                  Show buyers and sellers you&apos;re trustworthy.
                </div>
              </div>
              <span className="text-blue text-sm">→</span>
            </Link>
          )}

          {!user.is_premium && (
            <Link
              href="/premium"
              className="flex items-center justify-between rounded-xl px-4 py-3.5 bg-ink hover:bg-ink/85 transition-colors"
            >
              <div>
                <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                  Get Premium <span className="text-yellow-400">★</span>
                </div>
                <div className="text-xs text-white/60 mt-0.5">
                  Stand out with priority placement and a premium badge.
                </div>
              </div>
              <span className="text-white text-sm">→</span>
            </Link>
          )}

          {user.is_verified && user.is_premium && (
            <p className="text-sm text-ink/40 text-center py-4">
              You&apos;re verified and on Premium. 🎉
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
