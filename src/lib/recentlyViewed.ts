const KEY = 'creet_recently_viewed';
const MAX = 10;

export interface ViewedItem {
  id: number;
  title: string;
  image?: string;
  price: number;
  currency: string;
}

export function getRecentlyViewed(): ViewedItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function rememberViewed(l: { id: number; title: string; images?: string[] | null; price: number; currency: string }) {
  try {
    const item: ViewedItem = { id: l.id, title: l.title, image: l.images?.[0], price: l.price, currency: l.currency };
    const rest = getRecentlyViewed().filter((x) => x.id !== l.id);
    localStorage.setItem(KEY, JSON.stringify([item, ...rest].slice(0, MAX)));
  } catch {
    // storage unavailable
  }
}

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // storage unavailable
  }
}
