export default function VerifiedBadge({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="inline-block shrink-0"
      aria-label="Verified"
    >
      <path
        d="M12 1.5l2.6 1.4 2.9-.6 1.4 2.6 2.6 1.4-.6 2.9L22 12l-1.1 2.8.6 2.9-2.6 1.4-1.4 2.6-2.9-.6L12 22.5l-2.6-1.4-2.9.6-1.4-2.6-2.6-1.4.6-2.9L2 12l1.1-2.8-.6-2.9 2.6-1.4 1.4-2.6 2.9.6L12 1.5z"
        fill="#1546F5"
      />
      <path
        d="M8.3 12.3l2.4 2.4 5-5.4"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
