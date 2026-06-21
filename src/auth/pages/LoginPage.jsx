import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, firebaseReady } from '../../services/firebase'
import { waitForAuthUser, waitForBackend } from '../../services/api'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAuth } from '../context/useAuth'
import { routeForRole } from '../config/routeConfig'
import { setActiveRole } from '../config/activeRoleStorage'
import AuthLoadingPage from './AuthLoadingPage'
import RestaurantDoorScene from '../components/RestaurantDoorScene'

function friendlyAuthError(err) {
  const code = String(err?.code || '')
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
  if (
    msg.includes('Failed to fetch') ||
    msg.includes('NetworkError') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('ECONNRESET')
  ) {
    return 'Server is not reachable. Please check the backend is running and try again.'
  }
  if (msg.includes('API 500')) return 'Server problem. Please try again in a moment.'
  return 'Could not contact the server. Please try again.'
}

const DOOR_OPEN_MS = 2800
const FORM_HIDE_MS = 350

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, allowedRoles, loading: authLoading, refreshMe } = useAuth()
  const loginStartedRef = useRef(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [doorOpen, setDoorOpen] = useState(false)
  const [formHidden, setFormHidden] = useState(false)

  useEffect(() => {
    if (authLoading || !user || doorOpen || loading || loginStartedRef.current) return
    if (allowedRoles.length === 0) return
    if (allowedRoles.length > 1) {
      navigate('/select-role', { replace: true })
      return
    }
    setActiveRole(allowedRoles[0])
    navigate(routeForRole(allowedRoles[0]), { replace: true })
  }, [authLoading, user, allowedRoles, navigate, doorOpen, loading])

  const submitDisabled = useMemo(() => {
    if (!firebaseReady || !auth) return true
    if (loading || doorOpen || formHidden) return true
    if (!email.trim() || !password) return true
    return false
  }, [email, password, loading, doorOpen, formHidden])

  const enterDashboard = (path) => {
    setLoading(false)
    setFormHidden(true)
    window.setTimeout(() => {
      setDoorOpen(true)
    }, FORM_HIDE_MS)
    window.setTimeout(() => {
      navigate(path, { replace: true })
    }, DOOR_OPEN_MS)
  }

  const goNext = async () => {
    let lastErr = null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await waitForBackend(12000)
        const roles = await refreshMe()
        if (roles.length === 0) {
          setError('No roles are assigned to this email. Ask your admin to configure access.')
          setLoading(false)
          loginStartedRef.current = false
          return
        }
        if (roles.length === 1) {
          setActiveRole(roles[0])
          enterDashboard(routeForRole(roles[0]))
          return
        }
        enterDashboard('/select-role')
        return
      } catch (err) {
        lastErr = err
        const msg = String(err?.message || '')
        const transient =
          msg.includes('Failed to fetch') ||
          msg.includes('ECONNREFUSED') ||
          msg.includes('ECONNRESET')
        if (!transient || attempt >= 2) break
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)))
      }
    }
    setError(friendlyBackendError(lastErr))
    setLoading(false)
    loginStartedRef.current = false
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError(null)
    loginStartedRef.current = true
    if (!auth) {
      setError('Firebase is not configured for this frontend.')
      loginStartedRef.current = false
      return
    }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      await waitForAuthUser(5000)
      await goNext()
    } catch (err) {
      setError(friendlyAuthError(err))
      setLoading(false)
      loginStartedRef.current = false
    }
  }

  if (authLoading && user && !loginStartedRef.current && !doorOpen) {
    return <AuthLoadingPage message="Welcome back…" />
  }

  return (
    <RestaurantDoorScene doorOpen={doorOpen} hideForm={formHidden || doorOpen}>
      <div className={`login-door-card ${formHidden ? 'is-fading' : ''}`}>
        <p className="login-door-card-eyebrow">Staff entrance</p>
        <h1>Enter the restaurant</h1>
        <p className="login-door-card-sub">Sign in to open the doors to your dashboard</p>

        {!firebaseReady && (
          <div className="login-door-alert muted">
            Firebase config missing. Check frontend environment configuration.
          </div>
        )}

        {error && <div className="login-door-alert error">{error}</div>}

        <form onSubmit={handleEmailLogin} className="login-door-form">
          <label>
            Email
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="login-door-input"
              autoComplete="email"
              required
              disabled={doorOpen}
            />
          </label>

          <label>
            Password
            <div className="login-door-password-wrap">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="login-door-input"
                autoComplete="current-password"
                required
                disabled={doorOpen}
              />
              <button
                type="button"
                className="login-door-eye"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={doorOpen}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <div className="login-door-row">
            <label className="login-door-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={doorOpen}
              />
              Remember me
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" className="login-door-enter-btn" disabled={submitDisabled}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening…
              </>
            ) : doorOpen ? (
              <>
                <LogIn className="h-4 w-4" />
                Welcome in
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Enter
              </>
            )}
          </Button>
        </form>
      </div>
    </RestaurantDoorScene>
  )
}
