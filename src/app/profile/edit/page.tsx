'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { updateProfile } from '@/lib/profile';
import { CATEGORIES } from '@/lib/categories';
import BottomNav from '@/components/BottomNav';

export default function EditProfilePage() {
  const { user, loading } = useRequireAnyAuth();
  const { refreshUser } = useAuth();
  const router = useRouter();

  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [categories, setCategories] = useState<string[]>(user?.categories || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      await updateProfile({ bio, location, categories });
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

        <div>
          <label className="block text-sm font-medium text-fg/70 mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={280}
            placeholder="A short intro sellers and buyers will see on your profile."
            className="w-full rounded-xl border border-line bg-mist px-3.5 py-3 text-sm text-fg placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-blue transition-colors"
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
            className="w-full rounded-xl border border-line bg-mist px-3.5 py-3 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue transition-colors"
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
                    active ? 'bg-blue text-white' : 'bg-mist border border-line text-muted'
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
          className="w-full bg-blue hover:bg-blue-deep disabled:opacity-70 text-white text-sm font-semibold rounded-xl py-3.5 transition-colors flex items-center justify-center gap-2"
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
