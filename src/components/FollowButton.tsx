'use client';

// optimistic
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
    if (loading) return;
    const next = !following;
    setFollowing(next);
    setLoading(true);
    try {
      if (next) await followUser(userId);
      else await unfollowUser(userId);
    } catch (err) {
      setFollowing(!next);
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
      aria-pressed={following}
      className={`ripple text-sm font-semibold rounded-full px-5 py-2 active:scale-[0.96] transition-transform disabled:opacity-70 ${
        following ? 'border border-line text-fg' : 'bg-fg text-black'
      }`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
