import { getApiBaseUrl } from '../config/apiBase'

/**
 * Menu images load from /api/uploads/... on the configured backend.
 */
export function resolveMenuImageUrl(url) {
  if (!url) return null
  const s = String(url).trim()
  if (!s) return null
  const base = getApiBaseUrl()
  if (s.startsWith('/')) {
    return base ? `${base}${s}` : s
  }
  try {
    const u = new URL(s)
    if (u.pathname.startsWith('/api/uploads/')) {
      return base ? `${base}${u.pathname}` : u.pathname
    }
  } catch {
    /* keep as-is */
  }
  return s
}
