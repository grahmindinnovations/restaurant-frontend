import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { canAccessPath, roleForPath } from '../config/routeConfig'
import { setActiveRole } from '../config/activeRoleStorage'
import AuthLoadingPage from '../pages/AuthLoadingPage'

/**
 * Wrap any page that requires login + specific roles.
 * Usage: <ProtectedRoute roles={['reception', 'admin']}><POSPage /></ProtectedRoute>
 */
export default function ProtectedRoute({ roles, children }) {
  const { loading, user, allowedRoles } = useAuth()
  const location = useLocation()

  if (loading) {
    return <AuthLoadingPage message="Checking access…" />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const required = Array.isArray(roles) ? roles : []
  const hasRole = required.some((r) => allowedRoles.includes(r))

  if (!hasRole) {
    if (allowedRoles.length === 0 && user) {
      return <AuthLoadingPage message="Loading your access…" />
    }
    return <Navigate to="/access-denied" replace state={{ from: location.pathname }} />
  }

  const inferred = roleForPath(location.pathname)
  if (inferred && allowedRoles.includes(inferred)) {
    setActiveRole(inferred)
  }

  if (!canAccessPath(location.pathname, allowedRoles)) {
    return <Navigate to="/access-denied" replace state={{ from: location.pathname }} />
  }

  return children
}
