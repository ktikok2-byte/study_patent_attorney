const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 },
  knowBtn: (active) => ({
    padding: '12px', borderRadius: 10, fontSize: 15, fontWeight: 700, width: '100%', cursor: 'pointer',
    background: active ? '#7c3aed' : '#f1f5f9', color: active ? '#fff' : '#94a3b8',
    border: '2px solid ' + (active ? '#7c3aed' : '#e2e8f0'), transition: 'all 0.15s',
  }),
  oxRow: { display: 'flex', gap: 10 },
  oxBtn: (type, enabled, revealed, correct) => {
    let bg = '#f8fafc', color = '#94a3b8', border = '#e2e8f0'
    if (!enabled) return { flex: 1, padding: '18px', fontSize: 26, fontWeight: 900, borderRadius: 10, cursor: 'not-allowed', background: bg, color, border: `2px solid ${border}`, opacity: 0.4 }
    if (revealed) {
      if (correct) { bg = '#dcfce7'; color = '#16a34a'; border = '#16a34a' }
      else { bg = '#fee2e2'; color = '#dc2626'; border = '#dc2626' }
    } else {
      bg = type === 'O' ? '#dcfce7' : '#fee2e2'
      color = type === 'O' ? '#16a34a' : '#dc2626'
      border = type === 'O' ? '#16a34a' : '#dc2626'
    }
    return { flex: 1, padding: '18px', fontSize: 26, fontWeight: 900, borderRadius: 10, cursor: enabled ? 'pointer' : 'not-allowed', background: bg, color, border: `2px solid ${border}`, transition: 'all 0.1s' }
  },
  skipBtn: { padding: '8px', borderRadius: 8, fontSize: 13, color: '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff' },
  dontKnowBtn: { padding: '12px', borderRadius: 10, fontSize: 15, fontWeight: 700, width: '100%', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', border: '2px solid #fca5a5', transition: 'all 0.15s' },
}

export default function AnswerPanel({ knowPressed, onKnow, oxEnabled, onAnswer, onDontKnow, revealed, chosenAnswer, correctAnswer, onNext, onSkip }) {
  return (
    <div style={s.wrap}>
      <button style={s.knowBtn(knowPressed)} onClick={onKnow} disabled={knowPressed}>
        {knowPressed ? '✓ 아는 문제 표시됨' : '아는 문제'}
      </button>
      <div style={s.oxRow}>
        {['O', 'X'].map(t => {
          const isChosen = revealed && chosenAnswer === t
          // 모르는 문제(chosenAnswer===null)일 때도 정답 버튼 강조
          const isCorrectHighlight = revealed && t === correctAnswer
          return (
            <button key={t}
              style={s.oxBtn(t, oxEnabled || revealed, isChosen || isCorrectHighlight, isCorrectHighlight)}
              disabled={revealed}
              onClick={() => !revealed && onAnswer(t)}>
              {t}
            </button>
          )
        })}
      </div>
      {revealed && (
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, padding: '10px', borderRadius: 8, textAlign: 'center', background: chosenAnswer === correctAnswer ? '#dcfce7' : '#fee2e2', color: chosenAnswer === correctAnswer ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
            정답: {correctAnswer}&nbsp;
            {chosenAnswer === null ? '✗ 모르는 문제' : chosenAnswer === correctAnswer ? '✓ 맞았습니다!' : `✗ 오답 (내 선택: ${chosenAnswer})`}
          </div>
          <button style={{ ...s.skipBtn, background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', fontWeight: 600 }} onClick={onNext}>다음 →</button>
        </div>
      )}
      {!revealed && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.dontKnowBtn, flex: 1 }} onClick={onDontKnow}>모르는 문제</button>
          <button style={{ ...s.skipBtn, padding: '8px 14px' }} onClick={onSkip}>건너뛰기</button>
        </div>
      )}
    </div>
  )
}
