import React, { useState } from 'react'
import tw, { styled, css } from 'twin.macro'
import { auth, firebaseReady, googleProvider } from '../../services/firebase'
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, User, Lock, Mail, Chrome, Shield, ChefHat, Monitor, TrendingUp, ClipboardList } from 'lucide-react'
import { parseRoleId, roleMeta } from '../../services/roles'
import { apiFetch } from '../../services/api'

// Role configs to reuse styles
const roleIconMap = {
  admin: Shield,
  manager: TrendingUp,
  kitchen: ChefHat,
  reception: Monitor,
  employee: ClipboardList,
}

const getGradient = (color) => {
  switch (color) {
    case 'red': return 'linear-gradient(135deg, #be123c 0%, #881337 100%)'
    case 'orange': return 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)'
    case 'green': return 'linear-gradient(135deg, #15803d 0%, #14532d 100%)'
    case 'blue': return 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
    case 'purple': return 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
    default: return 'linear-gradient(135deg, #475569 0%, #1e293b 100%)'
  }
}

const Page = styled.div(() => [
  tw`min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative`,
  css`
    background-image: url('https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop');
  `,
])

const Overlay = tw.div`absolute inset-0 bg-black/40 backdrop-blur-sm`

const Card = styled.div(() => [
  tw`relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50`,
  css`
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  `,
])

const Header = tw.div`text-center mb-8`
const RoleIconWrapper = styled.div(({ color }) => [
  tw`h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4 shadow-lg text-white`,
  css`background: ${getGradient(color)};`
])

const Title = tw.h1`text-2xl font-bold text-slate-800`
const Subtitle = tw.p`text-sm text-slate-500 mt-1 font-medium`

const InputGroup = tw.div`relative mb-5`
const InputIcon = tw.div`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400`
const Input = styled.input(() => [
  tw`w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none transition-all`,
  tw`focus:border-rose-500 focus:ring-2 focus:ring-rose-200`,
])
const TogglePwdBtn = tw.button`absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-xs font-semibold px-2 py-1 rounded-md bg-slate-100`

const Button = styled.button(({ color }) => [
  tw`w-full py-3 font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2`,
  css`background: ${getGradient(color)};`,
  tw`hover:opacity-90 hover:shadow-xl`,
])

const Divider = tw.div`flex items-center my-6 text-xs text-slate-400 uppercase font-bold tracking-wider`
const DividerLine = tw.div`flex-1 h-px bg-slate-200`

const GoogleBtn = styled.button(() => [
  tw`w-full py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold flex items-center justify-center gap-3 transition-all hover:bg-slate-50 hover:border-slate-300`,
])

const BackLink = styled(Link)(() => [
  tw`absolute top-8 left-8 z-20 flex items-center gap-2 text-white/80 hover:text-white font-medium transition-colors bg-black/20 px-4 py-2 rounded-full backdrop-blur-md hover:bg-black/30`,
])

const ErrorMsg = tw.div`bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-lg mb-6 border border-rose-100 flex items-center gap-2`

export default function Login() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const roleId = parseRoleId(searchParams.get('role'))
  const role = roleId ? { ...roleMeta[roleId], icon: roleIconMap[roleId] } : { color: 'slate', icon: User, title: 'Login' }
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const validateRoleAccess = async (_userEmail, roleId) => {
    const isTransient = (err) => {
      const msg = String(err?.message || '')
      if (msg.includes('ECONNRESET')) return true
      if (msg.includes('Failed to fetch')) return true
      if (msg.includes('NetworkError')) return true
      if (msg.includes('proxy error')) return true
      if (msg.includes('API 502') || msg.includes('API 503') || msg.includes('API 504')) return true
      return false
    }

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
      if (roleId === 'admin') {
          const res = await apiFetch('/api/admin/me')
          if (res?.user?.role === 'admin') return { success: true }
          return {
            success: false,
            error: 'Access Denied: This account is not configured as an admin user.',
          }
      }

        const data = await apiFetch(`/api/roles/${encodeURIComponent(roleId)}/access`)
        if (data.allowed) return { success: true }
        return {
          success: false,
          error: `Access Denied: This account is not authorized for ${roleMeta[roleId]?.title}.`,
        }
      } catch (err) {
        console.error('Error validating role access via backend:', err)
        if (attempt < 2 && isTransient(err)) {
          await sleep(350 * (attempt + 1))
          continue
        }
        return {
          success: false,
          error: isTransient(err)
            ? 'Backend is not responding. Please start/restart restaurant-backend and try again.'
            : err.message || 'Role validation failed',
        }
      }
    }

    return { success: false, error: 'Role validation failed' }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    if (!auth) {
      setError('Firebase is not configured')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const user = cred.user
      
      if (roleId) {
        const result = await validateRoleAccess(user.email || '', roleId)
        if (!result.success) {
          await signOut(auth)
          setError(result.error || 'Access Denied')
          return
        }
        
        // Redirect based on role
        if (roleId === 'reception') {
          navigate('/pos', { replace: true })
        } else if (roleId === 'manager') {
          navigate('/inventory', { replace: true })
        } else if (roleId === 'employee') {
          navigate('/employee', { replace: true })
        } else if (roleId === 'admin') {
          navigate('/admin/dashboard', { replace: true })
        } else {
          navigate(`/portal/${encodeURIComponent(roleId)}`, { replace: true })
        }
      } else {
        // Fallback if no role selected (should not happen in this flow)
        navigate('/portal', { replace: true })
      }
    } catch (err) {
      console.error('Login error:', err)
      if (err.code === 'auth/network-request-failed') {
        setError('Network error: Check your internet connection or disable ad-blockers.')
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.')
      } else {
        setError(err?.message || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) {
      setError('Firebase is not configured')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      const user = cred.user
      
      if (roleId) {
        const result = await validateRoleAccess(user.email || '', roleId)
        if (!result.success) {
          await signOut(auth)
          setError(result.error || 'Access Denied')
          return
        }

        // Redirect based on role
        if (roleId === 'reception') {
          navigate('/pos', { replace: true })
        } else if (roleId === 'manager') {
          navigate('/inventory', { replace: true })
        } else if (roleId === 'employee') {
          navigate('/employee', { replace: true })
        } else if (roleId === 'admin') {
          navigate('/admin/dashboard', { replace: true })
        } else {
          navigate(`/portal/${encodeURIComponent(roleId)}`, { replace: true })
        }
      } else {
         navigate('/portal', { replace: true })
      }
    } catch (err) {
      console.error('Google login error:', err)
      setError(err?.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  const RoleIcon = role.icon

  return (
    <Page>
      <Overlay />
      <BackLink to="/">
        <ArrowLeft size={16} /> Back to Roles
      </BackLink>

      <Card>
        <Header>
          <RoleIconWrapper color={role.color}>
            <RoleIcon size={32} />
          </RoleIconWrapper>
          <Title>Welcome Back</Title>
          <Subtitle>Sign in to your {role.title} account</Subtitle>
        </Header>

        {!firebaseReady && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-700 text-xs rounded border border-amber-200">
            Firebase config missing in .env.local
          </div>
        )}

        {error && <ErrorMsg><span>⚠️</span> {error}</ErrorMsg>}

        <form onSubmit={handleEmailLogin}>
          <InputGroup>
            <InputIcon><Mail size={18} /></InputIcon>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
            />
          </InputGroup>
          
          <InputGroup>
            <InputIcon><Lock size={18} /></InputIcon>
            <Input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <TogglePwdBtn type="button" onClick={() => setShowPwd((s) => !s)}>
              {showPwd ? 'Hide' : 'Show'}
            </TogglePwdBtn>
          </InputGroup>

          <Button type="submit" disabled={loading} color={role.color}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <Divider>
          <DividerLine />
          <span className="px-3">Or continue with</span>
          <DividerLine />
        </Divider>

        <GoogleBtn type="button" onClick={handleGoogleLogin} disabled={loading}>
          <Chrome size={20} className="text-rose-500" />
          <span>Google Account</span>
        </GoogleBtn>
      </Card>
    </Page>
  )
}
