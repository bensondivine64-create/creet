'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { updateProfile, uploadAvatar } from '@/lib/profile';
import Avatar from '@/components/Avatar';
import { CATEGORIES } from '@/lib/categories';
import BottomNav from '@/components/BottomNav';

export default function EditProfilePage() {
  const { user, loading } = useRequireAnyAuth();
  const { refreshUser } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [categories, setCategories] = useState<string[]>(user?.categories || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setAvatarUploading(true);
    try {
      const updated = await uploadAvatar(file);
      setAvatarUrl(updated.avatar || null);
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload photo');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  }

  if (loading || !user) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName, username, bio, location, categories });
      await refreshUser();
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper pb-24 animate-fade-in-up">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <Link href="/profile" className="text-sm text-muted hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-fg">Edit profile</span>
        <span className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar avatar={avatarUrl} name={fullName || user.full_name} size={88} />
            <label className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-blue border-2 border-paper flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
              {avatarUploading ? (
                <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin-fast" />
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarChange}
                disabled={avatarUploading}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-muted mt-2">Tap the + to add a profile photo</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-fg/70 mb-1.5">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-line bg-mist px-3.5 py-3 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-fg/70 mb-1.5">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            minLength={3}
            className="w-full rounded-xl border border-line bg-mist px-3.5 py-3 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
          />
          <p className="text-xs text-muted mt-1">This is used in your profile link: creet.name.ng/u/{username || 'username'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-fg/70 mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={280}
            placeholder="A short intro sellers and buyers will see on your profile."
            className="w-full rounded-xl border border-line bg-mist px-3.5 py-3 text-sm text-fg placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
          />
          <div className="text-right text-xs text-muted mt-1">{bio.length}/280</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-fg/70 mb-1.5">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Lagos, Nigeria"
            className="w-full rounded-xl border border-line bg-mist px-3.5 py-3 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-fg/70 mb-2">Categories</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium active:scale-[0.96] transition-transform ${
                    active ? 'bg-blue text-black' : 'bg-mist border border-line text-muted'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue hover:bg-blue-deep disabled:opacity-70 text-black text-sm font-semibold rounded-xl py-3.5 transition-colors flex items-center justify-center gap-2"
        >
          {saving && (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin-fast" />
          )}
          {saving ? 'Saving changes...' : 'Save changes'}
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
