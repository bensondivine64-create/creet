import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-paper px-4 py-10 overflow-hidden">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #1546F5 0%, transparent 70%)' }}
      />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-ink">
            CREET
          </Link>
        </div>
        <div className="bg-mist border border-line rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
