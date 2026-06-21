import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getPublicRoutes } from '../auth/routes/PublicRoutes'
import { getProtectedRoutes } from '../auth/routes/ProtectedRoutes'
import AuthLoadingPage from '../auth/pages/AuthLoadingPage'

export default function AppRoutes() {
  return (
    <Suspense fallback={<AuthLoadingPage />}>
      <Routes>
        {getPublicRoutes()}
        {getProtectedRoutes()}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
