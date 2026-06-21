import { Link } from 'react-router-dom'
import {
  ArrowDown,
  ArrowRight,
  ChefHat,
  MessageCircle,
  QrCode,
  Smartphone,
  Tablet,
  Zap,
} from 'lucide-react'

const FLOW = [
  {
    icon: QrCode,
    label: 'Guest',
    title: 'Scan & order from the table',
    desc: 'No app download. QR opens the menu, cart, track, and pay.',
  },
  {
    icon: ChefHat,
    label: 'Kitchen',
    title: 'Instant KOT on iPad',
    desc: 'New orders ping the kitchen display with prep timers and status.',
  },
  {
    icon: Tablet,
    label: 'Admin',
    title: 'Bills, tables & analytics',
    desc: 'See every table’s bill, payments, staff, inventory, and revenue.',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    title: 'E-bill after payment',
    desc: 'Updated receipt sent to the guest’s number — show at exit.',
  },
]

const STATS = [
  { value: '1 QR', label: 'Per table · zero friction' },
  { value: 'Live', label: 'Kitchen & POS sync' },
  { value: '6 roles', label: 'Admin to employee' },
]

export default function LandingIntro() {
  return (
    <section id="intro" className="landing-intro">
      <div className="landing-intro-inner">
        <div className="landing-intro-copy">
          <p className="landing-hero-badge">Grahmind Restaurant OS</p>
          <h1>
            One platform for
            <span>guests, kitchen & your back office</span>
          </h1>
          <p className="landing-hero-sub landing-intro-sub">
            Grahmind connects dine-in ordering, live kitchen tickets, reception POS,
            inventory, staff, and admin analytics — so every table from scan to
            WhatsApp bill runs on the same system your team already uses.
          </p>

          <div className="landing-intro-stats">
            {STATS.map((stat) => (
              <div key={stat.label} className="landing-intro-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="landing-hero-cta landing-intro-cta">
            <a href="#order-universe" className="landing-btn landing-btn-primary">
              <Smartphone className="h-4 w-4" />
              See the guest journey
              <ArrowDown className="h-4 w-4" />
            </a>
            <Link to="/table/4" className="landing-btn landing-btn-outline">
              Try live table demo
            </Link>
            <Link to="/login" className="landing-btn landing-btn-ghost">
              Staff login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="landing-intro-flow">
          <p className="landing-intro-flow-label">
            <Zap className="h-3.5 w-3.5" />
            How it connects
          </p>
          <div className="landing-intro-flow-track">
            {FLOW.map(({ icon: Icon, label, title, desc }, i) => (
              <article key={label} className="landing-intro-flow-card">
                <div className="landing-intro-flow-step">{i + 1}</div>
                <span className="landing-intro-flow-icon">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="landing-intro-flow-tag">{label}</p>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
          <p className="landing-intro-scroll-hint">
            Scroll below for the interactive 3D demo — phone in hand, then admin iPad
          </p>
        </div>
      </div>
    </section>
  )
}
