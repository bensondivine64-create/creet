'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import BottomNav from '@/components/BottomNav';
import VerifiedBadge from '@/components/VerifiedBadge';

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  );
}

export default function ProfilePage() {
  const { user, loading } = useRequireAnyAuth();
  const { logout } = useAuth();

  if (loading || !user) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-paper pb-24 animate-fade-in-up">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <Link href="/browse" className="text-sm text-muted hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-fg">Profile</span>
        <button onClick={logout} className="text-xs text-muted hover:text-blue transition-colors">
          Log out
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center gap-4 bg-mist border border-line rounded-2xl p-4 shadow-lg shadow-black/20 opacity-0 animate-fade-in-up">
          <span className="h-16 w-16 rounded-full bg-blue text-white text-xl font-bold flex items-center justify-center shrink-0">
            {user.full_name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-lg font-bold text-fg truncate">{user.full_name}</h1>
              {user.is_verified && <VerifiedBadge size={16} />}
            </div>
            <div className="text-sm text-muted truncate">@{user.username}</div>
            <div className="text-xs text-muted capitalize mt-0.5">{user.role}</div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {/* rows below stagger in via inline delay */}
          <Link
            href="/profile/edit"
            style={{ animationDelay: "70ms" }} className="opacity-0 animate-fade-in-up flex items-center justify-between bg-mist border border-line rounded-xl px-4 py-3.5 active:scale-[0.98] transition-transform"
          >
            <span className="font-semibold text-fg text-sm">Edit profile</span>
            <span className="text-muted"><Chevron /></span>
          </Link>

          {user.is_admin && (
            <Link
              href="/admin"
              style={{ animationDelay: "140ms" }} className="opacity-0 animate-fade-in-up flex items-center justify-between bg-mist border border-line rounded-xl px-4 py-3.5 active:scale-[0.98] transition-transform"
            >
              <span className="font-semibold text-fg text-sm">Admin System</span>
              <span className="text-muted"><Chevron /></span>
            </Link>
          )}

          {!user.is_verified && (
            <Link
              href="/verify-identity"
              style={{ animationDelay: "210ms" }} className="opacity-0 animate-fade-in-up flex items-center justify-between bg-mist border border-line rounded-xl px-4 py-3.5 active:scale-[0.98] transition-transform"
            >
              <div>
                <div className="font-semibold text-fg text-sm">Get Verified</div>
                <div className="text-xs text-muted mt-0.5">
                  Show buyers and sellers you&apos;re trustworthy.
                </div>
              </div>
              <span className="text-blue shrink-0 ml-2"><Chevron /></span>
            </Link>
          )}

          {!user.is_premium && (
            <Link
              href="/premium"
              style={{ animationDelay: "280ms" }} className="opacity-0 animate-fade-in-up flex items-center justify-between rounded-xl px-4 py-3.5 bg-blue shadow-lg shadow-blue/20 active:scale-[0.98] transition-transform"
            >
              <div>
                <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                  Get Premium
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFD84D">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div className="text-xs text-white/70 mt-0.5">
                  Stand out with priority placement and a premium badge.
                </div>
              </div>
              <span className="text-white shrink-0 ml-2"><Chevron /></span>
            </Link>
          )}

          {user.is_verified && user.is_premium && (
            <p className="text-sm text-muted text-center py-4">
              You&apos;re verified and on Premium. 🎉
            </p>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
