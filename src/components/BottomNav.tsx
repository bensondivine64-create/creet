'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function Icon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? '#FFFFFF' : '#8B98A5';
  const common = { fill: 'none', stroke, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (name === 'home') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" {...common}>
        <path d="M4 11l8-7 8 7M6 9.5V20h12V9.5" />
      </svg>
    );
  }
  if (name === 'inbox') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" {...common}>
        <path d="M3 6h18v12H3V6zm0 0l9 7 9-7" />
      </svg>
    );
  }
  if (name === 'search') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" {...common}>
        <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...common}>
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" />
    </svg>
  );
}

function postHrefForRole(role?: string) {
  if (role === 'freelancer') return '/post-gig';
  if (role === 'vendor') return '/post-product';
  if (role === 'buyer') return '/post-request';
  return null;
}

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  function homeHrefForRole(role?: string) {
    if (role === 'freelancer') return '/home/freelancer';
    if (role === 'vendor') return '/home/vendor';
    return '/browse';
  }

  const tabs = [
    { href: homeHrefForRole(user?.role), label: 'Home', icon: 'home' },
    { href: '/inbox', label: 'Inbox', icon: 'inbox' },
    { href: '/browse', label: 'Search', icon: 'search' },
    { href: user ? '/profile' : '/login', label: 'Profile', icon: 'profile' },
  ];

  const postHref = postHrefForRole(user?.role);

  return (
    <>
      {postHref && (
        <Link
          href={postHref}
          aria-label="Post"
          className="fixed bottom-20 right-5 z-30 h-14 w-14 rounded-full bg-blue shadow-lg shadow-black/40 flex items-center justify-center active:scale-95 transition-transform"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      )}
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-mist border-t border-line">
      <div className="max-w-2xl mx-auto grid grid-cols-4">
        {tabs.map((tab, i) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={i}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-1 py-2.5"
            >
              <Icon name={tab.icon} active={active} />
              <span className={`text-[10px] ${active ? 'text-blue font-medium' : 'text-muted'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}
