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
    const exitTimer = setTimeout(() => setExiting(true), 1000);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('creet_intro_seen', '1');
    }, 1500);
    // exit animation is 0.5s (see tailwind.config.js), starts at 1000ms -> ends at 1500ms, matching hideTimer
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black ${
        exiting ? 'animate-splash-out' : ''
      }`}
    >
      <span className="font-display text-5xl sm:text-6xl font-bold text-white tracking-tight animate-splash-wordmark">
        CREET
      </span>
      <span className="mt-2 text-xs text-white/50 animate-splash-tagline">
        Start your career with us
      </span>
    </div>
  );
}
