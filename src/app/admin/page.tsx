'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRequireAdmin } from '@/contexts/useRequireAdmin';

export default function AdminSystemPage() {
  const { user, loading } = useRequireAdmin();
  const { logout } = useAuth();

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm font-mono">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper animate-fade-in-up">
      <header className="bg-mist border-b border-line px-5 py-4 flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-fg">
          CREET <span className="text-muted font-normal text-sm">Admin System</span>
        </span>
        <button onClick={logout} className="text-sm text-muted hover:text-blue transition-colors">
          Log out
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="font-display text-2xl font-bold text-fg mb-1">
          Welcome, {user.full_name}
        </h1>
        <p className="text-muted mb-6">This section is still being built.</p>

        <div className="border border-dashed border-line rounded-xl px-4 py-8 text-center">
          <p className="text-sm text-muted">
            User management, listing moderation, and platform stats will appear here once they&apos;re ready.
          </p>
        </div>
      </main>
    </div>
  );
}
