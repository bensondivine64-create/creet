import Link from 'next/link';
import IntroSplash from '@/components/IntroSplash';

const roles = [
  {
    key: 'buyer',
    name: 'Buyer',
    desc: 'Browse products and freelancers, message sellers directly.',
  },
  {
    key: 'freelancer',
    name: 'Freelancer',
    desc: 'Offer your skills, manage jobs, and get paid.',
  },
  {
    key: 'vendor',
    name: 'Vendor',
    desc: 'Open a storefront and sell physical products.',
  },
];

export default function HomePage() {
  return (
    <>
      <IntroSplash />
      <main className="min-h-screen bg-paper flex flex-col">
        <header className="border-b border-line">
          <div className="max-w-2xl mx-auto px-5 py-5 flex items-center justify-between">
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              CREET
            </span>
            <Link
              href="/login"
              className="text-sm font-medium text-ink/60 hover:text-blue transition-colors"
            >
              Log in
            </Link>
          </div>
        </header>

        <section className="max-w-2xl mx-auto w-full px-5 pt-14 pb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight">
            Get hired. Get paid.
            <br />
            Get it sold.
          </h1>
          <p className="mt-4 text-ink/60 text-base leading-relaxed max-w-md">
            One platform for buyers, freelancers, and vendors — every deal
            handled through a single inbox.
          </p>
        </section>

        <section className="max-w-2xl mx-auto w-full px-5 pb-16 flex-1">
          <span className="text-sm text-ink/50">Choose your path</span>

          <div className="mt-3 space-y-3">
            {roles.map((r) => (
              <Link
                key={r.key}
                href={`/${r.key}/signup`}
                className="block border border-line rounded-xl px-4 py-4 hover:border-ink transition-colors"
              >
                <div className="font-semibold text-ink">{r.name}</div>
                <div className="text-sm text-ink/50 mt-0.5">{r.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="border-t border-line">
          <div className="max-w-2xl mx-auto px-5 py-6">
            <span className="text-xs text-ink/30">© 2026 CREET</span>
          </div>
        </footer>
      </main>
    </>
  );
}
