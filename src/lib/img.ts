export function optimizeImg(url: string, width = 640): string {
  if (!url || !url.includes('/image/upload/')) return url;
  if (/\/image\/upload\/[^/]*(f_auto|q_auto|w_\d+)/.test(url)) return url;
  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width},c_limit/`);
}
