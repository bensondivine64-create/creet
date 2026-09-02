'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; 'expired-callback'?: () => void }
      ) => number;
    };
  }
}

interface RecaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export default function Recaptcha({ onVerify, onExpire }: RecaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    function tryInit() {
      if (cancelled) return;
      if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
        window.grecaptcha.ready(() => {
          if (cancelled) return;
          if (containerRef.current && widgetId.current === null) {
            widgetId.current = window.grecaptcha.render(containerRef.current, {
              sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
              theme: 'dark',
              callback: onVerify,
              'expired-callback': onExpire,
            });
          }
        });
      } else {
        setTimeout(tryInit, 300);
      }
    }

    tryInit();
    return () => {
      cancelled = true;
    };
  }, [onVerify, onExpire]);

  return (
    <>
      <Script src="https://www.google.com/recaptcha/api.js" strategy="afterInteractive" />
      <div ref={containerRef} />
    </>
  );
}
