/**
 * Auth module — login, roles, route guards, protected pages.
 *
 * Folder layout:
 *   config/     — routeConfig.js (who can open what), activeRoleStorage.js
 *   context/    — AuthProvider, useAuth
 *   guards/     — ProtectedRoute, RequireAuth, ProtectedPortal
 *   pages/      — LoginPage, RoleSelectPage, AccessDeniedPage
 *   routes/     — PublicRoutes, ProtectedRoutes
 */

export { AuthProvider } from './context/AuthProvider'
export { useAuth } from './context/useAuth'

export {
  ACCESS_AREAS,
  ROLE_HOME,
  routeForRole,
  rolesForPath,
  roleForPath,
  canAccessPath,
} from './config/routeConfig'

export { getActiveRole, setActiveRole, clearActiveRole } from './config/activeRoleStorage'

export { default as ProtectedRoute } from './guards/ProtectedRoute'
export { default as RequireAuth } from './guards/RequireAuth'
export { default as ProtectedPortal } from './guards/ProtectedPortal'

export { default as LoginPage } from './pages/LoginPage'
export { default as RoleSelectPage } from './pages/RoleSelectPage'
export { default as AccessDeniedPage } from './pages/AccessDeniedPage'

export { getPublicRoutes } from './routes/PublicRoutes'
export { getProtectedRoutes } from './routes/ProtectedRoutes'
