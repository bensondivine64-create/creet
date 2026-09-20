'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPublicProfile, PublicProfile } from '@/lib/profile';
import VerifiedBadge from '@/components/VerifiedBadge';
import RecruiterBadge from '@/components/RecruiterBadge';
import EmptyState from '@/components/EmptyState';
import Avatar from '@/components/Avatar';
import ReportModal from '@/components/ReportModal';
import PageLoader from '@/components/PageLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getConnectionStatus, sendConnectionRequest, acceptConnection, declineConnection, ConnectionStatus } from '@/lib/connections';
import { getBlockStatus, blockUser, unblockUser } from '@/lib/blocks';
import FollowButton from '@/components/FollowButton';

function buildHeadline(role: string, categories: string[], location?: string | null) {
  const parts = [role.charAt(0).toUpperCase() + role.slice(1)];
  if (categories.length > 0) parts.push(categories[0]);
  if (location) parts.push(location);
  return parts.join(' · ');
}

function formatJoined(iso?: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  return `Joined ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  );
}

function MoreMenu({
  onReport,
  onBlock,
  isBlocked,
  blockLoading,
}: {
  onReport: () => void;
  onBlock: () => void;
  isBlocked: boolean;
  blockLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="More options"
        className="h-8 w-8 rounded-full bg-mist border border-line flex items-center justify-center text-muted hover:text-fg active:scale-95 transition-transform"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-30 w-44 bg-mist border border-line rounded-xl overflow-hidden shadow-lg shadow-black/50">
            <button
              onClick={() => { setOpen(false); onReport(); }}
              className="w-full text-left px-4 py-3 text-sm text-fg active:bg-black/50"
            >
              Report user
            </button>
            <button
              onClick={() => { setOpen(false); onBlock(); }}
              disabled={blockLoading}
              className="w-full text-left px-4 py-3 text-sm text-red-400 active:bg-black/50 border-t border-line disabled:opacity-50"
            >
              {blockLoading ? 'Working...' : isBlocked ? 'Unblock user' : 'Block user'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReport, setShowReport] = useState(false);
  const { user: viewer } = useAuth();
  const { showToast } = useToast();
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('none');
  const [connId, setConnId] = useState<number | undefined>(undefined);
  const [connLoading, setConnLoading] = useState(false);

  const [iBlockedThem, setIBlockedThem] = useState(false);
  const [theyBlockedMe, setTheyBlockedMe] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  useEffect(() => {
    getPublicProfile(username)
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load profile'))
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (!profile || !viewer || viewer.username === profile.username) return;
    getConnectionStatus(profile.id).then((res) => {
      setConnStatus(res.status);
      setConnId(res.connection_id);
    }).catch(() => {});
    getBlockStatus(profile.id).then((res) => {
      setIBlockedThem(res.i_blocked_them);
      setTheyBlockedMe(res.they_blocked_me);
    }).catch(() => {});
  }, [profile, viewer]);

  async function handleConnect() {
    if (!profile) return;
    setConnLoading(true);
    try {
      await sendConnectionRequest(profile.id);
      setConnStatus('pending_sent');
    } finally {
      setConnLoading(false);
    }
  }

  async function handleAccept() {
    if (!connId) return;
    setConnLoading(true);
    try {
      await acceptConnection(connId);
      setConnStatus('connected');
    } finally {
      setConnLoading(false);
    }
  }

  async function handleDecline() {
    if (!connId) return;
    setConnLoading(true);
    try {
      await declineConnection(connId);
      setConnStatus('none');
    } finally {
      setConnLoading(false);
    }
  }

  async function handleToggleBlock() {
    if (!profile) return;
    setBlockLoading(true);
    try {
      if (iBlockedThem) {
        await unblockUser(profile.id);
        setIBlockedThem(false);
        showToast('User unblocked', 'success');
      } else {
        await blockUser(profile.id);
        setIBlockedThem(true);
        showToast('User blocked', 'success');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update block status', 'error');
    } finally {
      setBlockLoading(false);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-black">
        <EmptyState icon="search" title="Profile not found" subtitle="This user may not exist." />
      </main>
    );
  }

  const headline = buildHeadline(profile.role, profile.categories, profile.location);
  const joined = formatJoined(profile.created_at);
  const isOwnProfile = viewer && viewer.username === profile.username;

  return (
    <main className="min-h-screen bg-black pb-16 animate-fade-in-up">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line/60 relative z-10 bg-black safe-top">
        <Link href="/browse" className="text-sm text-muted hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold tracking-tight text-fg">CREET</span>
        {viewer && !isOwnProfile ? (
          <MoreMenu
            onReport={() => setShowReport(true)}
            onBlock={handleToggleBlock}
            isBlocked={iBlockedThem}
            blockLoading={blockLoading}
          />
        ) : (
          <span className="w-10" />
        )}
      </div>

      <div className="relative">
        <div className="h-36 bg-mist relative overflow-hidden">
          {profile.cover_photo && (
            <img src={profile.cover_photo} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="max-w-2xl mx-auto px-5">
          <div className="relative -mt-11">
            <div className="rounded-full ring-4 ring-black inline-block">
              <Avatar avatar={profile.avatar} name={profile.full_name} size={88} />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-xl font-bold text-fg truncate">{profile.full_name}</h1>
              {profile.verified_badge && <VerifiedBadge size={16} />}
              {profile.is_recruiter && <RecruiterBadge size={16} />}
            </div>
            <div className="text-sm text-muted">@{profile.username}</div>
            <div className="text-sm text-fg/70 mt-1">{headline}</div>

            {profile.short_bio && (
              <p className="text-sm text-fg/80 mt-2.5 leading-relaxed">{profile.short_bio}</p>
            )}

            <div className="flex items-center gap-3 mt-3 text-sm text-muted">
              {joined && (
                <span className="flex items-center gap-1.5">
                  <CalendarIcon /> {joined}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="text-sm">
                <span className="font-semibold text-fg">{profile.connection_count}</span>{' '}
                <span className="text-muted">connection{profile.connection_count === 1 ? '' : 's'}</span>
              </div>

              {viewer && !isOwnProfile && profile.verified_badge && (
                <FollowButton userId={profile.id} />
              )}
            </div>
          </div>

          {viewer && !isOwnProfile && iBlockedThem && (
            <div className="mt-4 bg-mist border border-line rounded-lg py-3 text-center">
              <p className="text-sm text-muted mb-2">You&apos;ve blocked this user</p>
              <button
                onClick={handleToggleBlock}
                disabled={blockLoading}
                className="text-sm text-fg underline underline-offset-2"
              >
                {blockLoading ? 'Working...' : 'Unblock'}
              </button>
            </div>
          )}

          {viewer && !isOwnProfile && !iBlockedThem && !theyBlockedMe && (
            <div className="mt-5">
              {connStatus === 'none' && (
                <button
                  onClick={handleConnect}
                  disabled={connLoading}
                  className="w-full bg-blue disabled:opacity-50 text-black text-sm font-semibold rounded-full py-3"
                >
                  {connLoading ? 'Sending...' : 'Connect'}
                </button>
              )}
              {connStatus === 'pending_sent' && (
                <div className="w-full border border-line text-muted text-sm font-semibold rounded-full py-2.5 text-center">
                  Request sent
                </div>
              )}
              {connStatus === 'pending_received' && (
                <div className="flex gap-2">
                  <button
                    onClick={handleAccept}
                    disabled={connLoading}
                    className="flex-1 bg-blue disabled:opacity-50 text-black text-sm font-semibold rounded-full py-3"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={connLoading}
                    className="flex-1 border border-line text-fg text-sm font-semibold rounded-full py-3"
                  >
                    Decline
                  </button>
                </div>
              )}
              {connStatus === 'connected' && (
                <div className="w-full border border-line text-fg text-sm font-semibold rounded-full py-2.5 text-center">
                  ✓ Connected
                </div>
              )}
            </div>
          )}

          {profile.categories.length > 0 && (
            <div className="mt-6 pt-6 border-t border-line/60">
              <h2 className="font-display text-base font-bold text-fg mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.categories.map((cat) => (
                  <span key={cat} className="px-3 py-1 rounded-md text-xs font-medium border border-line text-fg/70">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-display font-bold text-fg text-lg mb-4">
              {profile.role === 'vendor' ? 'Products' : 'Gigs'}
            </h2>

            {profile.listings.length === 0 && (
              <EmptyState icon="listing" title="Nothing posted yet" />
            )}

            {profile.listings.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {profile.listings.map((item) => (
                  <Link
                    key={item.id}
                    href={`/listing/${item.id}`}
                    className="block ripple card-elevated bg-mist border border-line rounded-2xl overflow-hidden shadow-lg shadow-black/30 active:scale-[0.98] transition-transform"
                  >
                    <div className="aspect-video bg-line/20 overflow-hidden">
                      {item.images && item.images.length > 0 && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-semibold text-fg leading-snug line-clamp-2 mb-1.5">
                        {item.title}
                      </div>
                      <div className="text-xs text-muted">
                        From <span className="text-sm font-bold text-fg">{item.currency} {item.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showReport && (
        <ReportModal targetType="user" targetId={profile.id ?? 0} onClose={() => setShowReport(false)} />
      )}
    </main>
  );
}
