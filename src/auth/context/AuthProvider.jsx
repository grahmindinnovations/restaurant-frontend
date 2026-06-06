import { useCallback, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, firebaseReady } from '../../services/firebase'
import { apiFetch, waitForAuthUser, waitForBackend } from '../../services/api'
import { getActiveRole, setActiveRole } from '../config/activeRoleStorage'
import {
  cacheAllowedRoles,
  clearCachedAllowedRoles,
  getCachedAllowedRoles,
} from '../config/rolesCache'
import { routeForRole } from '../config/routeConfig'
import { AuthContext } from './authContext'

function isTransientApiError(err) {
  const msg = String(err?.message || '')
  return (
    msg.includes('Failed to fetch') ||
    msg.includes('NetworkError') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('API 502') ||
    msg.includes('API 503') ||
    msg.includes('API 504')
  )
}

async function loadProfileForUser(u) {
  await waitForAuthUser(8000)
  await waitForBackend(12000)
  const me = await apiFetch('/api/me')
  const roles = Array.isArray(me?.allowedRoles) ? me.allowedRoles : []
  const email = String(u?.email || '').trim().toLowerCase()
  if (email && roles.length > 0) {
    cacheAllowedRoles(email, roles)
  }
  return roles
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [allowedRoles, setAllowedRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingCachedRoles, setUsingCachedRoles] = useState(false)

  const applyRoles = useCallback((roles, fromCache = false) => {
    setAllowedRoles(roles)
    setUsingCachedRoles(fromCache)
    const active = getActiveRole()
    if (active && !roles.includes(active)) {
      setActiveRole(null)
    }
  }, [])

  const refreshMe = useCallback(async () => {
    const activeUser = user || auth?.currentUser
    if (!activeUser) {
      setAllowedRoles([])
      setUsingCachedRoles(false)
      return []
    }
    const email = String(activeUser.email || '').trim().toLowerCase()
    try {
      const roles = await loadProfileForUser(activeUser)
      applyRoles(roles, false)
      return roles
    } catch (e) {
      console.error('Failed to load /api/me:', e)
      const cached = getCachedAllowedRoles(email)
      if (cached && isTransientApiError(e)) {
        applyRoles(cached, true)
        return cached
      }
      if (cached) {
        applyRoles(cached, true)
        return cached
      }
      setAllowedRoles([])
      setUsingCachedRoles(false)
      throw e
    }
  }, [user, applyRoles])

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setLoading(false)
      setUser(null)
      setAllowedRoles([])
      return undefined
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (!u) {
        clearCachedAllowedRoles()
        setAllowedRoles([])
        setUsingCachedRoles(false)
        setActiveRole(null)
        setLoading(false)
        return
      }

      setLoading(true)
      const email = String(u.email || '').trim().toLowerCase()
      const cached = getCachedAllowedRoles(email)
      if (cached) {
        applyRoles(cached, true)
      }

      try {
        const roles = await loadProfileForUser(u)
        applyRoles(roles, false)
      } catch (e) {
        console.error('Auth profile load failed:', e)
        if (cached) {
          applyRoles(cached, true)
        } else {
          setAllowedRoles([])
          setUsingCachedRoles(false)
        }
      } finally {
        setLoading(false)
      }
    })

    return unsub
  }, [applyRoles])

  useEffect(() => {
    if (!usingCachedRoles || !user) return undefined
    const id = setInterval(() => {
      refreshMe().catch(() => {})
    }, 15_000)
    return () => clearInterval(id)
  }, [usingCachedRoles, user, refreshMe])

  const chooseRole = useCallback((roleId) => {
    setActiveRole(roleId)
  }, [])

  const defaultHome = useMemo(() => {
    const active = getActiveRole()
    if (active && allowedRoles.includes(active)) return routeForRole(active)
    if (allowedRoles.length === 1) return routeForRole(allowedRoles[0])
    if (allowedRoles.includes('reception')) return routeForRole('reception')
    return allowedRoles[0] ? routeForRole(allowedRoles[0]) : '/login'
  }, [allowedRoles])

  const value = useMemo(
    () => ({
      user,
      allowedRoles,
      loading,
      usingCachedRoles,
      activeRole: getActiveRole(),
      refreshMe,
      chooseRole,
      defaultHome,
      isAuthenticated: Boolean(user),
    }),
    [user, allowedRoles, loading, usingCachedRoles, refreshMe, chooseRole, defaultHome],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
