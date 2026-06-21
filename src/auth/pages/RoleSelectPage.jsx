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
  },
  manager: {
    title: 'Manager',
    subtitle: 'Inventory & Stock',
    icon: TrendingUp,
  },
  kitchen: {
    title: 'Kitchen',
    subtitle: 'KDS & Preparation',
    icon: ChefHat,
  },
  reception: {
    title: 'Reception',
    subtitle: 'POS & Billing',
    icon: Monitor,
  },
  employee: {
    title: 'Employee',
    subtitle: 'Staff & Attendance',
    icon: ClipboardList,
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
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-md w-full rounded-2xl border border-border shadow-sm">
          <CardContent className="p-6 space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              No roles are assigned to <span className="font-semibold text-foreground">{user?.email}</span>. Ask
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
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="auth-hero rounded-2xl p-6 text-primary-foreground shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Select a role</h1>
              <p className="mt-1 text-sm text-white/80">
                Signed in as <span className="font-semibold text-white">{user?.email}</span>
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={logout}
            >
              Sign out
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl border border-border shadow-sm bg-card">
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
                    className="text-left rounded-2xl border border-border bg-card p-4 hover:bg-accent transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl border border-border bg-secondary flex items-center justify-center text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-foreground">{r.title}</div>
                        <div className="text-xs text-muted-foreground">{r.subtitle}</div>
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
