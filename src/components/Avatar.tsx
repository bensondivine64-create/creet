import { optimizeImg } from '@/lib/img';
interface AvatarProps {
  avatar?: string | null;
  name: string;
  size?: number;
}

export default function Avatar({ avatar, name, size = 32 }: AvatarProps) {
  const style = { width: size, height: size };

  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={optimizeImg(avatar, Math.max(size * 2, 64))}
        alt={name}
        style={style}
        className="rounded-full object-cover shrink-0 border border-line"
      />
    );
  }

  return (
    <span
      style={style}
      className="rounded-full bg-blue text-black font-bold flex items-center justify-center shrink-0 border border-line"
    >
      <span style={{ fontSize: size * 0.4 }}>{name.charAt(0).toUpperCase()}</span>
    </span>
  );
}
