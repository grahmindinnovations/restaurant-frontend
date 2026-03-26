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
  const [error, setError] = useState(null)
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
        } catch {}
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-rose-200 border-t-rose-600" />
      </div>
    )
  }

  if (!adminUser) {
    return <Navigate to="/login?role=admin" replace state={{ from: location }} />
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[18rem_1fr] bg-slate-50">
      <Sidebar />
      <div className="flex flex-col min-w-0">
        <Topbar adminUser={adminUser} />
        <main className="p-6 space-y-6">
          <Outlet context={{ adminUser }} />
        </main>
      </div>
    </div>
  )
}

