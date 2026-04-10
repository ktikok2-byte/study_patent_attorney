import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useOxItems, useUserStats } from '../hooks/useOxItems'
import { useStats } from '../hooks/useStats'
import TimerBar from '../components/study/TimerBar'
import StudyCard from '../components/study/StudyCard'
import AnswerPanel from '../components/study/AnswerPanel'
import PauseOverlay from '../components/study/PauseOverlay'

function getAnswer(item) { return item.is_correct ? 'O' : 'X' }

function sortAuto(items, stats) {
  return [...items].sort((a, b) => {
    const sa = stats[a.id] || {}, sb = stats[b.id] || {}
    const ca = sa.correct_count ?? 0, cb = sb.correct_count ?? 0
    const wa = sa.wrong_count ?? 0, wb = sb.wrong_count ?? 0
    if (ca !== cb) return ca - cb
    if (wa !== wb) return wb - wa
    return Math.random() - 0.5
  })
}

export default function StudyPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { items: allItems, loading } = useOxItems()
  const { stats, fetchStats } = useUserStats()
  const { recordAnswer } = useStats()
  const [queue, setQueue] = useState([])
  const [idx, setIdx] = useState(0)
  const [knowPressed, setKnowPressed] = useState(false)
  const [oxEnabled, setOxEnabled] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [chosenAnswer, setChosenAnswer] = useState(null)
  const [paused, setPaused] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [startTime, setStartTime] = useState(Date.now())

  useEffect(() => {
    if (loading || !allItems.length) return
    const ids = location.state?.ids
    const pool = ids ? allItems.filter(i => ids.includes(i.id)) : allItems
    setQueue(sortAuto(pool, stats))
    setIdx(0); reset()
  }, [loading, allItems])

  const reset = () => {
    setKnowPressed(false); setOxEnabled(false); setRevealed(false)
    setChosenAnswer(null); setResetKey(k => k + 1); setStartTime(Date.now())
  }

  const current = queue[idx]

  const handleKnow = () => { setKnowPressed(true); setOxEnabled(true) }

  const handleTimeout = useCallback(async () => {
    if (revealed || !current) return
    await recordAnswer(current.id, 'timeout', Date.now() - startTime)
    await fetchStats()
    setRevealed(true)
  }, [revealed, current, startTime])

  const handleAnswer = async (choice) => {
    if (revealed || !current) return
    setChosenAnswer(choice)
    const correct = choice === current.answer
    await recordAnswer(current.id, correct ? 'correct' : 'wrong', Date.now() - startTime)
    await fetchStats()
    setRevealed(true)
  }

  const handleDontKnow = async () => {
    if (revealed || !current) return
    await recordAnswer(current.id, 'wrong', Date.now() - startTime)
    await fetchStats()
    setRevealed(true)
  }

  const handleSkip = async () => {
    if (!current) return
    await recordAnswer(current.id, 'skip', Date.now() - startTime)
    await fetchStats()
    handleNext()
  }

  const handleNext = () => {
    if (idx + 1 >= queue.length) { navigate('/') ; return }
    setIdx(i => i + 1); reset()
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>
  if (!queue.length) return <div style={{ padding: 40, textAlign: 'center' }}>학습할 문제가 없습니다. <button onClick={() => navigate('/')}>홈으로</button></div>

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#64748b' }}>자동학습 모드</span>
        <button onClick={() => setPaused(p => !p)} style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#fff', color: '#374151' }}>
          {paused ? '▶ 재개' : '⏸ 정지'}
        </button>
      </div>
      <TimerBar running={!paused && !revealed} onTimeout={handleTimeout} resetKey={resetKey} />
      <StudyCard item={current} index={idx} total={queue.length} stats={stats} />
      <AnswerPanel
        knowPressed={knowPressed} onKnow={handleKnow}
        oxEnabled={oxEnabled && !paused}
        onAnswer={handleAnswer} onDontKnow={handleDontKnow} revealed={revealed}
        chosenAnswer={chosenAnswer} correctAnswer={current ? getAnswer(current) : null}
        onNext={handleNext} onSkip={handleSkip}
      />
      {paused && <PauseOverlay onResume={() => setPaused(false)} />}
    </div>
  )
}
