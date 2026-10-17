'use client';
// nav-v2

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiCall } from '@/lib/api';
import Avatar from '@/components/Avatar';

type IconName = 'home' | 'inbox' | 'connections' | 'feed' | 'profile';

function Icon({ name }: { name: IconName }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
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
  if (name === 'connections') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" {...common}>
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="16" r="3" />
        <path d="M10.1 9.9L13.9 14.1" />
      </svg>
    );
  }
  if (name === 'feed') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" {...common}>
        <path d="M4 6h16M4 12h16M4 18h10" />
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

function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        if (Math.abs(delta) > 6) {
          setHidden(delta > 0 && y > 80);
          lastY.current = y;
        }
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return hidden;
}

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const fabHidden = useHideOnScroll();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    const load = () =>
      apiCall<{ count: number }>('/conversations/unread-count')
        .then((r) => {
          if (alive) setUnread(r.count);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 45000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [user, pathname]);

  const tabs: { href: string; label: string; icon: IconName; match: string[] }[] = [
    { href: '/browse', label: 'Home', icon: 'home', match: ['/browse', '/search', '/listing'] },
    { href: '/inbox', label: 'Inbox', icon: 'inbox', match: ['/inbox'] },
    { href: '/connections', label: 'Connect', icon: 'connections', match: ['/connections', '/people'] },
    { href: '/feed', label: 'My Feed', icon: 'feed', match: ['/feed'] },
    { href: user ? '/profile' : '/login', label: 'Profile', icon: 'profile', match: ['/profile', '/settings'] },
  ];

  const postHref = pathname.startsWith('/listing/') ? null : postHrefForRole(user?.role);

  return (
    <>
      {postHref && (
        <Link
          href={postHref}
          aria-label={pathname === '/feed' ? 'Write a post' : 'Post'}
          onClick={(e) => {
            if (pathname === '/feed') {
              e.preventDefault();
              window.dispatchEvent(new Event('creet:compose'));
            }
          }}
          className={`fixed right-5 z-30 h-14 w-14 rounded-full bg-fg ring-1 ring-white/20 shadow-lg shadow-black/60 flex items-center justify-center active:scale-95 transition-all duration-200 ${
            fabHidden ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'
          }`}
          style={{ bottom: 'calc(5.75rem + env(safe-area-inset-bottom))' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={2.2} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      )}

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 px-4 pointer-events-none"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div
          className="pointer-events-auto mx-auto max-w-md rounded-full header-blur border border-white/10 px-2 py-2 flex items-center justify-between"
          style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          {tabs.map((tab) => {
            const active = tab.match.some((m) => pathname === m || pathname.startsWith(m + '/'));
            const exact = pathname === tab.href;
            return (
              <Link
                key={tab.label}
                href={tab.href}
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
                onClick={(e) => {
                  if (exact) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`relative flex h-11 items-center justify-center gap-1.5 rounded-full transition-all duration-200 active:scale-[0.94] ${
                  active ? 'nav-pop bg-white text-black px-4' : 'text-muted hover:text-fg px-3.5'
                }`}
              >
                <span className="relative flex items-center">
                  {tab.icon === 'profile' && user?.avatar ? (
                    <span className={`block rounded-full ${active ? 'ring-2 ring-black/70' : 'ring-1 ring-white/20'}`}>
                      <Avatar avatar={user.avatar} name={user.full_name} size={24} />
                    </span>
                  ) : (
                    <Icon name={tab.icon} />
                  )}
                  {tab.icon === 'inbox' && unread > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </span>
                {active && <span className="text-xs font-semibold whitespace-nowrap">{tab.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
