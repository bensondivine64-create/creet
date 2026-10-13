const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');

export default function FileAttachment({ url, name }: { url: string; name?: string | null }) {
  const href = url.startsWith('/') ? API_ORIGIN + url : url;
  const label = name || 'Attachment';
  const ext = (label.includes('.') ? label.split('.').pop() || 'FILE' : 'FILE').slice(0, 4).toUpperCase();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="ripple mt-3 flex items-center gap-3 rounded-xl border border-line bg-black/40 px-3 py-2.5 active:scale-[0.98] transition-transform"
    >
      <span className="h-9 w-9 shrink-0 rounded-lg bg-mist border border-line flex items-center justify-center text-[10px] font-bold text-fg/70">
        {ext}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-fg truncate">{label}</span>
        <span className="block text-xs text-muted">Tap to open</span>
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="text-muted shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" />
      </svg>
    </a>
  );
}
