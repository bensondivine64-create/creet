'use client';

import { useEffect, useState } from 'react';

export default function IntroSplash() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('creet_intro_seen')) {
      setVisible(false);
      return;
    }
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      sessionStorage.setItem('creet_intro_seen', '1');
      setVisible(false);
      return;
    }
    const exitTimer = setTimeout(() => setExiting(true), 1100);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('creet_intro_seen', '1');
    }, 1500);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink ${
        exiting ? 'animate-splash-out' : ''
      }`}
    >
      <span className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight animate-splash-wordmark">
        CREET
      </span>
      <span className="mt-2 text-xs text-white/50 animate-splash-tagline">
        Start your career with us
      </span>
    </div>
  );
}
