'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getListing } from '@/lib/listings';
import { getComments, postComment } from '@/lib/comments';
import { startConversation } from '@/lib/messages';
import { Listing } from '@/types/listing';
import { Comment } from '@/types/comment';
import { useAuth } from '@/contexts/AuthContext';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messaging, setMessaging] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    getListing(params.id as string)
      .then((data) => setListing(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load listing'))
      .finally(() => setLoading(false));

    setCommentsLoading(true);
    getComments(params.id as string)
      .then((res) => setComments(res.comments))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
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
      alert(err instanceof Error ? err.message : 'Could not start conversation');
    } finally {
      setMessaging(false);
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
      setNewComment('');
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Could not post comment');
    } finally {
      setPosting(false);
    }
  }

  const ctaLabel = listing?.kind === 'request' ? 'Send proposal' : 'Message seller';

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <Link href="/browse" className="text-sm text-fg/50 hover:text-fg transition-colors">
          ← Back
        </Link>
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-fg">
          CREET
        </Link>
        <span className="w-10" />
      </div>

      {loading && <p className="text-sm text-fg/40 text-center py-24">Loading...</p>}

      {!loading && error && (
        <p className="text-sm text-fg/40 text-center py-24">
          This listing couldn&apos;t be found.
        </p>
      )}

      {!loading && !error && listing && (
        <div className="max-w-2xl mx-auto w-full px-5 py-6 flex-1">
          <div className="aspect-[4/3] rounded-2xl bg-mist flex items-center justify-center mb-5">
            <svg
              className="h-10 w-10 text-fg/15"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h16M4 4h16v16H4V4z"
              />
            </svg>
          </div>

          <span className="text-xs font-medium text-blue">{listing.category}</span>
          <h1 className="font-display text-2xl font-bold text-fg mt-1">{listing.title}</h1>

          <div className="flex items-center gap-2 mt-3">
            <span className="h-8 w-8 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center shrink-0">
              {listing.seller.full_name.charAt(0).toUpperCase()}
            </span>
            <div>
              <div className="text-sm font-medium text-fg flex items-center gap-1">
                {listing.seller.full_name}
                {listing.seller.verified && <span className="text-blue">✓</span>}
              </div>
              <div className="text-xs text-fg/40">@{listing.seller.username}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-fg/50">
            <span>★ {listing.rating_avg.toFixed(1)} ({listing.rating_count} reviews)</span>
            {listing.kind === 'gig' && <span>{listing.delivery_days}-day delivery</span>}
            {listing.kind === 'product' && (
              <span>{listing.condition === 'new' ? 'New' : 'Used'} · {listing.stock} in stock</span>
            )}
          </div>

          <p className="text-sm text-fg/70 leading-relaxed mt-5">{listing.description}</p>

          <div className="mt-8 pt-6 border-t border-line">
            <h2 className="font-display font-semibold text-fg mb-4">
              Comments {comments.length > 0 && `(${comments.length})`}
            </h2>

            {user ? (
              <form onSubmit={handlePostComment} className="mb-6">
                {commentError && (
                  <p className="text-xs text-red-400 mb-2">{commentError}</p>
                )}
                <div className="flex items-start gap-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ask a question or leave a comment..."
                    rows={2}
                    className="flex-1 rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg placeholder:text-fg/30 resize-none focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={posting || !newComment.trim()}
                  className="mt-2 bg-ink hover:bg-ink/80 disabled:opacity-40 text-white text-xs font-semibold rounded-lg px-4 py-2 transition-colors"
                >
                  {posting ? 'Posting...' : 'Post comment'}
                </button>
              </form>
            ) : (
              <p className="text-sm text-fg/50 mb-6">
                <Link href="/login" className="text-blue font-medium hover:underline">
                  Log in
                </Link>{' '}
                to leave a comment.
              </p>
            )}

            {commentsLoading && <p className="text-sm text-fg/40">Loading comments...</p>}

            {!commentsLoading && comments.length === 0 && (
              <p className="text-sm text-fg/40">No comments yet.</p>
            )}

            {!commentsLoading && comments.length > 0 && (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <span className="h-7 w-7 rounded-full bg-mist text-fg text-[11px] font-bold flex items-center justify-center shrink-0">
                      {c.author.full_name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-fg flex items-center gap-1">
                        {c.author.full_name}
                        {c.author.verified && <span className="text-blue">✓</span>}
                      </div>
                      <div className="text-sm text-fg/70 mt-0.5">{c.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 mt-8 -mx-5 px-5 py-4 bg-paper border-t border-line flex items-center justify-between">
            <span className="font-display text-xl font-bold text-fg">
              {listing.currency} {listing.price.toLocaleString()}
            </span>
            <button
              onClick={handleMessageSeller}
              disabled={messaging}
              className="bg-blue hover:bg-blue-deep disabled:opacity-50 text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors"
            >
              {messaging ? 'Opening...' : ctaLabel}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
