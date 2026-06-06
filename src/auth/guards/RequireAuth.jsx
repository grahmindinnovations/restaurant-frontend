import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import AuthLoadingPage from '../pages/AuthLoadingPage'

/** Login required, any role — for select-role and similar. */
export default function RequireAuth({ children }) {
  const { loading, user } = useAuth()

  if (loading) {
    return <AuthLoadingPage />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
