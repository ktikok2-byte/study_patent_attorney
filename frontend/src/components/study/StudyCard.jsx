import { Q_TYPE_LABELS } from '../../lib/constants'

const s = {
  card: { background: '#fff', borderRadius: 14, padding: '24px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', minHeight: 220 },
  meta: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  badge: (color) => ({ background: color + '1a', color, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, border: `1px solid ${color}33` }),
  qText: { fontSize: 13, color: '#64748b', marginBottom: 10, fontStyle: 'italic', lineHeight: 1.5 },
  statement: { fontSize: 17, fontWeight: 600, lineHeight: 1.6, color: '#1a1a2e' },
  subLabel: { display: 'inline-block', background: '#f1f5f9', color: '#475569', fontSize: 12, fontWeight: 700, padding: '1px 6px', borderRadius: 4, marginRight: 6 },
  progress: { fontSize: 12, color: '#94a3b8', marginTop: 16, textAlign: 'right' },
}

export default function StudyCard({ item, index, total, stats }) {
  if (!item) return null
  const st = stats[item.id] || {}

  return (
    <div style={s.card}>
      <div style={s.meta}>
        <span style={s.badge('#2563eb')}>{item.year}년</span>
        <span style={s.badge('#7c3aed')}>{item.subject === '산업재산권법' ? '산업재산' : '민법'}</span>
        <span style={s.badge('#ca8a04')}>Q{item.question_number}</span>
        <span style={s.badge('#475569')}>{Q_TYPE_LABELS[item.question_type]}</span>
      </div>
      <div style={s.qText}>{item.question_text}</div>
      {item.choice_label && <span style={s.subLabel}>{item.choice_label}</span>}
      <div style={s.statement}>{item.choice_text}</div>
      <div style={s.progress}>
        {index + 1} / {total} &nbsp;|&nbsp;
        <span style={{ color: '#16a34a' }}>정답 {st.correct_count ?? 0}</span> &nbsp;
        <span style={{ color: '#dc2626' }}>오답 {st.wrong_count ?? 0}</span>
      </div>
    </div>
  )
}
