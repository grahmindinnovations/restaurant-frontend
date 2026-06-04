import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'

import { auth, firebaseReady } from '../../services/firebase'
import { apiFetch } from '../../services/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
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

function friendlyAuthError(err) {
  const code = String(err?.code || '')

  // Keep messages simple for non-technical users.
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password. Please try again.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a minute and try again.'
    case 'auth/network-request-failed':
      return 'Network issue. Check your internet connection and try again.'
    case 'auth/user-disabled':
      return 'This account is disabled. Please contact the restaurant admin.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    default:
      return 'Sign-in failed. Please try again or contact support.'
  }
}

function friendlyBackendError(err) {
  const msg = String(err?.message || '')
  if (msg.includes('Missing Authorization')) return 'Please sign in again and retry.'
  if (msg.includes('Invalid/expired token')) return 'Your session expired. Please sign in again.'
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED') || msg.includes('ECONNRESET')) {
    return 'Server is not reachable. Please check the backend is running and try again.'
  }
  if (msg.includes('API 500')) return 'Server problem. Please try again in a moment.'
  return 'Could not contact the server. Please try again.'
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submitDisabled = useMemo(() => {
    if (!firebaseReady || !auth) return true
    if (loading) return true
    if (!email.trim() || !password) return true
    return false
  }, [email, password, loading])

  const goNext = async () => {
    try {
      const me = await apiFetch('/api/me')
      const allowedRoles = Array.isArray(me?.allowedRoles) ? me.allowedRoles : []

      if (allowedRoles.length === 1) {
        navigate(routeForRole(allowedRoles[0]), { replace: true })
        return
      }

      // Multiple roles (or none) => select role screen.
      navigate('/select-role', { replace: true })
    } catch (err) {
      setError(friendlyBackendError(err))
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError(null)

    if (!auth) {
      setError('Firebase is not configured for this frontend.')
      return
    }

    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      await goNext()
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl border border-neutral-200 shadow-sm bg-white">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto inline-flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
                *
              </span>
              <span>Grahmind/solutions</span>
            </div>
            <CardTitle className="text-2xl font-semibold text-neutral-900">Welcome Back</CardTitle>
            <p className="text-sm text-neutral-500">Please enter your details to sign in</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {!firebaseReady && (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                Firebase config missing. Check frontend environment configuration.
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <div className="text-xs font-medium text-neutral-400">*</div>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700">Email address*</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="rounded-xl border-neutral-200 bg-white"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700">Password*</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="rounded-xl border-neutral-200 bg-white pr-10"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-neutral-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 accent-neutral-900"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember Me
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-neutral-700 hover:underline"
                  onClick={() =>
                    setError(
                      'Please ask the restaurant admin to reset your password (password reset is not available in this app yet).'
                    )
                  }
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full rounded-xl"
                disabled={submitDisabled}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign in 
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-xs text-neutral-500">
              New on our platform?{' '}
              <span className="font-medium text-neutral-900">Create an account</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
