import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'

/** Wait until Firebase restores the signed-in user (e.g. after refresh). */
export function waitForAuthUser(timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (!auth) {
      resolve(null)
      return
    }
    if (auth.currentUser) {
      resolve(auth.currentUser)
      return
    }

    let settled = false
    const finish = (user) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      unsub()
      resolve(user)
    }

    const timer = setTimeout(() => finish(null), timeoutMs)
    const unsub = onAuthStateChanged(auth, (user) => finish(user))
  })
}

async function getIdToken() {
  try {
    const user = auth?.currentUser || (await waitForAuthUser(8000))
    if (!user?.getIdToken) return null
    return await user.getIdToken()
  } catch {
    return null
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Wait until the backend answers /api/health (handles node --watch restart gaps).
 * Uses plain fetch — no auth required.
 */
export async function waitForBackend(maxWaitMs = 15000) {
  const base = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || '')
  const url = `${base}/api/health`
  const start = Date.now()

  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) return true
    } catch {
      // ECONNREFUSED / ECONNRESET while backend restarts
    }
    await sleep(400)
  }
  return false
}

export async function apiFetch(path, options = {}) {
  const base = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || '')
  const url = path.startsWith('http') ? path : `${base}${path}`

  const method = String(options.method || 'GET').toUpperCase()
  const shouldRetry = method === 'GET'
  // Extra retries: node --watch restarts backend for ~1–3s (ECONNRESET / ECONNREFUSED).
  const maxAttempts = shouldRetry ? 8 : 1

  let lastErr = null
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const token = await getIdToken()

    const headers = {
      ...(options.headers || {}),
    }

    const isFormData =
      typeof FormData !== 'undefined' && options.body instanceof FormData
    if (options.body && !headers['Content-Type'] && !isFormData) {
      headers['Content-Type'] = 'application/json'
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const res = await fetch(url, { ...options, headers })

      if (res.status === 401 && shouldRetry && attempt < maxAttempts - 1) {
        await waitForAuthUser(4000)
        await sleep(200 * (attempt + 1))
        continue
      }

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

      if (!shouldRetry || !transient || attempt >= maxAttempts - 1) throw e
      await sleep(500 * (attempt + 1))
    }
  }

  throw lastErr || new Error('API request failed')
}
