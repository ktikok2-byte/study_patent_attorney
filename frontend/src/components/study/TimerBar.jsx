import { useEffect, useRef } from 'react'
import { STUDY_TIMER_MS } from '../../lib/constants'

export default function TimerBar({ running, onTimeout, resetKey }) {
  const barRef = useRef(null)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!running) {
      cancelAnimationFrame(rafRef.current)
      return
    }
    startRef.current = performance.now()
    const tick = (now) => {
      const elapsed = now - startRef.current
      const pct = Math.min(elapsed / STUDY_TIMER_MS, 1)
      if (barRef.current) {
        barRef.current.style.width = `${(1 - pct) * 100}%`
        const g = Math.round(pct * 255)
        barRef.current.style.background = `rgb(${Math.round(pct * 220)},${Math.round((1 - pct) * 200 + 50)},${Math.round((1 - pct) * 60)})`
      }
      if (pct < 1) rafRef.current = requestAnimationFrame(tick)
      else onTimeout()
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running, resetKey])

  return (
    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
      <div ref={barRef} style={{ height: '100%', width: '100%', background: '#16a34a', borderRadius: 4, transition: 'none' }} />
    </div>
  )
}
