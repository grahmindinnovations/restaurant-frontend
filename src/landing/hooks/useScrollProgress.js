import { useEffect, useState } from 'react'

/** Returns 0–1 scroll progress for an element within the viewport. */
export function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      if (total <= 0) {
        setProgress(0)
        return
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total)
      setProgress(scrolled / total)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [ref])

  return progress
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}
