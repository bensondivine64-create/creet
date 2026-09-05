'use client';

import Link from 'next/link';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import BottomNav from '@/components/BottomNav';
import VerifiedBadge from '@/components/VerifiedBadge';
import Avatar from '@/components/Avatar';

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function ProfilePage() {
  const { user, loading } = useRequireAnyAuth();

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
        <Link href="/settings" className="text-muted hover:text-fg transition-colors">
          <GearIcon />
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6">
        <Link
          href={`/u/${user.username}`}
          className="flex items-center gap-4 bg-mist border border-line rounded-2xl p-4 shadow-lg shadow-black/20 active:scale-[0.98] transition-transform"
        >
          <Avatar avatar={user.avatar} name={user.full_name} size={64} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-lg font-bold text-fg truncate">{user.full_name}</h1>
              {user.is_verified && <VerifiedBadge size={16} />}
            </div>
            <div className="text-sm text-muted truncate">@{user.username}</div>
            <div className="text-xs text-muted capitalize mt-0.5">{user.role}</div>
          </div>
        </Link>
        <p className="text-xs text-muted text-center mt-2">Tap to view how others see your profile</p>

        {user.bio && (
          <div className="mt-4 bg-mist border border-line rounded-2xl p-4">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">About</h2>
            <p className="text-sm text-fg leading-relaxed whitespace-pre-wrap">{user.bio}</p>
          </div>
        )}

        {user.location && (
          <p className="text-sm text-muted text-center mt-4">📍 {user.location}</p>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
