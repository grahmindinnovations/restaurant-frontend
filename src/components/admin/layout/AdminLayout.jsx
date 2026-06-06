import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, firebaseReady } from '../../../services/firebase'
import { apiFetch } from '../../../services/api'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AdminLayout() {
  const [loading, setLoading] = useState(true)
  const [adminUser, setAdminUser] = useState(null)
  const [_error, setError] = useState(null)
  const location = useLocation()

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setLoading(false)
      setAdminUser(null)
      return
    }

    const a = auth
    const unsub = onAuthStateChanged(a, async (u) => {
      if (!u) {
        setAdminUser(null)
        setLoading(false)
        return
      }
      try {
        const res = await apiFetch('/api/admin/me')
        setAdminUser({
          firebase: u,
          profile: res.user,
        })
        setError(null)
      } catch (e) {
        console.error('Admin guard error:', e)
        setAdminUser(null)
        setError('You are not authorized as admin.')
        try {
          await signOut(a)
        } catch {
          /* ignore sign-out errors */
        }
      } finally {
        setLoading(false)
      }
    })

    return () => unsub()
  }, [])

  if (!firebaseReady || !auth) {
    return <Navigate to="/login?role=admin" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-neutral-200 border-t-neutral-900" />
      </div>
    )
  }

  if (!adminUser) {
    return <Navigate to="/login?role=admin" replace state={{ from: location }} />
  }

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar adminUser={adminUser} />
        <main className="p-4 space-y-3">
          <Outlet context={{ adminUser }} />
        </main>
      </div>
    </div>
  )
}

