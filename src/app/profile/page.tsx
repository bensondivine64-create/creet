'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getMyConnections } from '@/lib/connections';
import { uploadAvatar, uploadCoverPhoto } from '@/lib/profile';
import BottomNav from '@/components/BottomNav';
import VerifiedBadge from '@/components/VerifiedBadge';
import Avatar from '@/components/Avatar';
import ImageCropModal from '@/components/ImageCropModal';

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

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  );
}

function buildHeadline(role: string, categories: string[], location?: string | null) {
  const parts = [role.charAt(0).toUpperCase() + role.slice(1)];
  if (categories.length > 0) parts.push(categories[0]);
  if (location) parts.push(location);
  return parts.join(' · ');
}

function formatJoined(iso?: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  return `Joined ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
}

type CropTarget = 'avatar' | 'cover' | null;

export default function ProfilePage() {
  const { user, loading } = useRequireAnyAuth();
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [connectionCount, setConnectionCount] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [cropTarget, setCropTarget] = useState<CropTarget>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    getMyConnections()
      .then((res) => setConnectionCount(res.connections.length))
      .catch(() => {});
  }, [user]);

  function handlePickFile(target: CropTarget) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const src = URL.createObjectURL(file);
      setRawImageSrc(src);
      setCropTarget(target);
      e.target.value = '';
    };
  }

  function closeCropper() {
    if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
    setRawImageSrc(null);
    setCropTarget(null);
  }

  async function handleCropConfirm(croppedFile: File) {
    const target = cropTarget;
    const localPreviewUrl = URL.createObjectURL(croppedFile);

    if (target === 'avatar') setPreviewAvatar(localPreviewUrl);
    if (target === 'cover') setPreviewCover(localPreviewUrl);
    closeCropper();

    setUploadError('');
    setUploading(true);
    try {
      if (target === 'avatar') {
        await uploadAvatar(croppedFile);
      } else if (target === 'cover') {
        await uploadCoverPhoto(croppedFile);
      }
      await refreshUser();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Could not upload photo');
      if (target === 'avatar') setPreviewAvatar(null);
      if (target === 'cover') setPreviewCover(null);
    } finally {
      setUploading(false);
      if (target === 'avatar') URL.revokeObjectURL(localPreviewUrl);
      if (target === 'cover') URL.revokeObjectURL(localPreviewUrl);
    }
  }

  async function handleShare() {
    if (!user) return;
    const url = `https://creet.name.ng/u/${user.username}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: user.full_name, url });
      } catch {
        // user cancelled the share sheet — not an error
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast('Profile link copied', 'success');
    } catch {
      showToast('Could not copy link', 'error');
    }
  }

  if (loading || !user) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  const headline = buildHeadline(user.role, user.categories || [], user.location);
  const coverSrc = previewCover || user.cover_photo;
  const joined = formatJoined(user.created_at);

  return (
    <main className="min-h-screen bg-black pb-24 animate-fade-in-up">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line/60 relative z-10 bg-black safe-top">
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
          {coverSrc && (
            <img src={coverSrc} alt="" className="w-full h-full object-cover" />
          )}
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-blue flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
            aria-label="Change cover photo"
          >
            <CameraIcon />
          </button>
          <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePickFile('cover')} />
        </div>

        <div className="max-w-2xl mx-auto px-5">
          <div className="relative -mt-11 flex items-end justify-between">
            <div className="relative">
              <div className="rounded-full ring-4 ring-black">
                <Avatar avatar={previewAvatar || user.avatar} name={user.full_name} size={88} />
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-blue flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                aria-label="Change profile photo"
              >
                <CameraIcon />
              </button>
              <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePickFile('avatar')} />
            </div>

            <div className="flex gap-2 pb-2">
              <button
                onClick={handleShare}
                className="px-4 py-2 rounded-full border border-line text-fg text-sm font-semibold active:scale-[0.96] transition-transform"
              >
                Share
              </button>
              <Link
                href="/profile/edit"
                className="px-4 py-2 rounded-full border border-line text-fg text-sm font-semibold active:scale-[0.96] transition-transform"
              >
                Edit profile
              </Link>
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

            {user.short_bio && (
              <p className="text-sm text-fg/80 mt-2.5 leading-relaxed">{user.short_bio}</p>
            )}

            <div className="flex items-center gap-3 mt-3 text-sm text-muted">
              {joined && (
                <span className="flex items-center gap-1.5">
                  <CalendarIcon /> {joined}
                </span>
              )}
            </div>

            {connectionCount !== null && (
              <Link href="/connections" className="inline-block text-sm mt-2">
                <span className="font-semibold text-fg">{connectionCount}</span>{' '}
                <span className="text-muted">connection{connectionCount === 1 ? '' : 's'}</span>
              </Link>
            )}
          </div>

          <Link
            href={`/u/${user.username}`}
            className="block text-center text-xs text-muted mt-5 border border-line/60 rounded-full py-2.5 active:opacity-60 transition-opacity"
          >
            View how others see your profile
          </Link>

          {user.categories && user.categories.length > 0 && (
            <div className="mt-6 pt-6 pb-16 border-t border-line/60">
              <h2 className="font-display text-base font-bold text-fg mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {user.categories.map((cat) => (
                  <span key={cat} className="px-3 py-1 rounded-md text-xs font-medium border border-line text-fg/70">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {cropTarget && rawImageSrc && (
        <ImageCropModal
          imageSrc={rawImageSrc}
          aspect={cropTarget === 'avatar' ? 1 : 3}
          cropShape={cropTarget === 'avatar' ? 'round' : 'rect'}
          fileName={cropTarget === 'avatar' ? 'avatar.jpg' : 'cover.jpg'}
          onCancel={closeCropper}
          onConfirm={handleCropConfirm}
        />
      )}

      <BottomNav />
    </main>
  );
}
