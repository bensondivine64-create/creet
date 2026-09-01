import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-ink">
            CREET
          </Link>
        </div>
        <div className="bg-white border border-line rounded-2xl shadow-sm p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
