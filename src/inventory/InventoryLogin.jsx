import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Lock, Mail, Package } from 'lucide-react'
import { auth, firebaseReady } from '../services/firebase'

export default function InventoryLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (auth?.currentUser) {
      navigate('/inventory', { replace: true })
    }
  }, [navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!auth) {
      setError('Firebase is not configured')
      return
    }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/inventory', { replace: true })
    } catch (err) {
      if (err?.code === 'auth/network-request-failed') {
        setError('Network error: Check your internet connection.')
      } else if (err?.code === 'auth/invalid-credential') {
        setError('Invalid email or password.')
      } else {
        setError(err?.message || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">Inventory Management</div>
            <div className="text-sm text-slate-500">Sign in to continue</div>
          </div>
        </div>

        {!firebaseReady && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Firebase config missing or invalid.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block space-y-2">
            <div className="text-sm font-medium text-slate-700">Email</div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </label>

          <label className="block space-y-2">
            <div className="text-sm font-medium text-slate-700">Password</div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-2xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

