const WRENCH = 'M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6z';
const CODE = 'M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14';
const PEN = 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z';
const TEXT = 'M4 6h16M4 10h16M4 14h10M4 18h7';
const GLOBE = 'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18';
const MEGAPHONE = 'M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1zM16 8a5 5 0 010 8';
const CHART = 'M4 20V10M10 20V4M16 20v-8M22 20H2';
const MAIL = 'M3 6h18v12H3zM3 6l9 7 9-7';
const VIDEO = 'M2 6h13a2 2 0 012 2v8a2 2 0 01-2 2H2a1 1 0 01-1-1V7a1 1 0 011-1zM17 10l5-3v10l-5-3';
const MUSIC = 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z';
const MIC = 'M12 3a3 3 0 013 3v6a3 3 0 01-6 0V6a3 3 0 013-3zM5 11a7 7 0 0014 0M12 18v3';
const PHONE = 'M8 2h8a1 1 0 011 1v18a1 1 0 01-1 1H8a1 1 0 01-1-1V3a1 1 0 011-1zM11 18h2';
const LAPTOP = 'M4 6h16v10H4zM2 20h20';
const HEADPHONES = 'M4 15v-3a8 8 0 0116 0v3M4 15h3v5H5a1 1 0 01-1-1v-4zM20 15h-3v5h2a1 1 0 001-1v-4z';
const HANGER = 'M12 6a2 2 0 10-2-2M12 6v2l8 6a1 1 0 01-.6 1.8H4.6A1 1 0 014 14l8-6';
const BAG = 'M6 8h12l1 12H5L6 8zM9 8V6a3 3 0 016 0v2';
const SCISSORS = 'M6 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM8.1 7.9L20 20M8.1 16.1L20 4';
const SOFA = 'M5 11V8a2 2 0 012-2h10a2 2 0 012 2v3M3 13a2 2 0 014 0v2h10v-2a2 2 0 014 0v5H3v-5zM6 18v2M18 18v2';
const HOME = 'M4 11l8-7 8 7M6 9.5V20h12V9.5';
const CALC = 'M6 3h12a1 1 0 011 1v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1zM8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01';
const BRIEFCASE = 'M4 8h16v11H4zM9 8V6a1 1 0 011-1h4a1 1 0 011 1v2M4 13h16';
const USER = 'M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0';
const SEARCH = 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z';
const GRID = 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z';

const ICONS: { keys: string[]; d: string }[] = [
  { keys: ['bug', 'fix', 'maintenance'], d: WRENCH },
  { keys: ['website', 'web app'], d: CODE },
  { keys: ['logo', 'brand', 'ui/ux'], d: PEN },
  { keys: ['blog', 'writing', 'descriptions'], d: TEXT },
  { keys: ['translat'], d: GLOBE },
  { keys: ['social media'], d: MEGAPHONE },
  { keys: ['seo', 'marketing'], d: CHART },
  { keys: ['email'], d: MAIL },
  { keys: ['video'], d: VIDEO },
  { keys: ['music'], d: MUSIC },
  { keys: ['voice'], d: MIC },
  { keys: ['phone'], d: PHONE },
  { keys: ['laptop'], d: LAPTOP },
  { keys: ['accessor'], d: HEADPHONES },
  { keys: ['dress'], d: HANGER },
  { keys: ['bag'], d: BAG },
  { keys: ['tailor'], d: SCISSORS },
  { keys: ['furniture'], d: SOFA },
  { keys: ['interior', 'organiz'], d: HOME },
  { keys: ['bookkeep'], d: CALC },
  { keys: ['business plan', 'office'], d: BRIEFCASE },
  { keys: ['assistant'], d: USER },
  { keys: ['research'], d: SEARCH },
];

function pickIcon(label: string): string {
  const l = label.toLowerCase();
  for (const it of ICONS) {
    if (it.keys.some((k) => l.includes(k))) return it.d;
  }
  return GRID;
}

export default function TileArt({ label }: { label: string }) {
  const d = pickIcon(label);
  return (
    <>
      <span className="absolute inset-0 bg-black/20" />
      <span
        className="absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '12px 12px' }}
      />
      <span className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
      <svg
        className="absolute -bottom-4 -right-4 text-white/15"
        width="84"
        height="84"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: 'rotate(-12deg)' }}
        aria-hidden="true"
      >
        <path d={d} />
      </svg>
      <span className="absolute top-3 left-3 h-8 w-8 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d={d} />
        </svg>
      </span>
    </>
  );
}
