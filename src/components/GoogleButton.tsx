'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface GoogleButtonProps {
  onCredential: (credential: string) => void;
}

export default function GoogleButton({ onCredential }: GoogleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    let cancelled = false;

    function tryInit() {
      if (cancelled || initialized.current) return;
      if (window.google && containerRef.current) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: (response) => onCredential(response.credential),
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
        });
        initialized.current = true;
      } else {
        setTimeout(tryInit, 300);
      }
    }

    tryInit();
    return () => {
      cancelled = true;
    };
  }, [onCredential]);

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <div ref={containerRef} className="flex justify-center" />
    </>
  );
}
