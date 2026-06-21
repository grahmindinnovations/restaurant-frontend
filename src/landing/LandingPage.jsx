import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  ChefHat,
  LayoutGrid,
  Package,
  QrCode,
  Users,
} from 'lucide-react'
import AuthLoadingPage from '../auth/pages/AuthLoadingPage'
import { useAuth } from '../auth/context/useAuth'
import { getActiveRole } from '../auth/config/activeRoleStorage'
import { routeForRole } from '../auth/config/routeConfig'
import LandingNav from './components/LandingNav'
import LandingIntro from './components/LandingIntro'
import ScrollFirstPersonOrder from './components/ScrollFirstPersonOrder'
import ScrollIpadDashboard from './components/ScrollIpadDashboard'

const FEATURES = [
  { icon: QrCode, title: 'Table & QR flow', desc: 'Assign tables and let guests order from their phone.' },
  { icon: ChefHat, title: 'Kitchen display', desc: 'Live KOT queue with real-time socket updates.' },
  { icon: LayoutGrid, title: 'Reception POS', desc: 'Menu, cart, billing, and reports in one flow.' },
  { icon: BarChart3, title: 'Admin analytics', desc: 'Revenue charts, KPIs, and day-wise insights.' },
  { icon: Package, title: 'Inventory', desc: 'Stock alerts, suppliers, and menu management.' },
  { icon: Users, title: 'Staff & roles', desc: 'HR, attendance, payroll, and app access control.' },
  { icon: Bell, title: 'Live alerts', desc: 'Low stock, kitchen queue, and billing notifications.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, allowedRoles, loading } = useAuth()

  useEffect(() => {
    if (loading || !user || allowedRoles.length === 0) return

    if (allowedRoles.length > 1) {
      navigate('/select-role', { replace: true })
      return
    }

    const active = getActiveRole()
    const role = active && allowedRoles.includes(active) ? active : allowedRoles[0]
    navigate(routeForRole(role), { replace: true })
  }, [loading, user, allowedRoles, navigate])

  if (loading || user) {
    return <AuthLoadingPage />
  }

  return (
    <div className="landing-page">
      <LandingNav />

      <LandingIntro />

      <ScrollFirstPersonOrder />

      <ScrollIpadDashboard />

      <section id="features" className="landing-features">
        <div className="landing-section-head">
          <p>Why Grahmind</p>
          <h2>Everything you need to run a profitable floor</h2>
          <span>One dashboard for dine-in, kitchen, billing, and back office.</span>
        </div>
        <div className="landing-feature-grid">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="landing-feature-card">
              <span className="landing-feature-icon">
                <Icon className="h-5 w-5" />
              </span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="cta" className="landing-cta">
        <div className="landing-cta-inner">
          <h2>Ready to modernize your restaurant?</h2>
          <p>Sign in with your staff account or ask your admin for access.</p>
          <Link to="/login" className="landing-btn landing-btn-primary landing-btn-lg">
            Go to login
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Grahmind Innovations · Restaurant Management System</p>
      </footer>
    </div>
  )
}
