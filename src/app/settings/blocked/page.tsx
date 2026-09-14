'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { getBlockedUsers, unblockUser, BlockedUser } from '@/lib/blocks';
import { useToast } from '@/contexts/ToastContext';
import Avatar from '@/components/Avatar';
import EmptyState from '@/components/EmptyState';
import PageLoader from '@/components/PageLoader';

export default function BlockedAccountsPage() {
  const { user, loading } = useRequireAnyAuth();
  const { showToast } = useToast();
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    getBlockedUsers()
      .then((res) => setBlocked(res.blocked))
      .catch(() => setBlocked([]))
      .finally(() => setListLoading(false));
  }, [user]);

  async function handleUnblock(id: number) {
    setUnblockingId(id);
    try {
      await unblockUser(id);
      setBlocked((prev) => prev.filter((u) => u.id !== id));
      showToast('User unblocked', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not unblock', 'error');
    } finally {
      setUnblockingId(null);
    }
  }

  if (loading || !user) {
    return <PageLoader />;
  }

  return (
    <main className="min-h-screen bg-paper pb-24">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <Link href="/settings" className="text-sm text-muted hover:text-fg transition-colors">← Back</Link>
        <span className="font-display text-lg font-bold text-fg">Blocked accounts</span>
        <span className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        {listLoading && <p className="text-sm text-muted text-center py-10">Loading...</p>}

        {!listLoading && blocked.length === 0 && (
          <EmptyState icon="search" title="No blocked accounts" subtitle="Accounts you block will show up here." />
        )}

        {!listLoading && blocked.length > 0 && (
          <div className="space-y-3">
            {blocked.map((u) => (
              <div key={u.id} className="flex items-center gap-3 bg-mist border border-line rounded-2xl p-4">
                <Avatar avatar={u.avatar} name={u.full_name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-fg truncate">{u.full_name}</div>
                  <div className="text-xs text-muted truncate">@{u.username}</div>
                </div>
                <button
                  onClick={() => handleUnblock(u.id)}
                  disabled={unblockingId === u.id}
                  className="shrink-0 text-xs bg-paper border border-line text-fg font-semibold rounded-full px-3.5 py-1.5 disabled:opacity-50"
                >
                  {unblockingId === u.id ? 'Working...' : 'Unblock'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
