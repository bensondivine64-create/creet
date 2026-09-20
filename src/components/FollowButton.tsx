'use client';

import { useEffect, useState } from 'react';
import { followUser, unfollowUser, getFollowStatus } from '@/lib/network';
import { useToast } from '@/contexts/ToastContext';

export default function FollowButton({ userId }: { userId: number }) {
  const { showToast } = useToast();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getFollowStatus(userId)
      .then((res) => setFollowing(res.following))
      .catch(() => {})
      .finally(() => setReady(true));
  }, [userId]);

  async function toggle() {
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(userId);
        setFollowing(false);
      } else {
        await followUser(userId);
        setFollowing(true);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update follow status', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return <div className="h-9 w-24 rounded-full bg-mist border border-line animate-pulse" />;
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`ripple text-sm font-semibold rounded-full px-5 py-2 active:scale-[0.96] transition-transform disabled:opacity-50 ${
        following ? 'border border-line text-fg' : 'bg-fg text-black'
      }`}
    >
      {loading ? '...' : following ? 'Following' : 'Follow'}
    </button>
  );
}
