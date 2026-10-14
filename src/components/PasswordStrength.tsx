const LEVELS = [
  { label: 'Too short', bar: 'bg-red-400', text: 'text-red-400' },
  { label: 'Weak', bar: 'bg-amber-400', text: 'text-amber-400' },
  { label: 'Good', bar: 'bg-lime-400', text: 'text-lime-400' },
  { label: 'Strong', bar: 'bg-green-500', text: 'text-green-500' },
];

export default function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  const idx = value.length < 8 ? 0 : score <= 2 ? 1 : score === 3 ? 2 : 3;
  const level = LEVELS[idx];
  const missing = 8 - value.length;
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= idx ? level.bar : 'bg-line'}`} />
        ))}
      </div>
      <p className={`text-xs mt-1 ${level.text}`}>
        {level.label}
        {missing > 0 ? ` · ${missing} more character${missing === 1 ? '' : 's'}` : ''}
      </p>
    </div>
  );
}
