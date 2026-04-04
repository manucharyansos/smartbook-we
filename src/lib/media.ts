const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_ORIGIN = API_URL ? new URL(API_URL).origin : (typeof window !== 'undefined' ? window.location.origin : '');

export function normalizeMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  const value = String(url).trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (!API_ORIGIN) return value;
      const localHosts = new Set(['localhost', '127.0.0.1']);
      const samePath = parsed.pathname.startsWith('/storage/') || parsed.pathname.startsWith('/uploads/') || parsed.pathname.startsWith('/media/');
      if (samePath && localHosts.has(parsed.hostname) && parsed.origin !== API_ORIGIN) {
        return `${API_ORIGIN}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return value;
    }
    return value;
  }

  if (!API_ORIGIN) return value;
  if (value.startsWith('/')) return `${API_ORIGIN}${value}`;
  if (value.startsWith('storage/')) return `${API_ORIGIN}/${value}`;
  return `${API_ORIGIN}/${value.replace(/^\/+/, '')}`;
}
