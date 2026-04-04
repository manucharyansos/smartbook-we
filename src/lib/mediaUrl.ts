function getApiOrigin() {
  const base = import.meta.env.VITE_API_URL as string | undefined;
  if (!base) return null;

  try {
    return new URL(base).origin;
  } catch {
    return null;
  }
}

export function resolveMediaUrl(value?: string | null): string | null {
  if (!value) return null;

  const apiOrigin = getApiOrigin();
  const trimmed = value.trim();

  if (!apiOrigin) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.pathname.startsWith('/api/media/file/') || url.pathname.startsWith('/storage/')) {
        return `${apiOrigin}${url.pathname}${url.search}`;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  if (trimmed.startsWith('/')) return `${apiOrigin}${trimmed}`;
  return `${apiOrigin}/${trimmed.replace(/^\/+/, '')}`;
}
