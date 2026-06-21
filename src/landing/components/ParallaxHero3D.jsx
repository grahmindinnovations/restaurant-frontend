import { Fragment, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  QrCode,
  ShoppingCart,
  Send,
} from 'lucide-react'
import { FOOD_IMAGES } from '../data/foodImages'

const GUEST_STEPS = [
  {
    num: 1,
    icon: QrCode,
    title: 'Scan table QR',
    desc: 'Guest opens the menu — no app download.',
    render: () => (
      <div className="ofh-step-mock ofh-step-mock-scan">
        <div className="ofh-qr">
          <QrCode className="h-10 w-10" />
        </div>
        <p>Grahmind Bistro</p>
        <span>Table 4</span>
      </div>
    ),
  },
  {
    num: 2,
    icon: ShoppingCart,
    title: 'Add to cart',
    desc: 'Tap dishes, apply offers, review items.',
    render: () => (
      <div className="ofh-step-mock ofh-step-mock-cart">
        {FOOD_IMAGES.slice(0, 2).map((food) => (
          <div key={food.id} className="ofh-cart-row">
            <img src={food.src} alt={food.name} draggable={false} />
            <div>
              <strong>{food.name}</strong>
              <span>{food.price}</span>
            </div>
            <button type="button" aria-hidden>
              +
            </button>
          </div>
        ))}
        <p className="ofh-cart-total">2 items · ₹800</p>
      </div>
    ),
  },
  {
    num: 3,
    icon: Send,
    title: 'Place order',
    desc: 'Sent live to kitchen & reception POS.',
    render: () => (
      <div className="ofh-step-mock ofh-step-mock-order">
        <CheckCircle2 className="ofh-order-check" />
        <strong>Order placed!</strong>
        <p>KOT #1042 → Kitchen</p>
        <div className="ofh-order-items">
          {FOOD_IMAGES.slice(2, 4).map((food) => (
            <img key={food.id} src={food.src} alt={food.name} draggable={false} />
          ))}
        </div>
      </div>
    ),
  },
]

export default function ParallaxHero3D() {
  const stageRef = useRef(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveStep((s) => (s + 1) % GUEST_STEPS.length)
    }, 3200)
    return () => window.clearInterval(id)
  }, [])

  const onMove = (e) => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    })
  }

  return (
    <section className="order-flow-hero" id="order-universe">
      <div className="order-flow-hero-bg" />
      <div className="order-flow-hero-inner">
        <div className="order-flow-hero-copy">
          <p className="order-flow-hero-badge">Guest ordering · 3 simple steps</p>
          <h1>
            Scan. Cart. Order.
            <span>Done in under a minute</span>
          </h1>
          <p className="order-flow-hero-sub">
            Your guest scans the table QR, picks from a photo-rich menu, and confirms the order.
            Kitchen and reception see it instantly — no waiter round-trips.
          </p>
          <div className="order-flow-hero-cta">
            <Link to="/login" className="landing-btn landing-btn-primary landing-btn-lg">
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#experience" className="landing-btn landing-btn-outline landing-btn-lg">
              Try live phone demo
            </a>
          </div>
          <ul className="order-flow-hero-list">
            {GUEST_STEPS.map((step, i) => (
              <li key={step.num} className={i === activeStep ? 'active' : ''}>
                <button type="button" onClick={() => setActiveStep(i)}>
                  <span>{step.num}</span>
                  {step.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div
          ref={stageRef}
          className="order-flow-hero-stage"
          onMouseMove={onMove}
          onMouseLeave={() => setMouse({ x: 0, y: 0 })}
        >
          <div
            className="order-flow-pipeline"
            style={{
              transform: `
                rotateY(${mouse.x * -4}deg)
                rotateX(${4 + mouse.y * 3}deg)
              `,
            }}
          >
            {GUEST_STEPS.map((step, i) => (
              <Fragment key={step.num}>
                <article
                  className={`order-flow-step-card ${i === activeStep ? 'active' : ''} ${i < activeStep ? 'done' : ''}`}
                  onMouseEnter={() => setActiveStep(i)}
                >
                  <header>
                    <span className="order-flow-step-num">{step.num}</span>
                    <step.icon className="order-flow-step-icon" />
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </header>
                  {step.render()}
                </article>
                {i < GUEST_STEPS.length - 1 && (
                  <div className="order-flow-arrow" aria-hidden>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
