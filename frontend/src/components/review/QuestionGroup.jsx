import { Q_TYPE_LABELS } from '../../lib/constants'

const CIRC = ['', '①', '②', '③', '④', '⑤']

const s = {
  card: { background: '#fff', borderRadius: 10, padding: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: 12 },
  header: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10, alignItems: 'center' },
  badge: (color) => ({ background: color + '1a', color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, border: `1px solid ${color}33`, whiteSpace: 'nowrap' }),
  qText: { fontSize: 14, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.6, marginBottom: 12 },
  choiceRow: (isAns) => ({ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 8px', borderRadius: 6, marginBottom: 4, background: isAns ? '#eff6ff' : '#f8fafc', border: isAns ? '1px solid #93c5fd' : '1px solid transparent' }),
  label: { fontWeight: 700, fontSize: 13, color: '#475569', minWidth: 20 },
  choiceText: { fontSize: 13, color: '#374151', flex: 1, lineHeight: 1.5 },
  ox: (v) => ({ display: 'inline-block', width: 22, height: 22, lineHeight: '22px', textAlign: 'center', borderRadius: 4, fontSize: 11, fontWeight: 700, flexShrink: 0, background: v === 'O' ? '#dcfce7' : '#fee2e2', color: v === 'O' ? '#16a34a' : '#dc2626' }),
  ansLine: { fontSize: 12, color: '#2563eb', fontWeight: 600, marginTop: 8, padding: '4px 8px', background: '#eff6ff', borderRadius: 6, display: 'inline-block' },
  divider: { borderTop: '1px solid #e2e8f0', margin: '10px 0 8px' },
  fcTitle: { fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4 },
  fcRow: (isAns) => ({ display: 'flex', gap: 6, alignItems: 'center', padding: '3px 6px', borderRadius: 4, marginBottom: 2, background: isAns ? '#dbeafe' : 'transparent', fontSize: 12 }),
  fcLabel: { fontWeight: 700, color: '#374151', minWidth: 24 },
  fcText: (isAns) => ({ color: isAns ? '#1d4ed8' : '#64748b', fontWeight: isAns ? 700 : 400 }),
}

function getAnswerLabels(choices, qType) {
  return choices
    .filter(c => (qType === 'correct' || qType === 'multi_correct') ? c.is_correct : !c.is_correct)
    .map(c => c.choice_label)
}

export default function QuestionGroup({ group, keyword }) {
  const { year, subject, question_number, question_text, question_type, choices } = group
  const ansLabels = getAnswerLabels(choices, question_type)
  const kw = keyword?.toLowerCase()

  // final_choices: {str_num → "ㄱ,ㄴ"} for multi-select, {} for single
  const finalChoices = choices[0]?.final_choices || {}
  const answerNum = choices[0]?.answer_num
  const hasFinalChoices = Object.keys(finalChoices).length > 0

  const highlight = (text) => {
    if (!kw || !text?.toLowerCase().includes(kw)) return text
    const idx = text.toLowerCase().indexOf(kw)
    return <>{text.slice(0, idx)}<mark style={{ background: '#fef08a' }}>{text.slice(idx, idx + kw.length)}</mark>{text.slice(idx + kw.length)}</>
  }

  return (
    <div style={s.card}>
      <div style={s.header}>
        <span style={s.badge('#2563eb')}>{year}년</span>
        <span style={s.badge('#7c3aed')}>{subject === '산업재산권법' ? '산업재산' : '민법'}</span>
        <span style={s.badge('#ca8a04')}>Q{question_number}</span>
        <span style={s.badge('#475569')}>{Q_TYPE_LABELS[question_type]}</span>
      </div>
      <div style={s.qText}>{highlight(question_text)}</div>
      {choices.map(c => {
        const isAns = ansLabels.includes(c.choice_label)
        const ox = c.is_correct ? 'O' : 'X'
        return (
          <div key={c.id} style={s.choiceRow(isAns)}>
            <span style={s.label}>{c.choice_label}</span>
            <span style={s.choiceText}>{highlight(c.choice_text)}</span>
            <span style={s.ox(ox)}>{ox}</span>
          </div>
        )
      })}
      {hasFinalChoices && (
        <>
          <div style={s.divider} />
          <div style={s.fcTitle}>번호별 선택지 구성</div>
          {Object.entries(finalChoices).sort((a, b) => Number(a[0]) - Number(b[0])).map(([num, jamos]) => {
            const isAns = String(answerNum) === num
            return (
              <div key={num} style={s.fcRow(isAns)}>
                <span style={s.fcLabel}>{CIRC[Number(num)] || num + '.'}</span>
                <span style={s.fcText(isAns)}>{jamos}{isAns ? ' ← 정답' : ''}</span>
              </div>
            )
          })}
        </>
      )}
      <div style={s.ansLine}>
        {hasFinalChoices
          ? `정답: ${CIRC[answerNum] || answerNum + '번'} (${finalChoices[String(answerNum)] || ''})`
          : `정답: ${ansLabels.join(', ')}`}
      </div>
    </div>
  )
}
