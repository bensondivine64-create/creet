import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-8 text-center">
      <div className="font-display text-5xl font-bold text-fg/20 mb-3">404</div>
      <h1 className="font-display text-xl font-bold text-fg mb-1.5">Page not found</h1>
      <p className="text-sm text-muted max-w-xs mb-6">The page you're looking for doesn't exist or has moved.</p>
      <Link href="/browse" className="ripple btn-elevated bg-blue text-black text-sm font-semibold rounded-xl px-6 py-3 active:scale-[0.97] transition-transform">
        Back to browse
      </Link>
    </main>
  );
}
