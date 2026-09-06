'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAdmin } from '@/contexts/useRequireAdmin';
import { getAdminStats, AdminStats } from '@/lib/admin';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-mist border border-line rounded-2xl p-4">
      <div className="text-2xl font-bold text-fg">{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  );
}

export default function AdminSystemPage() {
  const { user, loading } = useRequireAdmin();
  const { logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    if (!user) return;
    getAdminStats()
      .then(setStats)
      .catch((err) => setStatsError(err instanceof Error ? err.message : 'Could not load stats'))
      .finally(() => setStatsLoading(false));
  }, [user]);

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
        <button onClick={logout} className="text-sm text-muted hover:text-fg transition-colors">
          Log out
        </button>
      </header>

      <nav className="flex gap-2 px-5 py-3 border-b border-line overflow-x-auto">
        <span className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue text-black">Dashboard</span>
        <Link href="/admin/users" className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-mist border border-line text-muted">Users</Link>
        <Link href="/admin/listings" className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-mist border border-line text-muted">Listings</Link>
        <Link href="/admin/reports" className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-mist border border-line text-muted">Reports</Link>
        <Link href="/browse" className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-mist border border-line text-muted">← Back to CREET</Link>
      </nav>

      <main className="max-w-2xl mx-auto px-5 py-6">
        <h1 className="font-display text-2xl font-bold text-fg mb-1">
          Welcome, {user.full_name}
        </h1>
        <p className="text-muted mb-6">Platform overview.</p>

        {statsLoading && <p className="text-sm text-muted text-center py-16">Loading stats...</p>}

        {!statsLoading && statsError && (
          <p className="text-sm text-red-400 text-center py-16">{statsError}</p>
        )}

        {!statsLoading && stats && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-8">
              <StatCard label="Total users" value={stats.total_users} />
              <StatCard label="Active users" value={stats.active_users} />
              <StatCard label="Suspended users" value={stats.suspended_users} />
              <StatCard label="Total listings" value={stats.total_listings} />
              <StatCard label="Total reports" value={stats.total_reports} />
              <StatCard label="Pending reports" value={stats.pending_reports} />
            </div>

            <h2 className="font-display font-semibold text-fg mb-3">Quick actions</h2>
            <div className="grid grid-cols-3 gap-3 mb-8">
              <Link href="/admin/users" className="bg-mist border border-line rounded-xl px-3 py-4 text-center active:scale-[0.97] transition-transform">
                <div className="text-sm font-semibold text-fg">Users</div>
              </Link>
              <Link href="/admin/listings" className="bg-mist border border-line rounded-xl px-3 py-4 text-center active:scale-[0.97] transition-transform">
                <div className="text-sm font-semibold text-fg">Listings</div>
              </Link>
              <Link href="/admin/reports" className="bg-mist border border-line rounded-xl px-3 py-4 text-center active:scale-[0.97] transition-transform">
                <div className="text-sm font-semibold text-fg">Reports</div>
              </Link>
            </div>

            <h2 className="font-display font-semibold text-fg mb-3">Recent activity</h2>
            {stats.recent_activity.length === 0 && (
              <p className="text-sm text-muted text-center py-6">No recent activity.</p>
            )}
            {stats.recent_activity.length > 0 && (
              <div className="space-y-2">
                {stats.recent_activity.map((a, i) => (
                  <div key={i} className="bg-mist border border-line rounded-xl px-4 py-3">
                    <p className="text-sm text-fg">{a.text}</p>
                    {a.created_at && (
                      <p className="text-xs text-muted mt-0.5">{new Date(a.created_at).toLocaleString()}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
