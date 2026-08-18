import { API_ORIGIN } from "./apiBase";

export function resolveMediaUrl(value?: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const belongsToApi = url.origin === API_ORIGIN;
      if (belongsToApi && (url.pathname.startsWith('/api/media/file/') || url.pathname.startsWith('/storage/'))) {
        return `${API_ORIGIN}${url.pathname}${url.search}`;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  if (trimmed.startsWith('/')) return `${API_ORIGIN}${trimmed}`;
  return `${API_ORIGIN}/${trimmed.replace(/^\/+/, '')}`;
}
