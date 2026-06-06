import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'

/** True once Firebase user is available with reception (or admin) role. */
export function useReceptionAuth() {
  const navigate = useNavigate()
  const { loading, user, allowedRoles } = useAuth()
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    if (loading) return

    if (!user) {
      setAuthReady(false)
      navigate('/login', { replace: true })
      return
    }

    const canReception = allowedRoles.includes('reception') || allowedRoles.includes('admin')
    if (!canReception) {
      setAuthReady(false)
      navigate('/access-denied', { replace: true })
      return
    }

    setAuthReady(true)
  }, [loading, user, allowedRoles, navigate])

  return authReady
}
