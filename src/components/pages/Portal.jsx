import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import tw, { styled, css } from 'twin.macro'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, firebaseReady } from '../../services/firebase'
import { parseRoleId, roleMeta } from '../../services/roles'
import { apiFetch } from '../../services/api'

const KitchenDashboard = lazy(() => import('../../kitchen/KitchenDashboard'))

const Page = styled.div(() => [
  tw`min-h-screen bg-cover bg-center bg-no-repeat relative`,
  css`
    background-image: url('https://images.unsplash.com/photo-1592861956120-e524fc739696?q=80&w=2070&auto=format&fit=crop');
  `,
])
const Overlay = tw.div`absolute inset-0 bg-black/50 backdrop-blur-sm`
const Shell = tw.div`relative z-10 max-w-5xl mx-auto px-6 py-10`
const TopBar = tw.div`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`
const Brand = tw.div`text-white`
const BrandTitle = tw.h1`text-2xl font-bold tracking-wide`
const BrandSub = tw.p`text-white/80 text-sm`
const Actions = tw.div`flex items-center gap-3`
const Btn = styled.button(({ variant }) => [
  tw`px-4 py-2 rounded-xl font-semibold transition`,
  variant === 'primary'
    ? tw`bg-white text-slate-900 hover:bg-white/90`
    : tw`bg-white/15 text-white hover:bg-white/25 border border-white/20`,
])

const Card = tw.div`mt-10 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-8`
const CardTitle = tw.h2`text-xl font-bold text-slate-800`
const CardText = tw.p`mt-2 text-slate-600`
const EmailPill = tw.div`mt-6 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200`

export default function Portal() {
  const params = useParams()
  const navigate = useNavigate()
  const roleId = parseRoleId(params.role)
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  const meta = useMemo(() => (roleId ? roleMeta[roleId] : null), [roleId])

  useEffect(() => {
    if (!roleId) {
      navigate('/', { replace: true })
      return
    }
    if (!firebaseReady || !auth) {
      navigate(`/login?role=${encodeURIComponent(roleId)}`, { replace: true })
      return
    }
    const a = auth
    const unsub = onAuthStateChanged(a, async (u) => {
      if (!u) {
        setUser(null)
        setChecking(false)
        navigate(`/login?role=${encodeURIComponent(roleId)}`, { replace: true })
        return
      }

      try {
        const res = await apiFetch(`/api/roles/${encodeURIComponent(roleId)}/access`)
        if (!res.allowed) {
          await signOut(a)
          const msg = `Access denied. ${meta?.title || 'This role'} requires different credentials.`
          try {
            window.alert(msg)
          } catch {}
          setUser(null)
          setChecking(false)
          navigate(`/login?role=${encodeURIComponent(roleId)}`, { replace: true })
          return
        }
      } catch (err) {
        console.error('Error verifying role access in Portal via backend:', err)
        await signOut(a)
        navigate('/', { replace: true })
        return
      }

      setUser(u)
      setChecking(false)
    })
    return () => unsub()
  }, [meta?.title, navigate, roleId])

  const onLogout = async () => {
    if (auth) await signOut(auth)
    navigate('/', { replace: true })
  }

  if (!roleId || !meta) return null
  
  if (checking) return null // Or a loading spinner

  // Render specific dashboard for Kitchen
  if (roleId === 'kitchen') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
            Loading...
          </div>
        }
      >
        <KitchenDashboard />
      </Suspense>
    )
  }

  return (
    <Page>
      <Overlay />
      <Shell>
        <TopBar>
          <Brand>
            <BrandTitle>{meta.title} Portal</BrandTitle>
            <BrandSub>Restaurant Management System</BrandSub>
          </Brand>
          <Actions>
            <Btn type="button" variant="secondary" onClick={() => navigate('/', { replace: true })}>
              Home
            </Btn>
            <Btn type="button" variant="primary" onClick={onLogout}>
              Logout
            </Btn>
          </Actions>
        </TopBar>

        <Card>
          <CardTitle>Welcome back!</CardTitle>
          <CardText>
            You are logged in as {user?.email}. This is the {meta.title} dashboard.
          </CardText>
          <EmailPill>
            {user?.email}
          </EmailPill>
        </Card>
      </Shell>
    </Page>
  )
}
