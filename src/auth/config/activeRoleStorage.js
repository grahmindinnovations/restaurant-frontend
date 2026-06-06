const ACTIVE_ROLE_KEY = 'rms_active_role'

export function setActiveRole(roleId) {
  if (!roleId) {
    sessionStorage.removeItem(ACTIVE_ROLE_KEY)
    return
  }
  sessionStorage.setItem(ACTIVE_ROLE_KEY, String(roleId))
}

export function getActiveRole() {
  return sessionStorage.getItem(ACTIVE_ROLE_KEY)
}

export function clearActiveRole() {
  sessionStorage.removeItem(ACTIVE_ROLE_KEY)
}
