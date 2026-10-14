const KEY = 'creet_saved_listings';

export interface SavedItem {
  id: number;
  title: string;
  image?: string;
  price: number;
  currency: string;
}

export function getSaved(): SavedItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function isSaved(id: number): boolean {
  return getSaved().some((x) => x.id === id);
}

export function toggleSaved(item: SavedItem): boolean {
  const list = getSaved();
  const exists = list.some((x) => x.id === item.id);
  const next = exists ? list.filter((x) => x.id !== item.id) : [item, ...list].slice(0, 100);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable
  }
  return !exists;
}

export function removeSaved(id: number) {
  try {
    localStorage.setItem(KEY, JSON.stringify(getSaved().filter((x) => x.id !== id)));
  } catch {
    // storage unavailable
  }
}
