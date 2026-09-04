'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { updateProfile } from '@/lib/profile';
import { CATEGORIES } from '@/lib/categories';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function CreateProfilePage() {
  const { user, loading: authLoading } = useRequireAnyAuth();
  const { refreshUser } = useAuth();
  const router = useRouter();

  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateProfile({ bio, location, categories });
      await refreshUser();
      router.push('/browse');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile');
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  const bioLabel =
    user.role === 'freelancer'
      ? 'Tell buyers about your skills'
      : user.role === 'vendor'
      ? "Describe your store or what you sell"
      : 'What are you usually looking for?';

  const bioPlaceholder =
    user.role === 'freelancer'
      ? 'e.g. I build websites and mobile apps with 3 years of experience...'
      : user.role === 'vendor'
      ? 'e.g. We sell quality electronics and accessories...'
      : 'e.g. I usually hire designers and developers for small projects...';

  const categoryLabel =
    user.role === 'freelancer'
      ? 'What services do you offer?'
      : user.role === 'vendor'
      ? 'What do you sell?'
      : "What are you interested in?";

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-5 py-10">
      {saving && <LoadingOverlay label="Saving your profile..." />}

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <span className="font-display text-xl font-bold text-fg">Set up your profile</span>
          <p className="text-sm text-muted mt-1">
            Just a couple questions so CREET works better for you.
          </p>
        </div>

        <div className="bg-mist border border-line rounded-2xl p-6">
          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1">{bioLabel}</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={bioPlaceholder}
                rows={3}
                className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-fg placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lagos, Nigeria"
                className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg/70 mb-2">{categoryLabel}</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-transform ${
                      categories.includes(cat)
                        ? 'bg-blue text-white'
                        : 'bg-paper border border-line text-muted'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue disabled:opacity-50 active:scale-[0.98] transition-transform text-white text-sm font-semibold rounded-lg py-3"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
