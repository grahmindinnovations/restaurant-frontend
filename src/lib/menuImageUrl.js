/**
 * Menu images should load via /api/uploads/... (same origin as the Vite app in dev).
 * Older saves used http://127.0.0.1:5180/... which triggers CORP blocks on localhost:5173.
 */
export function resolveMenuImageUrl(url) {
  if (!url) return null
  const s = String(url).trim()
  if (!s) return null
  if (s.startsWith('/')) return s
  try {
    const u = new URL(s)
    if (u.pathname.startsWith('/api/uploads/')) return u.pathname
  } catch {
    /* keep as-is */
  }
  return s
}
