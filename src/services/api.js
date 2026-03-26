import { auth } from './firebase'

async function getIdToken() {
  try {
    const user = auth?.currentUser
    if (!user?.getIdToken) return null
    return await user.getIdToken()
  } catch {
    return null
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function apiFetch(path, options = {}) {
  const base = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || '')
  const url = path.startsWith('http') ? path : `${base}${path}`

  const token = await getIdToken()

  const headers = {
    ...(options.headers || {}),
  }

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const method = String(options.method || 'GET').toUpperCase()
  const shouldRetry = method === 'GET'

  let lastErr = null
  for (let attempt = 0; attempt < (shouldRetry ? 3 : 1); attempt++) {
    try {
      const res = await fetch(url, { ...options, headers })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`)
      }

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        return res.json()
      }
      return res.text()
    } catch (e) {
      lastErr = e
      const msg = String(e?.message || '')
      const transient =
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('ECONNRESET') ||
        msg.includes('ECONNREFUSED') ||
        msg.includes('API 502') ||
        msg.includes('API 503') ||
        msg.includes('API 504')

      if (!shouldRetry || !transient || attempt >= 2) throw e
      await sleep(250 * (attempt + 1))
    }
  }

  throw lastErr || new Error('API request failed')
}

