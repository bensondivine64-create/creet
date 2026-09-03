export function SkeletonCard() {
  return (
    <div className="aspect-[4/5] rounded-2xl bg-mist animate-pulse" />
  );
}

export function SkeletonRow() {
  return (
    <div className="bg-mist rounded-xl px-4 py-3.5 animate-pulse">
      <div className="h-4 w-2/3 bg-line rounded" />
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
