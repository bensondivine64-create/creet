'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavProgress() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  useEffect(() => {
    clearTimers();
    setWidth(100);
    timers.current.push(setTimeout(() => { setVisible(false); setWidth(0); }, 220));
    return clearTimers;
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      clearTimers();
      setVisible(true);
      setWidth(12);
      timers.current.push(setTimeout(() => setWidth(45), 120));
      timers.current.push(setTimeout(() => setWidth(75), 700));
      timers.current.push(setTimeout(() => setWidth(90), 2000));
      timers.current.push(setTimeout(() => { setVisible(false); setWidth(0); }, 8000));
    }
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-[300] h-0.5 bg-white/80"
      style={{ width: `${width}%`, transition: 'width 0.3s ease' }}
    />
  );
}
