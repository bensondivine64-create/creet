import { getCookie, setCookie, hasConsent } from '@/lib/cookies';

export function captureAttribution() {
  if (typeof window === 'undefined') return;
  if (!hasConsent()) return;
  if (getCookie('creet_first_touch')) return; // only capture once, first visit

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  const referrer = document.referrer;

  const source = utmSource || (referrer ? new URL(referrer).hostname : 'direct');
  setCookie('creet_first_touch', source, 90);
}
