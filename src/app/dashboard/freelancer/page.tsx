'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/contexts/useRequireAuth';

export default function FreelancerDashboard() {
  const { user, loading } = useRequireAuth('freelancer');
  const { logout } = useAuth();

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-fg/40 text-sm font-mono">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line px-5 py-4 flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-fg">CREET</span>
        <button onClick={logout} className="text-sm text-fg/50 hover:text-blue transition-colors">
          Log out
        </button>
      </header>
      <main className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="font-display text-2xl font-bold text-fg">Welcome, {user.full_name}</h1>
        <p className="text-fg/50 mt-1 mb-6">Freelancer dashboard — coming soon.</p>

        <div className="space-y-3">
          <Link
            href="/post-gig"
            className="block bg-blue hover:bg-blue-deep text-white rounded-xl px-4 py-4 transition-colors"
          >
            <div className="font-semibold">Post a gig</div>
            <div className="text-sm text-white/70 mt-0.5">Offer a service to buyers.</div>
          </Link>

          <Link
            href="/requests"
            className="block border border-line rounded-xl px-4 py-4 hover:border-ink transition-colors"
          >
            <div className="font-semibold text-fg">Browse open requests</div>
            <div className="text-sm text-fg/50 mt-0.5">See what buyers are looking for.</div>
          </Link>
        </div>
      </main>
    </div>
  );
}
