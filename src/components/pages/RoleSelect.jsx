import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ChefHat, ClipboardList, Monitor, Shield, TrendingUp } from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'

import { auth } from '../../services/firebase'
import { apiFetch } from '../../services/api'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

function routeForRole(roleId) {
  switch (roleId) {
    case 'reception':
      return '/pos'
    case 'kitchen':
      return '/kitchen'
    case 'manager':
      return '/inventory'
    case 'employee':
      return '/employee'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/login'
  }
}

const ROLE_UI = {
  admin: { title: 'Admin', subtitle: 'Full System Access', icon: Shield, tint: 'bg-rose-50 text-rose-700 border-rose-100' },
  manager: { title: 'Manager', subtitle: 'Inventory & Stock', icon: TrendingUp, tint: 'bg-amber-50 text-amber-800 border-amber-100' },
  kitchen: { title: 'Kitchen', subtitle: 'KDS & Preparation', icon: ChefHat, tint: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
  reception: { title: 'Reception', subtitle: 'POS & Billing', icon: Monitor, tint: 'bg-sky-50 text-sky-800 border-sky-100' },
  employee: { title: 'Employee', subtitle: 'Staff & Attendance', icon: ClipboardList, tint: 'bg-violet-50 text-violet-800 border-violet-100' },
}

export default function RoleSelect() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)
  const [roles, setRoles] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!auth) {
      setUser(null)
      setChecking(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setChecking(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setError(null)
      try {
        const me = await apiFetch('/api/me')
        const allowed = Array.isArray(me?.allowedRoles) ? me.allowedRoles : []
        setRoles(allowed)
      } catch (e) {
        setError(e?.message || 'Failed to load roles.')
      }
    }
    load()
  }, [user])

  const cards = useMemo(() => {
    return roles
      .map((r) => ({ id: r, ...(ROLE_UI[r] || { title: r, subtitle: '', icon: Shield, tint: 'bg-slate-50 text-slate-800 border-slate-100' }) }))
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [roles])

  const logout = async () => {
    try {
      if (auth) await signOut(auth)
    } finally {
      navigate('/login', { replace: true })
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Loading…
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Select a role</h1>
            <p className="text-sm text-slate-500">
              Signed in as <span className="font-semibold text-slate-700">{user?.email}</span>
            </p>
          </div>
          <Button variant="outline" className="rounded-xl" onClick={logout}>
            Sign out
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <Card className="rounded-2xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Available roles</CardTitle>
          </CardHeader>
          <CardContent>
            {cards.length === 0 ? (
              <div className="text-sm text-slate-500">
                No roles are assigned to this account. Ask admin to configure access.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cards.map((r) => {
                  const Icon = r.icon
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => navigate(routeForRole(r.id), { replace: true })}
                      className="text-left rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${r.tint}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900">{r.title}</div>
                          <div className="text-xs text-slate-500">{r.subtitle}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
