import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChefHat, LayoutGrid, UtensilsCrossed } from 'lucide-react'
import { lerp, useScrollProgress } from '../hooks/useScrollProgress'
import DashboardMockup from './DashboardMockup'

const ADMIN_TABS = [
  { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
  { id: 'tables', label: 'Table bills', icon: UtensilsCrossed },
  { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
  { id: 'alerts', label: 'Alerts', icon: LayoutGrid },
]

export default function ScrollIpadDashboard() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const progress = useScrollProgress(sectionRef)
  const [activeView, setActiveView] = useState('kitchen')
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (progress < 0.45) setActiveView('kitchen')
    else setActiveView('tables')
  }, [progress])

  const showKitchenAlert = progress < 0.55

  const rotateY = lerp(28, 8, progress) + mouse.x * -3
  const rotateX = lerp(10, 4, progress) + mouse.y * 2
  const translateX = lerp(-18, 0, progress)
  const translateZ = lerp(-80, 0, progress)
  const scale = lerp(0.88, 1, progress)

  const ringY1 = lerp(40, 10, progress) + mouse.y * 8
  const ringY2 = lerp(55, 18, progress) + mouse.y * 12

  const onStageMove = (e) => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    })
  }

  return (
    <section ref={sectionRef} className="scroll-ipad-section" id="admin-demo">
      <div className="scroll-ipad-sticky">
        <div className="scroll-ipad-grid">
          <div
            ref={stageRef}
            className="scroll-ipad-stage"
            onMouseMove={onStageMove}
            onMouseLeave={() => setMouse({ x: 0, y: 0 })}
          >
            <div className="scroll-ipad-pedestal-stack">
              <div
                className="scroll-ipad-pedestal scroll-ipad-pedestal-outer"
                style={{ transform: `translateY(${ringY1}px) scale(1.1) rotateX(76deg)` }}
              />
              <div
                className="scroll-ipad-pedestal scroll-ipad-pedestal-inner"
                style={{ transform: `translateY(${ringY2}px) scale(0.92) rotateX(76deg)` }}
              />
            </div>

            <div
              className="scroll-ipad-3d"
              style={{
                transform: `
                  translateX(${translateX}%)
                  translateZ(${translateZ}px)
                  rotateY(${rotateY}deg)
                  rotateX(${rotateX}deg)
                  scale(${scale})
                `,
              }}
            >
              <div className="ipad-mockup-shell">
                <div className="ipad-mockup-camera" />
                <div className="ipad-mockup-screen">
                  <DashboardMockup
                    activeView={activeView}
                    onViewChange={setActiveView}
                    showKitchenAlert={showKitchenAlert}
                  />
                </div>
              </div>
            </div>

            {showKitchenAlert && activeView === 'kitchen' && (
              <div className="scroll-ipad-kitchen-float">
                <ChefHat className="h-4 w-4" />
                <div>
                  <strong>Kitchen notified</strong>
                  <span>New KOT · Table 4 · Order #1042</span>
                </div>
              </div>
            )}
          </div>

          <div className="scroll-ipad-copy">
            <p className="scroll-phone-eyebrow">Admin side preview</p>
            <h2 className="scroll-phone-title">
              {activeView === 'kitchen'
                ? 'Kitchen gets instant new-order alerts'
                : 'See every table bill in one panel'}
            </h2>
            <p className="scroll-phone-body">
              {activeView === 'kitchen'
                ? 'When a guest places an order from QR, the iPad Kitchen tab flashes a new KOT — same items as the guest Orders tab.'
                : 'After guests pay on phone, admin sees paid / unpaid status per table — including WhatsApp e-bills. Table 4 shows your demo at ₹923.'}
            </p>

            <div className="ipad-demo-tabs" role="tablist" aria-label="Admin demo views">
              {ADMIN_TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeView === tab.id}
                    className={`${activeView === tab.id ? 'active' : ''} ${tab.id === 'kitchen' && showKitchenAlert ? 'has-alert-dot' : ''}`}
                    onClick={() => setActiveView(tab.id)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
            <p className="ipad-demo-hint">Scroll to switch Kitchen → Table bills · or tap tabs in iPad</p>

            <div className="scroll-phone-stats">
              <div className="scroll-phone-stat">
                <span className="scroll-phone-stat-value">{activeView === 'kitchen' ? '1' : '₹6,353'}</span>
                <span className="scroll-phone-stat-label">
                  {activeView === 'kitchen' ? 'New KOTs' : 'Paid tonight'}
                </span>
              </div>
              <div className="scroll-phone-stat">
                <span className="scroll-phone-stat-value">{activeView === 'kitchen' ? '4' : '6'}</span>
                <span className="scroll-phone-stat-label">
                  {activeView === 'kitchen' ? 'In queue' : 'Tables active'}
                </span>
              </div>
              <div className="scroll-phone-stat">
                <span className="scroll-phone-stat-value">{activeView === 'kitchen' ? '12m' : '4'}</span>
                <span className="scroll-phone-stat-label">
                  {activeView === 'kitchen' ? 'Avg prep' : 'E-bills sent'}
                </span>
              </div>
            </div>

            <Link to="/login" className="landing-btn landing-btn-primary">
              Open admin console
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
