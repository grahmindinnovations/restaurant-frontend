import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MousePointerClick, Zap } from 'lucide-react'
import { lerp, useScrollProgress } from '../hooks/useScrollProgress'
import PhoneMockup, { SCREENS } from './PhoneMockup'

const STEPS = [
  {
    eyebrow: 'Guest experience',
    title: 'Boost revenue with an intuitive menu & easy ordering',
    body: 'Rich visuals, smart categories, and one-tap add-to-cart — the same flow guests expect from top delivery apps.',
    stats: [
      { label: 'Revenue lift', value: '+25%' },
      { label: 'Guest rating', value: '4.9★' },
      { label: 'Faster orders', value: '40%' },
    ],
  },
  {
    eyebrow: 'Operations',
    title: 'Fast-track orders and delight every table',
    body: 'Orders beam straight to kitchen display. Staff stay focused — guests track status live on their phone.',
    stats: [
      { label: 'Wait time', value: '−40%' },
      { label: 'Active orders', value: 'Live' },
      { label: 'KOT sync', value: 'Real-time' },
    ],
  },
  {
    eyebrow: 'One dashboard',
    title: 'Run POS, kitchen, inventory & analytics from one place',
    body: 'Admin metrics, low-stock alerts, staff access, and billing — built for modern restaurants and cafes.',
    stats: [
      { label: 'Roles', value: '5+' },
      { label: 'Channels', value: 'All-in-one' },
      { label: 'Setup', value: '< 1 hr' },
    ],
  },
]

const DEMO_CHECKLIST = [
  { screen: 0, label: 'Browse rich menu categories', emoji: '🍽️' },
  { screen: 1, label: 'View offers & promotions', emoji: '🏷️' },
  { screen: 2, label: 'Test the frictionless cart', emoji: '🛒' },
  { screen: 3, label: 'Track order status in real-time', emoji: '📦' },
]

export default function ScrollPhoneHero() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const progress = useScrollProgress(sectionRef)
  const userPickedRef = useRef(false)
  const pickTimeoutRef = useRef(null)

  const [screenIndex, setScreenIndex] = useState(0)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  const scrollScreen = Math.min(SCREENS.length - 1, Math.floor(progress * SCREENS.length))

  useEffect(() => {
    if (userPickedRef.current) return
    setScreenIndex(scrollScreen)
  }, [scrollScreen])

  const pickScreen = useCallback((index) => {
    userPickedRef.current = true
    setScreenIndex(index)
    clearTimeout(pickTimeoutRef.current)
    pickTimeoutRef.current = setTimeout(() => {
      userPickedRef.current = false
    }, 4000)
  }, [])

  useEffect(() => () => clearTimeout(pickTimeoutRef.current), [])

  const stepIndex = Math.min(STEPS.length - 1, screenIndex)
  const step = STEPS[stepIndex]

  const rotateY = lerp(-6, -38, progress) + mouse.x * 4
  const rotateX = lerp(4, 14, progress) + mouse.y * -3
  const translateX = lerp(0, 38, progress)
  const translateZ = lerp(0, -140, progress)
  const scale = lerp(1, 0.82, progress)

  const pedestalY1 = lerp(0, 28, progress) + mouse.y * 6
  const pedestalY2 = lerp(0, 42, progress) + mouse.y * 10
  const pedestalY3 = lerp(0, 58, progress) + mouse.y * 14
  const pedestalScale = lerp(1, 0.88, progress)

  const onStageMove = (e) => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    setMouse({ x, y })
  }

  return (
    <section ref={sectionRef} className="scroll-phone-section">
      <div className="scroll-phone-sticky">
        <div className="scroll-phone-grid">
          <div className="scroll-phone-copy">
            <p className="scroll-phone-eyebrow">{step.eyebrow}</p>
            <h2 className="scroll-phone-title">{step.title}</h2>
            <p className="scroll-phone-body">{step.body}</p>
            <div className="scroll-phone-stats">
              {step.stats.map((s) => (
                <div key={s.label} className="scroll-phone-stat">
                  <span className="scroll-phone-stat-value">{s.value}</span>
                  <span className="scroll-phone-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="demo-checklist">
              <p className="demo-checklist-title">Live demo checklist</p>
              <ul>
                {DEMO_CHECKLIST.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      className={screenIndex === item.screen ? 'active' : ''}
                      onClick={() => pickScreen(item.screen)}
                    >
                      <span>{item.emoji}</span>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="scroll-phone-actions">
              <Link to="/login" className="landing-btn landing-btn-primary">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="scroll-phone-hint">
                <MousePointerClick className="h-3.5 w-3.5" />
                Tap the phone or checklist · scroll to animate
              </span>
            </div>
            <div className="scroll-phone-dots">
              {SCREENS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={s.label}
                  className={i === screenIndex ? 'active' : ''}
                  onClick={() => pickScreen(i)}
                />
              ))}
            </div>
          </div>

          <div
            ref={stageRef}
            className="scroll-phone-stage"
            onMouseMove={onStageMove}
            onMouseLeave={() => setMouse({ x: 0, y: 0 })}
          >
            <div className="scroll-phone-pedestal-stack">
              <div
                className="scroll-phone-pedestal scroll-phone-pedestal-outer"
                style={{
                  opacity: lerp(0.35, 0.15, progress),
                  transform: `translateY(${pedestalY1}px) scale(${pedestalScale * 1.15}) rotateX(72deg)`,
                }}
              />
              <div
                className="scroll-phone-pedestal scroll-phone-pedestal-mid"
                style={{
                  opacity: lerp(0.55, 0.25, progress),
                  transform: `translateY(${pedestalY2}px) scale(${pedestalScale}) rotateX(72deg)`,
                }}
              />
              <div
                className="scroll-phone-pedestal scroll-phone-pedestal-inner"
                style={{
                  opacity: lerp(0.85, 0.4, progress),
                  transform: `translateY(${pedestalY3}px) scale(${pedestalScale * 0.85}) rotateX(72deg)`,
                }}
              />
            </div>

            <div
              className="scroll-phone-3d scroll-phone-3d-interactive"
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
              <button
                type="button"
                className="scroll-phone-tap-badge"
                onClick={() => pickScreen((screenIndex + 1) % SCREENS.length)}
              >
                <Zap className="h-3 w-3" />
                Tap to explore
              </button>
              <PhoneMockup
                screenIndex={screenIndex}
                interactive
                onScreenChange={pickScreen}
              />
            </div>

            <div className="scroll-phone-glow" style={{ opacity: lerp(0.55, 0.2, progress) }} />
          </div>
        </div>
      </div>
    </section>
  )
}
