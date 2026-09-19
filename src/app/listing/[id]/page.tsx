'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getListing, deleteListing } from '@/lib/listings';
import { getComments, postComment } from '@/lib/comments';
import { getReviews, createReview, Review } from '@/lib/reviews';
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

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-0.5 active:scale-90 transition-transform"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill={n <= value ? '#F4F5F7' : 'none'}
            stroke={n <= value ? '#F4F5F7' : '#8B98A5'}
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= rating ? '#F4F5F7' : 'none'} stroke={n <= rating ? '#F4F5F7' : '#8B98A5'} strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-paper flex flex-col animate-pulse">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line safe-top">
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

  const [reviews, setReviews] = useState<Review[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [myRating, setMyRating] = useState(0);

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    getListing(params.id as string)
      .then((data) => setListing(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load listing'))
      .finally(() => setLoading(false));

    setCommentsLoading(true);
    getComments(params.id as string, { limit: COMMENTS_PAGE_SIZE, offset: 0 })
      .then((res) => { setComments(res.comments); setCommentsTotal(res.total); })
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));

    getReviews(params.id as string)
      .then((res) => setReviews(res.reviews))
      .catch(() => setReviews([]));
  }, [params.id]);

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

  async function handleRate(stars: number) {
    if (!listing || submittingReview) return;
    setSubmittingReview(true);
    try {
      await createReview(listing.id, stars);
      const newCount = listing.rating_count + 1;
      const newAvg = (listing.rating_avg * listing.rating_count + stars) / newCount;
      setListing({ ...listing, rating_avg: newAvg, rating_count: newCount });
      setMyRating(stars);
      showToast('Thanks for rating!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not submit rating', 'error');
    } finally {
      setSubmittingReview(false);
    }
  }

  const ctaLabel = listing?.kind === 'request' ? 'Send proposal' : 'Message seller';
  const isOwnListing = !!(user && listing && user.username === listing.seller.username);
  const alreadyRated = !!(user && (myRating > 0 || reviews.some((r) => r.reviewer.username === user.username)));
  const canRate = !!(user && listing && !isOwnListing && !alreadyRated);
  const outOfStock = listing?.kind === 'product' && listing.stock <= 0;
  const editHref = listing ? `/listing/${listing.id}/edit-${listing.kind}` : '';

  if (loading) return <DetailSkeleton />;

  return (
    <main className="min-h-screen bg-paper flex flex-col pb-52">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line safe-top">
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
              <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
              {outOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold tracking-wide uppercase">Out of stock</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-medium text-blue">{listing.category}</span>
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

          <Link href={`/u/${listing.seller.username}`} className="flex items-center gap-2 mt-3 active:opacity-70">
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
            {listing.rating_count > 0 ? (
              <span className="flex items-center gap-1.5">
                <StarRow rating={Math.round(listing.rating_avg)} />
                {listing.rating_avg.toFixed(1)} ({listing.rating_count})
              </span>
            ) : (
              <span className="text-muted/70">No reviews yet</span>
            )}
            {listing.kind === 'gig' && <span>{listing.delivery_days}-day delivery</span>}
            {listing.kind === 'product' && (
              <span className={outOfStock ? 'text-red-400' : ''}>
                {listing.condition === 'new' ? 'New' : 'Used'} · {outOfStock ? 'Out of stock' : `${listing.stock} in stock`}
              </span>
            )}
          </div>

          <p className="text-sm text-fg/70 leading-relaxed mt-5">{listing.description}</p>

          {canRate && (
            <div className="mt-8 bg-mist border border-line rounded-2xl p-4 flex items-center justify-between">
              <span className="text-sm text-fg font-medium">Rate this {listing.kind === 'product' ? 'product' : listing.kind === 'request' ? 'request' : 'gig'}</span>
              <StarPicker value={myRating} onChange={handleRate} />
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-line">
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
                  className="w-full rounded-lg border border-line bg-mist px-3 py-2.5 text-sm text-fg placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
                />
                <button
                  type="submit"
                  disabled={posting || !newComment.trim()}
                  className="mt-3 bg-blue disabled:opacity-40 active:scale-[0.98] transition-transform text-black text-xs font-semibold rounded-lg px-5 py-2.5"
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
          className="fixed inset-x-0 z-20 bg-paper border-t border-line px-5 py-4 flex items-center justify-between"
          style={{ bottom: 'calc(4.25rem + env(safe-area-inset-bottom))' }}
        >
          <span className="font-display text-xl font-bold text-fg">
            {listing.currency} {listing.price.toLocaleString()}
          </span>
          {isOwnListing ? (
            <Link
              href={editHref}
              className="bg-mist border border-line active:scale-[0.98] transition-transform text-fg text-sm font-semibold rounded-lg px-6 py-3"
            >
              Edit listing
            </Link>
          ) : (
            <button
              onClick={handleMessageSeller}
              disabled={messaging || outOfStock}
              className="bg-blue disabled:opacity-50 active:scale-[0.98] transition-transform text-black text-sm font-semibold rounded-lg px-6 py-3"
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
