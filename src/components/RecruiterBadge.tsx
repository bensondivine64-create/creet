export default function RecruiterBadge({ size = 14 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center shrink-0 bg-fg text-black rounded-full font-semibold"
      style={{ fontSize: size * 0.7, padding: `${size * 0.2}px ${size * 0.55}px` }}
    >
      Recruiter
    </span>
  );
}
