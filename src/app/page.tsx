import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-ink text-white">
      <Image
        src="/hero.jpg"
        alt=""
        fill
        priority
        className="object-cover"
      />

      {/* Dark scrim: light at top for the header, solid toward the bottom for text */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-6">
        <span className="text-xl font-bold tracking-tight">CREET</span>
        <Link
          href="/login"
          className="text-sm font-medium text-white/80 transition hover:text-white"
        >
          Log in
        </Link>
      </header>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-8 sm:px-10 sm:pb-12">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Choose your role.
        </h1>

        <p className="mt-3 max-w-sm text-base leading-relaxed text-white/70">
          One marketplace. Choose how you want to use it.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <RolePill href="/freelancer/signup" label="I'm a Freelancer" />
          <RolePill href="/buyer/signup" label="I'm a Buyer" />
        </div>

        <div className="mt-3">
          <RolePill href="/vendor/signup" label="I'm a Vendor" full />
        </div>

        <p className="mt-5 text-center text-xs text-white/50">
          Already have an account?{' '}
          <Link href="/login" className="text-white/80 underline underline-offset-2 hover:text-white">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

function RolePill({
  href,
  label,
  full = false,
}: {
  href: string;
  label: string;
  full?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-5 py-4 text-center text-sm font-semibold backdrop-blur-sm transition hover:border-blue hover:bg-white/10 sm:text-base ${
        full ? 'w-full' : ''
      }`}
    >
      {label}
    </Link>
  );
}
