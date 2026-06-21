/**
 * API origin for REST and Socket.IO.
 * Set VITE_API_BASE_URL in .env.local (e.g. https://restaurant.grahmind.com).
 * When unset in dev, Vite proxies /api to localhost:5180.
 */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim().replace(/\/$/, '')
  }
  return import.meta.env.DEV ? '' : ''
}

/** Socket.IO server URL — remote backend in dev when VITE_API_BASE_URL is set. */
export function getSocketBaseUrl() {
  const base = getApiBaseUrl()
  return base || undefined
}

/**
 * Guest QR/table ordering — in dev always use Vite proxy → local backend (5180),
 * even when VITE_API_BASE_URL points at production for staff login.
 */
export function getGuestApiBaseUrl() {
  if (import.meta.env.DEV) return ''
  return getApiBaseUrl()
}
