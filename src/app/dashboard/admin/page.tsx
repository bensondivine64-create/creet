'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/contexts/useRequireAuth';

export default function AdminDashboard() {
  const { user, loading } = useRequireAuth('admin');
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
      <header className="bg-ink px-5 py-4 flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-white">
          CREET <span className="text-white/40 font-normal text-sm">Admin</span>
        </span>
        <button onClick={logout} className="text-sm text-white/60 hover:text-white transition-colors">
          Log out
        </button>
      </header>
      <main className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="font-display text-2xl font-bold text-ink">Welcome, {user.full_name}</h1>
        <p className="text-ink/50 mt-1">Admin dashboard — coming soon.</p>
      </main>
    </div>
  );
}
