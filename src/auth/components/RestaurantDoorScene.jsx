import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'

export default function RestaurantDoorScene({ doorOpen = false, hideForm = false, children }) {
  const sceneRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    const onMove = (e) => {
      const rect = scene.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
      setTilt({ x, y })
    }

    scene.addEventListener('mousemove', onMove)
    return () => scene.removeEventListener('mousemove', onMove)
  }, [])

  const parallax = (depth) => ({
    transform: `translate3d(${tilt.x * depth}px, ${tilt.y * depth * 0.5}px, 0)`,
  })

  return (
    <div ref={sceneRef} className={`login-door-scene ${doorOpen ? 'is-opening' : ''}`}>
      <Link to="/" className="login-door-back">
        ← Back to home
      </Link>

      <div className="login-door-sky" style={parallax(-14)} />
      <div className="login-door-street" style={parallax(8)} />

      <div className="login-door-stage">
        <div
          className="login-door-building-wrap"
          style={{
            transform: `rotateX(${6 + tilt.y * 1.5}deg) rotateY(${tilt.x * -2.5}deg)`,
          }}
        >
          <div className={`login-door-open-zoom ${doorOpen ? 'is-active' : ''}`}>
            <div className="login-door-facade">
              <div className="login-door-awning" style={parallax(4)} />
              <div className="login-door-sign" style={parallax(3)}>
                <UtensilsCrossed className="h-4 w-4" />
                <span>Grahmind Bistro</span>
              </div>
              <div className="login-door-lights" style={parallax(2)}>
                <span />
                <span />
                <span />
              </div>

              <div className="login-door-doorway">
                <div className="login-door-frame">
                  <div className="login-door-interior">
                    <div className="login-door-interior-glow" />
                    <div className="login-door-interior-beam" />
                    <div className="login-door-interior-floor" />
                    <p className="login-door-welcome">Welcome in</p>
                  </div>

                  <div className="login-door-panel login-door-panel-left">
                    <div className="login-door-panel-face">
                      <div className="login-door-glass" />
                      <div className="login-door-handle" />
                    </div>
                  </div>
                  <div className="login-door-panel login-door-panel-right">
                    <div className="login-door-panel-face">
                      <div className="login-door-glass" />
                      <div className="login-door-handle" />
                    </div>
                  </div>

                  <div className="login-door-seam" aria-hidden />
                </div>

                <div className={`login-door-form-slot ${hideForm ? 'is-hidden' : ''}`}>
                  {children}
                </div>
              </div>

              <div className="login-door-steps" />
            </div>
          </div>
        </div>
      </div>

      {doorOpen && <div className="login-door-flash" aria-hidden />}
      <div className="login-door-vignette" />
    </div>
  )
}
