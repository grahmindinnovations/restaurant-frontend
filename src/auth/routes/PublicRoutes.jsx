import { lazy } from 'react'
import { Route, Navigate } from 'react-router-dom'

const LandingPage = lazy(() => import('../../landing/LandingPage'))
const GuestTablePage = lazy(() => import('../../guest/GuestTablePage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const RoleSelectPage = lazy(() => import('../pages/RoleSelectPage'))
const AccessDeniedPage = lazy(() => import('../pages/AccessDeniedPage'))

/**
 * Public routes — must be spread inside <Routes> (not wrapped in a custom component).
 */
export function getPublicRoutes() {
  return [
    <Route key="/" path="/" element={<LandingPage />} />,
    <Route key="/table/:tableId" path="/table/:tableId" element={<GuestTablePage />} />,
    <Route key="/login" path="/login" element={<LoginPage />} />,
    <Route key="/select-role" path="/select-role" element={<RoleSelectPage />} />,
    <Route key="/access-denied" path="/access-denied" element={<AccessDeniedPage />} />,
    <Route
      key="/inventory-login"
      path="/inventory-login"
      element={<Navigate to="/login" replace />}
    />,
  ]
}
