import Link from 'next/link';

interface EmptyStateProps {
  icon: 'inbox' | 'search' | 'listing' | 'bell';
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

function StateIcon({ icon }: { icon: EmptyStateProps['icon'] }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (icon === 'inbox') {
    return (
      <svg {...common}>
        <path d="M3 6h18v12H3V6zm0 0l9 7 9-7" />
      </svg>
    );
  }
  if (icon === 'search') {
    return (
      <svg {...common}>
        <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
    );
  }
  if (icon === 'bell') {
    return (
      <svg {...common}>
        <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h16M4 4h16v16H4V4z" />
    </svg>
  );
}

export default function EmptyState({ icon, title, subtitle, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-14 w-14 rounded-full bg-mist flex items-center justify-center text-ink/40 mb-4">
        <StateIcon icon={icon} />
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {subtitle && <p className="text-sm text-ink/50 mt-1 max-w-xs">{subtitle}</p>}
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-4 text-sm font-semibold text-blue hover:underline"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
