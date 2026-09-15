'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCookie, setCookie } from '@/lib/cookies';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookie('creet_cookie_consent')) {
      setVisible(true);
    }
  }, []);

  function accept() {
    setCookie('creet_cookie_consent', 'accepted');
    setVisible(false);
  }

  function decline() {
    setCookie('creet_cookie_consent', 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-mist border-t border-line px-5 py-4 animate-fade-in-up">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs text-fg/70 leading-relaxed mb-3">
          CREET uses cookies to keep you signed in and remember your preferences. See our{' '}
          <Link href="/privacy" className="text-fg underline underline-offset-2">Privacy Policy</Link> for details.
        </p>
        <div className="flex gap-2">
          <button
            onClick={decline}
            className="flex-1 border border-line text-fg/70 text-xs font-semibold rounded-lg py-2.5 active:scale-[0.98] transition-transform"
          >
            Essential only
          </button>
          <button
            onClick={accept}
            className="flex-1 bg-blue text-black text-xs font-semibold rounded-lg py-2.5 active:scale-[0.98] transition-transform"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
