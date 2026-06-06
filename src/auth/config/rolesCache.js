const ROLES_KEY = 'rms_allowed_roles'
const ROLES_EMAIL_KEY = 'rms_roles_email'

export function cacheAllowedRoles(email, roles) {
  const key = String(email || '').trim().toLowerCase()
  if (!key || !Array.isArray(roles)) return
  try {
    sessionStorage.setItem(ROLES_EMAIL_KEY, key)
    sessionStorage.setItem(ROLES_KEY, JSON.stringify(roles))
  } catch {
    // ignore quota errors
  }
}

export function getCachedAllowedRoles(email) {
  const key = String(email || '').trim().toLowerCase()
  if (!key) return null
  try {
    const cachedEmail = sessionStorage.getItem(ROLES_EMAIL_KEY)
    if (cachedEmail !== key) return null
    const raw = sessionStorage.getItem(ROLES_KEY)
    const roles = JSON.parse(raw)
    return Array.isArray(roles) && roles.length > 0 ? roles : null
  } catch {
    return null
  }
}

export function clearCachedAllowedRoles() {
  sessionStorage.removeItem(ROLES_KEY)
  sessionStorage.removeItem(ROLES_EMAIL_KEY)
}
