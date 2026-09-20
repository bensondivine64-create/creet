'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getListing, deleteListing, trackListingView } from '@/lib/listings';
import { getComments, postComment } from '@/lib/comments';
import { startConversation } from '@/lib/messages';
import { Listing } from '@/types/listing';
import { Comment } from '@/types/comment';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import VerifiedBadge from '@/components/VerifiedBadge';
import Avatar from '@/components/Avatar';
import ReportModal from '@/components/ReportModal';
import BottomNav from '@/components/BottomNav';
import { useToast } from '@/contexts/ToastContext';
import { formatRelativeTime } from '@/lib/time';

function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-black flex flex-col animate-pulse">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line/60 safe-top">
        <div className="h-4 w-14 bg-line/20 rounded" />
        <div className="h-5 w-16 bg-line/20 rounded" />
        <span className="w-10" />
      </div>
      <div className="max-w-2xl mx-auto w-full px-5 py-8 flex-1">
        <div className="aspect-[4/3] rounded-2xl bg-line/20 mb-6" />
        <div className="h-3 w-20 bg-line/20 rounded mb-2" />
        <div className="h-7 w-3/4 bg-line/20 rounded mb-6" />
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-full bg-line/20" />
          <div className="h-3 w-24 bg-line/20 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-line/20 rounded" />
          <div className="h-3 w-full bg-line/20 rounded" />
          <div className="h-3 w-2/3 bg-line/20 rounded" />
        </div>
      </div>
    </main>
  );
}

function CommentIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const confirmDialog = useConfirm();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messaging, setMessaging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const COMMENTS_PAGE_SIZE = 10;

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    getListing(params.id as string)
      .then((data) => {
        setListing(data);
        if (user) trackListingView(params.id as string);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load listing'))
      .finally(() => setLoading(false));

    setCommentsLoading(true);
    getComments(params.id as string, { limit: COMMENTS_PAGE_SIZE, offset: 0 })
      .then((res) => { setComments(res.comments); setCommentsTotal(res.total); })
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, user]);

  async function handleMessageSeller() {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!listing) return;
    setMessaging(true);
    try {
      const res = await startConversation(listing.id);
      router.push(`/inbox/${res.conversation_id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not start conversation', 'error');
    } finally {
      setMessaging(false);
    }
  }

  async function handleDelete() {
    if (!listing) return;
    const ok = await confirmDialog({
      title: 'Delete this listing?',
      description: 'This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteListing(listing.id);
      showToast('Listing deleted', 'success');
      router.push('/browse');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete listing', 'error');
      setDeleting(false);
    }
  }

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!newComment.trim()) return;
    setPosting(true);
    setCommentError('');
    try {
      const res = await postComment(params.id as string, newComment.trim());
      setComments((prev) => [res.comment, ...prev]);
      setCommentsTotal((prev) => prev + 1);
      setNewComment('');
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Could not post comment');
    } finally {
      setPosting(false);
    }
  }

  const isHiring = listing?.kind === 'hiring';
  const ctaLabel = listing?.kind === 'request' || isHiring ? 'Send proposal' : 'Message seller';
  const isOwnListing = !!(user && listing && user.username === listing.seller.username);
  const outOfStock = listing?.kind === 'product' && listing.stock <= 0;
  const editHref = listing ? `/listing/${listing.id}/edit-${listing.kind === 'hiring' ? 'request' : listing.kind}` : '';

  const displayPrice = listing?.display_price ?? listing?.price ?? 0;
  const displayCurrency = listing?.display_currency ?? listing?.currency ?? '';
  const commentCount = listing?.comment_count;

  if (loading) return <DetailSkeleton />;

  return (
    <main className="min-h-screen bg-black flex flex-col pb-52">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line/60 safe-top">
        <Link href="/browse" className="text-sm text-muted hover:text-fg transition-colors">
          ← Back
        </Link>
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-fg">
          CREET
        </Link>
        <span className="w-10" />
      </div>

      {error && (
        <p className="text-sm text-muted text-center py-24">
          This listing couldn&apos;t be found.
        </p>
      )}

      {!error && listing && (
        <div className="max-w-2xl mx-auto w-full px-5 py-8 flex-1">
          {listing.images && listing.images.length > 0 && (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
              {outOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold tracking-wide uppercase">Out of stock</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-blue">{listing.category}</span>
                {isHiring && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue/15 text-blue">
                    Hiring
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold text-fg mt-1">{listing.title}</h1>
            </div>
            {!isOwnListing && (
              <button
                onClick={() => setShowReport(true)}
                className="text-xs text-muted underline underline-offset-2 shrink-0 mt-1"
              >
                Report
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted">
            {listing.rating_count > 0 && <span>★ {listing.rating_avg.toFixed(1)} ({listing.rating_count})</span>}
            {typeof commentCount === 'number' && commentCount > 0 && (
              <span className="flex items-center gap-1"><CommentIcon /> {commentCount}</span>
            )}
            <span>{formatRelativeTime(listing.created_at)}</span>
          </div>

          {isOwnListing && (
            <div className="flex items-center gap-3 mt-3">
              <Link
                href={editHref}
                className="text-xs text-fg font-medium underline underline-offset-2"
              >
                Edit listing
              </Link>
              <span className="text-fg/20 text-xs">·</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-red-400 underline underline-offset-2 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete listing'}
              </button>
            </div>
          )}

          <Link href={`/u/${listing.seller.username}`} className="flex items-center gap-2 mt-4 active:opacity-70">
            <Avatar avatar={listing.seller.avatar} name={listing.seller.full_name} size={32} />
            <div>
              <div className="text-sm font-medium text-fg flex items-center gap-1">
                {listing.seller.full_name}
                {listing.seller.verified && <VerifiedBadge size={13} />}
              </div>
              <div className="text-xs text-muted">@{listing.seller.username}</div>
            </div>
          </Link>

          <div className="flex items-center gap-4 mt-4 text-sm text-muted">
            {listing.kind === 'gig' && <span>{listing.delivery_days}-day delivery</span>}
            {listing.kind === 'product' && (
              <span className={outOfStock ? 'text-red-400' : ''}>
                {listing.condition === 'new' ? 'New' : 'Used'} · {outOfStock ? 'Out of stock' : `${listing.stock} in stock`}
              </span>
            )}
          </div>

          <p className="text-sm text-fg/80 leading-relaxed mt-5">{listing.description}</p>

          <div className="mt-10 pt-8 border-t border-line/60">
            <h2 className="font-display font-semibold text-fg mb-5">
              Comments {commentsTotal > 0 && `(${commentsTotal})`}
            </h2>

            {user ? (
              <form onSubmit={handlePostComment} className="mb-6">
                {commentError && (
                  <p className="text-xs text-red-400 mb-2">{commentError}</p>
                )}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ask a question or leave a comment..."
                  rows={2}
                  className="w-full rounded-lg border border-line bg-mist px-3 py-2.5 text-sm text-fg placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-blue/40 focus:border-blue/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={posting || !newComment.trim()}
                  className="ripple btn-elevated mt-3 bg-blue disabled:opacity-40 active:scale-[0.98] transition-transform text-black text-xs font-semibold rounded-xl px-5 py-2.5"
                >
                  {posting ? 'Posting...' : 'Post comment'}
                </button>
              </form>
            ) : (
              <p className="text-sm text-muted mb-6">
                <Link href="/login" className="text-fg font-medium underline underline-offset-2 hover:text-white">
                  Log in
                </Link>{' '}
                to leave a comment.
              </p>
            )}

            {commentsLoading && <p className="text-sm text-muted">Loading comments...</p>}

            {!commentsLoading && comments.length === 0 && (
              <p className="text-sm text-muted">No comments yet.</p>
            )}

            {!commentsLoading && comments.length > 0 && (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <Avatar avatar={c.author.avatar} name={c.author.full_name} size={28} />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-fg flex items-center gap-1.5">
                        {c.author.full_name}
                        {c.author.verified && <VerifiedBadge size={11} />}
                        <span className="text-muted font-normal">· {formatRelativeTime(c.created_at)}</span>
                      </div>
                      <div className="text-sm text-fg/70 mt-0.5">{c.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!commentsLoading && comments.length < commentsTotal && (
              <div className="text-center mt-4">
                <button
                  onClick={async () => {
                    setLoadingMoreComments(true);
                    try {
                      const res = await getComments(params.id as string, { limit: COMMENTS_PAGE_SIZE, offset: comments.length });
                      setComments((prev) => [...prev, ...res.comments]);
                      setCommentsTotal(res.total);
                    } finally {
                      setLoadingMoreComments(false);
                    }
                  }}
                  disabled={loadingMoreComments}
                  className="text-sm text-fg font-medium underline underline-offset-2 disabled:opacity-50"
                >
                  {loadingMoreComments ? 'Loading...' : 'Load more comments'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!error && listing && (
        <div
          className="fixed inset-x-0 z-20 bg-black border-t border-line/60 px-5 py-4 flex items-center justify-between"
          style={{ bottom: 'calc(4.25rem + env(safe-area-inset-bottom))' }}
        >
          <span className="font-display text-xl font-bold text-fg">
            {displayCurrency} {displayPrice.toLocaleString()}
          </span>
          {isOwnListing ? (
            <Link
              href={editHref}
              className="border border-line active:scale-[0.98] transition-transform text-fg text-sm font-semibold rounded-lg px-6 py-3"
            >
              Edit listing
            </Link>
          ) : (
            <button
              onClick={handleMessageSeller}
              disabled={messaging || outOfStock}
              className="ripple btn-elevated bg-blue disabled:opacity-50 active:scale-[0.98] transition-transform text-black text-sm font-semibold rounded-xl px-6 py-3"
            >
              {outOfStock ? 'Out of stock' : messaging ? 'Opening...' : ctaLabel}
            </button>
          )}
        </div>
      )}

      {showReport && listing && (
        <ReportModal targetType="listing" targetId={listing.id} onClose={() => setShowReport(false)} />
      )}

      <BottomNav />
    </main>
  );
}
