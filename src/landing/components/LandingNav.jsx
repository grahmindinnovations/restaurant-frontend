import { Link } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'

export default function LandingNav() {
  return (
    <header className="landing-nav">
      <div className="landing-nav-inner">
        <Link to="/" className="landing-brand">
          <span className="landing-brand-icon">
            <UtensilsCrossed className="h-4 w-4" />
          </span>
          <span>
            <strong>Grahmind</strong>
            <small>Restaurant OS</small>
          </span>
        </Link>
        <nav className="landing-nav-links">
          <a href="#intro">About</a>
          <a href="#order-universe">Guest journey</a>
          <a href="#admin-demo">Admin demo</a>
          <a href="#features">Features</a>
        </nav>
        <div className="landing-nav-actions">
          <Link to="/login" className="landing-btn landing-btn-ghost">
            Login
          </Link>
          <Link to="/login" className="landing-btn landing-btn-primary">
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
