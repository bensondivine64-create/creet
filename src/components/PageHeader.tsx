'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  icon?: ReactNode;
  backHref?: string;
  right?: ReactNode;
}

export default function PageHeader({ title, icon, backHref = '/browse', right }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-line/60 safe-top">
      <Link href={backHref} className="text-sm text-muted hover:text-fg transition-colors w-10">
        ← Back
      </Link>
      <div className="flex items-center gap-2">
        {icon && <span className="text-fg/70">{icon}</span>}
        <span className="font-display text-lg font-bold text-fg">{title}</span>
      </div>
      <div className="w-10 flex justify-end">{right}</div>
    </div>
  );
}
