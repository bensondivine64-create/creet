'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNetworkFeed, createPost, deletePost, NetworkPost, getWhoToFollow, SuggestedUser } from '@/lib/network';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { useToast } from '@/contexts/ToastContext';
import Avatar from '@/components/Avatar';
import VerifiedBadge from '@/components/VerifiedBadge';
import BottomNav from '@/components/BottomNav';
import NotificationBell from '@/components/NotificationBell';
import EmptyState from '@/components/EmptyState';
import FollowButton from '@/components/FollowButton';
import { formatRelativeTime } from '@/lib/time';

function FeedSkeleton() {
  return (
    <div className="px-5 space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="ripple card-elevated bg-mist border border-line rounded-2xl p-4 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-line/20" />
            <div className="h-3 w-24 bg-line/20 rounded" />
          </div>
          <div className="h-3 w-full bg-line/20 rounded mb-1.5" />
          <div className="h-3 w-2/3 bg-line/20 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function NetworkFeedPage() {
  const { user, loading: authLoading } = useRequireAnyAuth();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<NetworkPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [suggested, setSuggested] = useState<SuggestedUser[]>([]);

  useEffect(() => {
    if (!user) return;
    getNetworkFeed({ limit: 30 })
      .then((res) => setPosts(res.posts))
      .catch(() => {})
      .finally(() => setLoading(false));
    getWhoToFollow(10)
      .then((res) => setSuggested(res.users))
      .catch(() => {});
  }, [user]);

  async function handlePost() {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      const res = await createPost(draft.trim());
      setPosts((prev) => [res.post, ...prev]);
      setDraft('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not post', 'error');
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(postId: number) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await deletePost(postId);
    } catch {
      showToast('Could not delete post', 'error');
    }
  }

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-black pb-40">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 safe-top animate-pulse">
          <div className="h-6 w-20 bg-line/20 rounded" />
        </div>
        <FeedSkeleton />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pb-40">
      <div className="flex items-center justify-between px-5 pt-5 pb-4 safe-top">
        <span className="font-display text-xl font-bold tracking-tight text-fg">My Feed</span>
        <NotificationBell />
      </div>

      <div className="px-5 pb-5">
        <div className="ripple card-elevated bg-mist border border-line rounded-2xl p-3.5">
          <div className="flex items-start gap-3">
            <Avatar avatar={user.avatar} name={user.full_name} size={36} />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
              placeholder="Share an update, a project, or what you're looking for..."
              rows={2}
              className="flex-1 bg-transparent text-sm text-fg placeholder:text-fg/40 resize-none focus:outline-none"
            />
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={handlePost}
              disabled={posting || !draft.trim()}
              className="ripple btn-elevated bg-blue disabled:opacity-40 active:scale-[0.98] transition-transform text-black text-xs font-semibold rounded-full px-5 py-2"
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      {suggested.length > 0 && (
        <div className="pb-5">
          <h2 className="px-5 font-display font-bold text-fg text-base mb-3">Who to follow</h2>
          <div className="flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-hide">
            {suggested.map((s) => (
              <div key={s.id} className="shrink-0 w-40 ripple card-elevated bg-mist border border-line rounded-2xl p-3.5 flex flex-col items-center text-center">
                <Link href={`/u/${s.username}`} className="flex flex-col items-center">
                  <Avatar avatar={s.avatar} name={s.full_name} size={44} />
                  <span className="text-xs font-semibold text-fg mt-2 truncate max-w-full">{s.full_name}</span>
                  <span className="text-[10px] text-muted capitalize">{s.role}</span>
                </Link>
                <div className="mt-2.5">
                  <FollowButton userId={s.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <FeedSkeleton />}

      {!loading && posts.length === 0 && (
        <EmptyState
          icon="inbox"
          title="Your feed is empty"
          subtitle="Follow people on CREET to see their updates here, or share your own."
        />
      )}

      {!loading && posts.length > 0 && (
        <div className="px-5 space-y-3">
          {posts.map((post) => {
            const isMine = post.author.username === user.username;
            return (
              <div key={post.id} className="ripple card-elevated bg-mist border border-line rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/u/${post.author.username}`} className="flex items-center gap-2.5 min-w-0">
                    <Avatar avatar={post.author.avatar} name={post.author.full_name} size={36} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-fg truncate">{post.author.full_name}</span>
                        {post.author.verified && <VerifiedBadge size={11} />}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <span className="capitalize">{post.author.role}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(post.created_at)}</span>
                      </div>
                    </div>
                  </Link>
                  {isMine && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-xs text-muted hover:text-red-400 shrink-0"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-sm text-fg/80 leading-relaxed mt-3 whitespace-pre-wrap">{post.content}</p>
                {post.image_url && (
                  <div className="mt-3 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.image_url} alt="" className="w-full max-h-96 object-cover" loading="lazy" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
