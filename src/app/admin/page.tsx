'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRequireAdmin } from '@/contexts/useRequireAdmin';

export default function AdminSystemPage() {
  const { user, loading } = useRequireAdmin();
  const { logout } = useAuth();

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink/40 text-sm font-mono">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-mist border-b border-line px-5 py-4 flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          CREET <span className="text-ink/40 font-normal text-sm">Admin System</span>
        </span>
        <button onClick={logout} className="text-sm text-ink/50 hover:text-blue transition-colors">
          Log out
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">
          Welcome, {user.full_name}
        </h1>
        <p className="text-ink/50 mb-6">Admin System — under construction.</p>

        <div className="border border-dashed border-line rounded-xl px-4 py-8 text-center">
          <p className="text-sm text-ink/50">
            User management, listing moderation, and platform stats are coming soon.
          </p>
        </div>
      </main>
    </div>
  );
}
