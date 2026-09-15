'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { useEffect } from 'react';
import { getPremiumQuote } from '@/lib/payments';
import { writeCachedQuote } from '@/lib/premiumQuoteCache';
import BottomNav from '@/components/BottomNav';
import Avatar from '@/components/Avatar';
import VerifiedBadge from '@/components/VerifiedBadge';

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 11-12 0 6 6 0 0112 0zM9 9L3 15v3h3l6-6" />
    </svg>
  );
}

function ListBulletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    </svg>
  );
}

function BadgeCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m4 6H5a2 2 0 01-2-2V6a2 2 0 012-2h6" />
    </svg>
  );
}

interface RowProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent?: boolean;
  delay?: number;
}

function Row({ href, icon, title, subtitle, accent, delay = 0 }: RowProps) {
  return (
    <Link
      href={href}
      style={{ animationDelay: `${delay}ms` }}
      className="opacity-0 animate-fade-in-up flex items-center gap-4 py-4 border-b border-line/60 active:opacity-60 transition-opacity"
    >
      <span className={accent ? 'text-blue shrink-0' : 'text-fg/60 shrink-0'}>{icon}</span>
      <div className="min-w-0 flex-1">
        <div className={`text-sm ${accent ? 'text-blue font-semibold' : 'text-fg font-medium'}`}>{title}</div>
        <div className="text-xs text-muted mt-0.5 truncate">{subtitle}</div>
      </div>
      <span className="text-muted shrink-0">
        <Chevron />
      </span>
    </Link>
  );
}

export default function SettingsPage() {
  const { user, loading } = useRequireAnyAuth();
  const { logout } = useAuth();

  useEffect(() => {
    if (!user || user.is_premium) return;
    getPremiumQuote()
      .then((res) => writeCachedQuote(res.currency, res.amounts))
      .catch(() => {});
  }, [user]);

  if (loading || !user) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-black pb-24 animate-fade-in-up">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line/60">
        <Link href="/profile" className="text-sm text-muted hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-fg">Settings</span>
        <span className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        <Link href="/profile" className="flex flex-col items-center text-center mb-10 active:opacity-70 transition-opacity">
          <Avatar avatar={user.avatar} name={user.full_name} size={88} />
          <div className="flex items-center gap-1.5 mt-3">
            <span className="font-display text-lg font-bold text-fg">{user.full_name}</span>
            {user.verified_badge && <VerifiedBadge size={16} />}
          </div>
          <span className="text-sm text-muted mt-0.5">@{user.username}</span>
        </Link>

        <div>
          <Row href="/profile/edit" icon={<PersonIcon />} title="Edit profile" subtitle="Name, photo, bio, and categories" delay={0} />
          <Row href="/settings/notifications" icon={<BellIcon />} title="Notifications" subtitle="Push and email preferences" delay={20} />
          <Row href="/settings/account" icon={<KeyIcon />} title="Account & password" subtitle="Security and login details" delay={40} />
          <Row href="/settings/blocked" icon={<PersonIcon />} title="Blocked accounts" subtitle="Manage who you've blocked" delay={50} />

          {user.role === 'buyer' && (
            <Row href="/dashboard/buyer" icon={<ListBulletIcon />} title="Manage my requests" subtitle="View and edit your posted requests" delay={60} />
          )}

          {user.is_admin && (
            <Row href="/admin" icon={<ShieldIcon />} title="Admin System" subtitle="Manage users, listings, and reports" delay={80} />
          )}

          {!user.is_verified && (
            <Row
              href="/verify-identity"
              icon={<BadgeCheckIcon />}
              title="Get Verified"
              subtitle="Show buyers and sellers you're trustworthy"
              delay={100}
            />
          )}

          {!user.is_premium && (
            <Row
              href="/premium"
              icon={<StarIcon filled />}
              title="Get Premium"
              subtitle="Priority placement and a premium badge"
              accent
              delay={120}
            />
          )}

          {user.is_verified && user.is_premium && (
            <p className="text-sm text-muted text-center py-4">You&apos;re verified and on Premium. 🎉</p>
          )}
        </div>

        <button
          onClick={logout}
          style={{ animationDelay: '280ms' }}
          className="opacity-0 animate-fade-in-up w-full flex items-center gap-4 py-4 border-b border-line/60 active:opacity-60 transition-opacity mt-2"
        >
          <span className="text-red-400 shrink-0"><LogoutIcon /></span>
          <span className="text-red-400 font-medium text-sm">Log out</span>
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
