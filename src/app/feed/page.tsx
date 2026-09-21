'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  getNetworkFeed, createPost, deletePost, NetworkPost,
  getWhoToFollow, SuggestedUser, uploadPostImage,
  likePost, unlikePost, getPostComments, addPostComment, PostComment,
} from '@/lib/network';
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

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={filled ? '#EF4444' : 'none'} stroke={filled ? '#EF4444' : 'currentColor'} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6.7-4.35-9.3-8.1C.9 9.9 2 6 5.6 5.1c2-.5 3.9.4 5 2 .8-1.1 2.9-2.5 5-2 3.6.9 4.7 4.8 2.9 7.8C18.7 16.65 12 21 12 21z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

function PostCard({ post, isMine, onDelete }: { post: NetworkPost; isMine: boolean; onDelete: (id: number) => void }) {
  const { showToast } = useToast();
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [postingComment, setPostingComment] = useState(false);

  async function toggleLike() {
    setLikeLoading(true);
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
    try {
      const res = prevLiked ? await unlikePost(post.id) : await likePost(post.id);
      setLikeCount(res.like_count);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      showToast('Could not update like', 'error');
    } finally {
      setLikeLoading(false);
    }
  }

  async function toggleComments() {
    setShowComments((v) => !v);
    if (!commentsLoaded) {
      try {
        const res = await getPostComments(post.id);
        setComments(res.comments);
      } catch {
        // silent — comments just won't load
      } finally {
        setCommentsLoaded(true);
      }
    }
  }

  async function submitComment() {
    if (!commentDraft.trim()) return;
    setPostingComment(true);
    try {
      const res = await addPostComment(post.id, commentDraft.trim());
      setComments((prev) => [...prev, res.comment]);
      setCommentCount((c) => c + 1);
      setCommentDraft('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not post comment', 'error');
    } finally {
      setPostingComment(false);
    }
  }

  return (
    <div className="ripple card-elevated bg-mist border border-line rounded-2xl p-4">
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
          <button onClick={() => onDelete(post.id)} className="text-xs text-muted hover:text-red-400 shrink-0">
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

      <div className="flex items-center gap-5 mt-3.5 pt-3 border-t border-line/60">
        <button onClick={toggleLike} disabled={likeLoading} className="flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50">
          <HeartIcon filled={liked} />
          <span className={`text-xs font-medium ${liked ? 'text-red-400' : 'text-muted'}`}>{likeCount > 0 ? likeCount : 'Like'}</span>
        </button>
        <button onClick={toggleComments} className="flex items-center gap-1.5 text-muted active:scale-95 transition-transform">
          <CommentIcon />
          <span className="text-xs font-medium">{commentCount > 0 ? commentCount : 'Comment'}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-3 pt-3 border-t border-line/60 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Avatar avatar={c.author.avatar} name={c.author.full_name} size={24} />
              <div className="min-w-0 flex-1 bg-black/40 rounded-xl px-3 py-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-fg">{c.author.full_name}</span>
                  {c.author.verified && <VerifiedBadge size={9} />}
                </div>
                <p className="text-xs text-fg/70 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitComment(); }}
              placeholder="Write a comment..."
              className="flex-1 bg-black/40 border border-line rounded-full px-3.5 py-2 text-xs text-fg placeholder:text-fg/40 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
            <button
              onClick={submitComment}
              disabled={postingComment || !commentDraft.trim()}
              className="text-xs font-semibold text-blue disabled:opacity-40 shrink-0"
            >
              {postingComment ? '...' : 'Post'}
            </button>
          </div>
        </div>
      )}
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
  const [showSuggested, setShowSuggested] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    getNetworkFeed({ limit: 30 })
      .then((res) => setPosts(res.posts))
      .catch(() => {})
      .finally(() => setLoading(false));
    getWhoToFollow(10)
      .then((res) => setSuggested(res.users))
      .catch(() => {});
    const timer = setTimeout(() => setShowSuggested(false), 60000);
    return () => clearTimeout(timer);
  }, [user]);

  function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file', 'error');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast('Image must be under 8MB', 'error');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handlePost() {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        setUploadingImage(true);
        imageUrl = await uploadPostImage(imageFile);
        setUploadingImage(false);
      }
      const res = await createPost(draft.trim(), imageUrl);
      setPosts((prev) => [res.post, ...prev]);
      setDraft('');
      setImageFile(null);
      setImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not post', 'error');
    } finally {
      setPosting(false);
      setUploadingImage(false);
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

          {imagePreview && (
            <div className="relative mt-2 ml-[44px] rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="" className="w-full max-h-64 object-cover" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(''); }}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelected} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="ripple h-8 w-8 rounded-full bg-black/40 border border-line flex items-center justify-center text-muted active:scale-95 transition-transform"
              aria-label="Add image"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="8.5" cy="10.5" r="1.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 19" />
              </svg>
            </button>
            <button
              onClick={handlePost}
              disabled={posting || !draft.trim()}
              className="ripple btn-elevated bg-blue disabled:opacity-40 active:scale-[0.98] transition-transform text-black text-xs font-semibold rounded-full px-5 py-2"
            >
              {uploadingImage ? 'Uploading...' : posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      {showSuggested && suggested.length > 0 && (
        <div className="pb-5">
          <h2 className="px-5 font-display font-bold text-fg text-base mb-3">Who to follow</h2>
          <div className="flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-hide">
            {suggested.map((s) => (
              <div key={s.id} className="shrink-0 w-40 ripple card-elevated bg-mist border border-line rounded-2xl p-3.5 flex flex-col items-center text-center">
                <Link href={`/u/${s.username}`} className="flex flex-col items-center">
                  <Avatar avatar={s.avatar} name={s.full_name} size={44} />
                  <div className="flex items-center gap-1 mt-2 max-w-full">
                    <span className="text-xs font-semibold text-fg truncate">{s.full_name}</span>
                    {s.verified && <VerifiedBadge size={10} />}
                  </div>
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
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isMine={post.author.username === user.username}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
