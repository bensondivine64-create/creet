'use client';

import { useEffect, useState } from 'react';

export default function AppEnhancements() {
  const [online, setOnline] = useState(true);
  const [justBack, setJustBack] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const goOnline = () => {
      setOnline(true);
      setJustBack(true);
      timer = setTimeout(() => setJustBack(false), 2000);
    };
    const goOffline = () => {
      setOnline(false);
      setJustBack(false);
    };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (!coarse || !('vibrate' in navigator)) return;
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest('button, a[href], [role="button"]');
      if (!el || (el as HTMLButtonElement).disabled) return;
      try {
        navigator.vibrate(8);
      } catch {
        // vibration unsupported
      }
    }
    document.addEventListener('click', onClick, { passive: true });
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const RAW = /\/image\/upload\/f_auto,q_auto,w_\d+,c_limit\//;
    function onImgError(e: Event) {
      const img = e.target;
      if (!(img instanceof HTMLImageElement)) return;
      if (img.dataset.managed === '1') return;
      if (!img.dataset.retried && RAW.test(img.src)) {
        img.dataset.retried = '1';
        img.src = img.src.replace(RAW, '/image/upload/');
        return;
      }
      img.style.visibility = 'hidden';
    }
    function onImgLoad(e: Event) {
      const img = e.target;
      if (img instanceof HTMLImageElement && img.style.visibility === 'hidden') img.style.visibility = '';
    }
    document.addEventListener('error', onImgError, true);
    document.addEventListener('load', onImgLoad, true);
    return () => {
      document.removeEventListener('error', onImgError, true);
      document.removeEventListener('load', onImgLoad, true);
    };
  }, []);

  if (online && !justBack) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-0 inset-x-0 z-[200] text-center text-xs font-semibold py-2 safe-top ${
        online ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
      }`}
    >
      {online ? 'Back online' : "You're offline. Some things won't load."}
    </div>
  );
}
