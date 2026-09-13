'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { useAuth } from '@/contexts/AuthContext';
import { getMyConnections } from '@/lib/connections';
import { uploadAvatar, uploadCoverPhoto } from '@/lib/profile';
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

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h3l2-3h6l2 3h3v11H4V8z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  );
}

function buildHeadline(role: string, categories: string[], location?: string | null) {
  const parts = [role.charAt(0).toUpperCase() + role.slice(1)];
  if (categories.length > 0) parts.push(categories[0]);
  if (location) parts.push(location);
  return parts.join(' · ');
}

export default function ProfilePage() {
  const { user, loading } = useRequireAnyAuth();
  const { refreshUser } = useAuth();
  const [connectionCount, setConnectionCount] = useState<number | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    getMyConnections()
      .then((res) => setConnectionCount(res.connections.length))
      .catch(() => {});
  }, [user]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      await refreshUser();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Could not upload photo');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploadingCover(true);
    try {
      await uploadCoverPhoto(file);
      await refreshUser();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Could not upload photo');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  }

  if (loading || !user) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  const headline = buildHeadline(user.role, user.categories || [], user.location);

  return (
    <main className="min-h-screen bg-paper pb-24 animate-fade-in-up">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line relative z-10 bg-paper">
        <Link href="/browse" className="text-sm text-muted hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-fg">Profile</span>
        <Link href="/settings" className="text-muted hover:text-fg transition-colors">
          <GearIcon />
        </Link>
      </div>

      <div className="relative">
        <div className="h-36 bg-mist relative overflow-hidden">
          {user.cover_photo && (
            <img src={user.cover_photo} alt="" className="w-full h-full object-cover" />
          )}
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-blue flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
            aria-label="Change cover photo"
          >
            <CameraIcon />
          </button>
          <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverChange} />
        </div>

        <div className="max-w-2xl mx-auto px-5">
          <div className="relative -mt-10 flex items-end justify-between">
            <div className="relative">
              <div className="rounded-full ring-4 ring-paper">
                <Avatar avatar={user.avatar} name={user.full_name} size={80} />
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-blue flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                aria-label="Change profile photo"
              >
                <CameraIcon />
              </button>
              <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>

          {uploadError && <p className="text-xs text-red-400 mt-2">{uploadError}</p>}

          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-xl font-bold text-fg truncate">{user.full_name}</h1>
              {user.verified_badge && <VerifiedBadge size={16} />}
            </div>
            <div className="text-sm text-muted">@{user.username}</div>
            <div className="text-sm text-fg/70 mt-1">{headline}</div>
            {connectionCount !== null && (
              <Link href="/connections" className="inline-block text-sm text-blue font-medium mt-1.5">
                {connectionCount} connection{connectionCount === 1 ? '' : 's'}
              </Link>
            )}
          </div>

          <Link
            href={`/u/${user.username}`}
            className="block text-center text-xs text-muted mt-4 bg-mist border border-line rounded-xl py-2.5 active:scale-[0.98] transition-transform"
          >
            View how others see your profile
          </Link>

          {user.bio && (
            <div className="mt-6 bg-mist border border-line rounded-2xl p-5">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">About</h2>
              <p className="text-sm text-fg leading-relaxed whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}

          {user.categories && user.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {user.categories.map((cat) => (
                <span key={cat} className="px-3 py-1.5 rounded-full text-xs font-medium bg-mist border border-line text-muted">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
