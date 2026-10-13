const PREFIX = 'creet_search_history:';
const MAX = 8;

function read(scope: string): string[] {
  try {
    const raw = localStorage.getItem(PREFIX + scope);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function write(scope: string, items: string[]) {
  try {
    localStorage.setItem(PREFIX + scope, JSON.stringify(items));
  } catch {
    // storage unavailable
  }
}

export function getHistory(scope: string): string[] {
  return read(scope);
}

export function addHistory(scope: string, term: string) {
  const t = term.trim();
  if (t.length < 2) return;
  const lower = t.toLowerCase();
  const kept = read(scope).filter((x) => {
    const xl = x.toLowerCase();
    return xl !== lower && !lower.startsWith(xl);
  });
  write(scope, [t, ...kept].slice(0, MAX));
}

export function removeHistory(scope: string, term: string) {
  write(scope, read(scope).filter((x) => x !== term));
}

export function clearHistory(scope: string) {
  write(scope, []);
}
