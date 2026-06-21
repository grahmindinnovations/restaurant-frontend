import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, MousePointerClick } from 'lucide-react'
import { lerp, useScrollProgress } from '../hooks/useScrollProgress'
import PhoneMockup, { DEFAULT_CART, GUEST_LIFECYCLE } from './PhoneMockup'
import '../fp-order.css'

const QR_IMAGE =
  'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://grahmind.com/table/4&margin=8'

/** Three macro steps shown in the UI */
const STEPS = [
  {
    step: 1,
    eyebrow: 'Step 1 · Scan & order',
    title: 'Scan QR and place your first order',
    body: 'Guest scans the table tent, picks dishes, and sends the first KOT to kitchen.',
  },
  {
    step: 2,
    eyebrow: 'Step 2 · Notify & track',
    title: 'Orders tab notification + prep timer',
    body: 'Order appears in Orders with every item. Track tab shows live countdown while kitchen prepares. Add more anytime — bill updates.',
  },
  {
    step: 3,
    eyebrow: 'Step 3 · Pay & e-bill',
    title: 'Pay updated bill · WhatsApp receipt',
    body: 'Final bill includes add-ons. Pay on phone — e-bill goes to WhatsApp. Show it at exit.',
  },
]

const EXTRA_ITEM = { name: 'Berry Cheesecake', qty: 1, amount: 260 }

function macroStep(progress) {
  if (progress < 0.28) return 0
  if (progress < 0.72) return 1
  return 2
}

/** Phone scene from scroll position */
function phoneScene(progress) {
  if (progress < 0.14) return 'scan'
  if (progress < 0.26) return 'menu'
  if (progress < 0.38) return 'orders'
  if (progress < 0.52) return 'track'
  if (progress < 0.64) return 'order_more'
  if (progress < 0.78) return 'pay'
  if (progress < 0.92) return 'whatsapp'
  return 'whatsapp_bill'
}

export default function ScrollFirstPersonOrder() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const progress = useScrollProgress(sectionRef)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [screenIndex, setScreenIndex] = useState(0)
  const [extraAdded, setExtraAdded] = useState(false)
  const [ebillSent, setEbillSent] = useState(false)

  const scene = phoneScene(progress)
  const stepIdx = macroStep(progress)
  const copy = STEPS[stepIdx]

  const cartLines = useMemo(
    () => (extraAdded ? [...DEFAULT_CART, EXTRA_ITEM] : DEFAULT_CART),
    [extraAdded],
  )

  const lifecycle = useMemo(() => {
    if (ebillSent || scene === 'whatsapp' || scene === 'whatsapp_bill') return GUEST_LIFECYCLE.EBILL
    if (scene === 'pay') return GUEST_LIFECYCLE.PAY
    if (scene === 'order_more') return GUEST_LIFECYCLE.ORDER_MORE
    if (scene === 'track') return GUEST_LIFECYCLE.PREPARING
    if (scene === 'orders') return GUEST_LIFECYCLE.PLACED
    return GUEST_LIFECYCLE.MENU
  }, [scene, ebillSent])

  useEffect(() => {
    if (progress < 0.5) setExtraAdded(false)
    if (progress < 0.75) setEbillSent(false)
  }, [progress])

  useEffect(() => {
    if (scene === 'orders') setScreenIndex(3)
    if (scene === 'track') setScreenIndex(4)
    if (scene === 'order_more') setScreenIndex(0)
  }, [scene])

  const phoneInteractive = scene === 'menu' || scene === 'order_more'
  const showScan = scene === 'scan'
  const showHand = progress >= 0.1

  const onStageMove = (e) => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    })
  }

  const handlePlaceOrder = useCallback(() => setScreenIndex(3), [])
  const handleAddExtra = useCallback(() => setExtraAdded(true), [])
  const handlePay = useCallback(() => {
    window.setTimeout(() => setEbillSent(true), 700)
  }, [])

  const scanPhoneY = lerp(90, 0, Math.min(progress / 0.12, 1))
  const handTranslateY = lerp(4, -2, Math.min(Math.max((progress - 0.1) / 0.2, 0), 1))

  return (
    <section ref={sectionRef} id="order-universe" className="fp-order-section fp-order-section-long">
      <div className="fp-order-sticky">
        <div className="fp-order-grid">
          <div className="fp-order-copy">
            <p className="scroll-phone-eyebrow">{copy.eyebrow}</p>
            <h1 className="scroll-phone-title">{copy.title}</h1>
            <p className="scroll-phone-body">{copy.body}</p>

            <div className="fp-order-steps fp-order-steps-three">
              {STEPS.map((s, i) => (
                <span key={s.step} className={stepIdx === i ? 'active' : progress > (i + 1) / 3 - 0.05 ? 'done' : ''}>
                  {s.step}
                </span>
              ))}
            </div>

            {phoneInteractive && (
              <p className="fp-order-hint">
                <MousePointerClick className="h-3.5 w-3.5" />
                {scene === 'order_more' ? 'Tap Berry Cheesecake to add · bill updates' : 'Tap menu items · Place order from Cart'}
              </p>
            )}

            {scene === 'track' && (
              <p className="fp-order-hint fp-order-hint-timer">⏱ Kitchen preparing · ~12 min on Track tab</p>
            )}

            {extraAdded && stepIdx >= 1 && scene !== 'whatsapp' && scene !== 'whatsapp_bill' && (
              <p className="fp-order-hint fp-order-hint-updated">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Bill updated with dessert · ₹923 total
              </p>
            )}

            {(scene === 'whatsapp' || scene === 'whatsapp_bill') && (
              <p className="fp-order-hint fp-order-hint-updated">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {scene === 'whatsapp_bill'
                  ? 'Open chat · full e-bill with item breakdown'
                  : 'E-bill arrived on WhatsApp · Grahmind Bistro'}
              </p>
            )}

            <div className="fp-order-cta">
              <Link to="/table/4" className="landing-btn landing-btn-primary">
                Try live table demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#admin-demo" className="landing-btn landing-btn-outline">
                See admin table bills
              </a>
            </div>
          </div>

          <div ref={stageRef} className="fp-order-stage" onMouseMove={onStageMove} onMouseLeave={() => setMouse({ x: 0, y: 0 })}>
            <div className="fp-order-backdrop" />

            {showScan && (
              <div className="fp-scene fp-scene-scan" style={{ opacity: 1 - progress / 0.14 }}>
                <div className="fp-table-dock">
                  <div className="fp-table-wood" />
                  <div className="fp-qr-stand">
                    <div className="fp-qr-stand-pole" aria-hidden />
                    <div className="fp-qr-stand-card">
                      <img src={QR_IMAGE} alt="Table 4 QR" className="fp-qr-image" draggable={false} referrerPolicy="no-referrer" />
                      <div className="fp-qr-stand-label">
                        <strong>Grahmind Bistro</strong>
                        <span>Table 4 · Scan to order</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="fp-scan-phone" style={{ transform: `translateY(${scanPhoneY}%) translateX(${mouse.x * 4}px)` }}>
                  <div className="fp-scan-phone-body">
                    <div className="fp-scan-viewfinder">
                      <img src={QR_IMAGE} alt="" className="fp-scan-viewfinder-qr" draggable={false} referrerPolicy="no-referrer" />
                      <span className="fp-scan-line" />
                    </div>
                    <p>Scanning QR…</p>
                  </div>
                </div>
              </div>
            )}

            {showHand && (
              <div
                className="fp-scene fp-scene-hand"
                style={{
                  opacity: showScan ? Math.min(1, (progress - 0.1) / 0.12) : 1,
                  transform: `translateY(${handTranslateY}%)`,
                }}
              >
                <div
                  className="fp-hand-decor"
                  style={{
                    transform: `rotateY(${lerp(-4, 6, progress) + mouse.x * 3}deg) rotateX(${lerp(6, 4, progress) + mouse.y * -2}deg)`,
                  }}
                  aria-hidden
                >
                  <div className="fp-hand-palm" />
                  <div className="fp-hand-thumb" />
                </div>

                <div
                  className="fp-hand-phone"
                  style={{
                    transform: `translateX(${mouse.x * 6}px) translateY(${mouse.y * 4}px)`,
                  }}
                >
                  <PhoneMockup
                      screenIndex={screenIndex}
                      interactive={phoneInteractive}
                      onScreenChange={setScreenIndex}
                      lifecycle={lifecycle}
                      guestPhone="+91 98765 43210"
                      etaMinutes={12}
                      onPlaceOrder={handlePlaceOrder}
                      onPay={handlePay}
                      onAddExtra={handleAddExtra}
                      cartLines={cartLines}
                      extraAdded={extraAdded}
                      showOrdersToast={false}
                      showBigTimer={scene === 'track'}
                      orderMoreMode={scene === 'order_more'}
                      showWhatsAppBillOpen={scene === 'whatsapp_bill'}
                    />
                </div>

                {scene === 'orders' && (
                  <div className="fp-order-toast">
                    <CheckCircle2 className="fp-order-toast-icon" />
                    <div>
                      <strong>New order notification</strong>
                      <span>Check Orders tab · 2 items</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        <div className="fp-scroll-progress" aria-hidden>
          <div className="fp-scroll-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </section>
  )
}
