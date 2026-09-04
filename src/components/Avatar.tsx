const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api').replace(/\/api$/, '');

interface AvatarProps {
  avatar?: string | null;
  name: string;
  size?: number;
}

export default function Avatar({ avatar, name, size = 64 }: AvatarProps) {
  const px = `${size}px`;
  if (avatar) {
    return (
      <img
        src={avatar.startsWith('http') ? avatar : `${API_ORIGIN}${avatar}`}
        alt={name}
        style={{ width: px, height: px }}
        className="rounded-full object-cover shrink-0 border border-line"
      />
    );
  }
  return (
    <span
      style={{ width: px, height: px, fontSize: size * 0.35 }}
      className="rounded-full bg-blue text-white font-bold flex items-center justify-center shrink-0"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
