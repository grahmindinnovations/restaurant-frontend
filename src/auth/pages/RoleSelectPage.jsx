import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, ClipboardList, Monitor, Shield, TrendingUp } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../../services/firebase'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuth } from '../context/useAuth'
import { routeForRole } from '../config/routeConfig'
import { setActiveRole } from '../config/activeRoleStorage'
import RequireAuth from '../guards/RequireAuth'
import AuthLoadingPage from './AuthLoadingPage'

const ROLE_UI = {
  admin: {
    title: 'Admin',
    subtitle: 'Full System Access',
    icon: Shield,
    tint: 'bg-rose-50 text-rose-700 border-rose-100',
  },
  manager: {
    title: 'Manager',
    subtitle: 'Inventory & Stock',
    icon: TrendingUp,
    tint: 'bg-amber-50 text-amber-800 border-amber-100',
  },
  kitchen: {
    title: 'Kitchen',
    subtitle: 'KDS & Preparation',
    icon: ChefHat,
    tint: 'bg-emerald-50 text-emerald-800 border-emerald-100',
  },
  reception: {
    title: 'Reception',
    subtitle: 'POS & Billing',
    icon: Monitor,
    tint: 'bg-sky-50 text-sky-800 border-sky-100',
  },
  employee: {
    title: 'Employee',
    subtitle: 'Staff & Attendance',
    icon: ClipboardList,
    tint: 'bg-violet-50 text-violet-800 border-violet-100',
  },
}

function RoleSelectContent() {
  const navigate = useNavigate()
  const { user, allowedRoles, loading } = useAuth()

  useEffect(() => {
    if (!loading && user && allowedRoles.length === 1) {
      setActiveRole(allowedRoles[0])
      navigate(routeForRole(allowedRoles[0]), { replace: true })
    }
  }, [loading, user, allowedRoles, navigate])

  const cards = useMemo(
    () =>
      allowedRoles
        .map((r) => ({
          id: r,
          ...(ROLE_UI[r] || {
            title: r,
            subtitle: '',
            icon: Shield,
            tint: 'bg-slate-50 text-slate-800 border-slate-100',
          }),
        }))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [allowedRoles],
  )

  const logout = async () => {
    try {
      if (auth) await signOut(auth)
    } finally {
      navigate('/login', { replace: true })
    }
  }

  if (loading) {
    return <AuthLoadingPage />
  }

  if (!loading && allowedRoles.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full rounded-2xl border border-slate-200 shadow-sm">
          <CardContent className="p-6 space-y-3 text-center">
            <p className="text-sm text-slate-600">
              No roles are assigned to <span className="font-semibold">{user?.email}</span>. Ask
              your admin to set <code className="text-xs">allowed_email</code> in Firestore roles.
            </p>
            <Button variant="outline" className="w-full rounded-xl" onClick={logout}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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

        <Card className="rounded-2xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Available roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cards.map((r) => {
                const Icon = r.icon
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setActiveRole(r.id)
                      navigate(routeForRole(r.id), { replace: true })
                    }}
                    className="text-left rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-10 w-10 rounded-xl border flex items-center justify-center ${r.tint}`}
                      >
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RoleSelectPage() {
  return (
    <RequireAuth>
      <RoleSelectContent />
    </RequireAuth>
  )
}
