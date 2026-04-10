import { useEffect, useRef } from 'react'
import { STUDY_TIMER_MS } from '../../lib/constants'

export default function TimerBar({ running, onTimeout, resetKey }) {
  const barRef = useRef(null)
  const rafRef = useRef(null)
  const offsetRef = useRef(0)       // 일시정지 전까지 누적된 경과 ms
  const lastStartRef = useRef(null) // 현재 구간 시작 시점
  const prevResetKeyRef = useRef(resetKey)

  useEffect(() => {
    cancelAnimationFrame(rafRef.current)

    // 새 문제 (resetKey 변경): 오프셋 초기화
    if (resetKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = resetKey
      offsetRef.current = 0
      lastStartRef.current = null
    } else if (!running && lastStartRef.current !== null) {
      // 일시정지: 현재까지 경과 시간 저장
      offsetRef.current += performance.now() - lastStartRef.current
      lastStartRef.current = null
    }

    if (!running) return

    // 실행 시작 (또는 재개)
    lastStartRef.current = performance.now()
    const tick = (now) => {
      const elapsed = offsetRef.current + (now - lastStartRef.current)
      const pct = Math.min(elapsed / STUDY_TIMER_MS, 1)
      if (barRef.current) {
        barRef.current.style.width = `${(1 - pct) * 100}%`
        barRef.current.style.background = `rgb(${Math.round(pct * 220)},${Math.round((1 - pct) * 200 + 50)},${Math.round((1 - pct) * 60)})`
      }
      if (pct < 1) rafRef.current = requestAnimationFrame(tick)
      else { lastStartRef.current = null; onTimeout() }
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
