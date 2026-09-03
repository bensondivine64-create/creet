'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPublicProfile, PublicProfile } from '@/lib/profile';
import VerifiedBadge from '@/components/VerifiedBadge';
import EmptyState from '@/components/EmptyState';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPublicProfile(username)
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load profile'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-paper">
        <EmptyState icon="search" title="Profile not found" subtitle="This user may not exist." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper pb-16 animate-fade-in-up">
      <div className="px-5 py-4 border-b border-line">
        <Link href="/browse" className="text-sm text-muted hover:text-fg transition-colors">
          ← Back
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center gap-4 bg-mist border border-line rounded-2xl p-4 shadow-lg shadow-black/20">
          <span className="h-16 w-16 rounded-full bg-blue text-white text-xl font-bold flex items-center justify-center shrink-0">
            {profile.full_name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-lg font-bold text-fg truncate">{profile.full_name}</h1>
              {profile.is_verified && <VerifiedBadge size={16} />}
            </div>
            <div className="text-sm text-muted truncate">@{profile.username}</div>
            <div className="text-xs text-muted capitalize mt-0.5">
              {profile.role}{profile.location ? ` · ${profile.location}` : ''}
            </div>
          </div>
        </div>

        {profile.bio && (
          <div className="mt-4 bg-mist border border-line rounded-2xl p-4">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">About</h2>
            <p className="text-sm text-fg leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {profile.categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.categories.map((cat) => (
              <span key={cat} className="px-3 py-1.5 rounded-full text-xs font-medium bg-mist border border-line text-muted">
                {cat}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6">
          <h2 className="font-display font-bold text-fg text-lg mb-3">
            {profile.role === 'vendor' ? 'Products' : 'Gigs'}
          </h2>

          {profile.listings.length === 0 && (
            <EmptyState icon="listing" title="Nothing posted yet" />
          )}

          {profile.listings.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {profile.listings.map((item) => (
                <Link
                  key={item.id}
                  href={`/listing/${item.id}`}
                  className="block bg-mist border border-line rounded-2xl overflow-hidden shadow-lg shadow-black/30 active:scale-[0.98] transition-transform"
                >
                  <div className="aspect-video bg-line/20" />
                  <div className="p-3">
                    <div className="text-sm font-semibold text-fg leading-snug line-clamp-2 mb-1.5">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted">
                      From <span className="text-sm font-bold text-fg">{item.currency} {item.price.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
