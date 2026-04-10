import { useState } from 'react'
import BookmarkSelector from './BookmarkSelector'
import { Q_TYPE_LABELS } from '../../lib/constants'
import { useStats } from '../../hooks/useStats'

const s = {
  wrap: { overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: 600 },
  th: (sortable) => ({ background: '#f8fafc', padding: '10px 8px', fontSize: 12, color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap', cursor: sortable ? 'pointer' : 'default', userSelect: 'none' }),
  td: { padding: '8px 8px', fontSize: 13, borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' },
  ox: (v) => ({ display: 'inline-block', width: 24, height: 24, lineHeight: '24px', textAlign: 'center', borderRadius: 4, fontSize: 12, fontWeight: 700, background: v === 'O' ? '#dcfce7' : '#fee2e2', color: v === 'O' ? '#16a34a' : '#dc2626' }),
  iconBtn: (color) => ({ fontSize: 11, padding: '2px 6px', borderRadius: 5, border: `1px solid ${color}33`, cursor: 'pointer', color, background: `${color}0d`, whiteSpace: 'nowrap' }),
}

const COLS = [
  { key: 'year', label: '연도' },
  { key: 'subject', label: '과목' },
  { key: 'question_type', label: '유형' },
  { key: 'choice_text', label: '지문' },
  { key: 'is_correct', label: 'OX' },
  { key: 'correct_count', label: '정' },
  { key: 'wrong_count', label: '오' },
  { key: 'error_count', label: '오류' },
  { key: 'good_count', label: '좋아요' },
]

export default function QuestionTable({ items, stats, selected, setSelected, lists, fetchLists, showOX, sortCol, sortDir, onSort }) {
  const [bkOpen, setBkOpen] = useState(null)
  const { recordFeedback } = useStats()

  const handleFeedback = async (itemId, type) => {
    await recordFeedback(itemId, type)
  }

  const sortIcon = (col) => sortCol === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ·'
  const toggleSelect = (id) => setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id])

  return (
    <div style={s.wrap}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th(false)}></th>
            {COLS.map(c => (
              <th key={c.key} style={s.th(true)} onClick={() => onSort(c.key)}>
                {c.label}{sortIcon(c.key)}
              </th>
            ))}
            <th style={s.th(false)}>액션</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => {
            const st = stats[it.id] || {}
            const answer = it.is_correct ? 'O' : 'X'
            return (
              <tr key={it.id} style={{ background: selected.includes(it.id) ? '#eff6ff' : undefined }}>
                <td style={s.td}><input type="checkbox" checked={selected.includes(it.id)} onChange={() => toggleSelect(it.id)} /></td>
                <td style={{ ...s.td, whiteSpace: 'nowrap' }}>{it.year}</td>
                <td style={{ ...s.td, whiteSpace: 'nowrap', fontSize: 11 }}>{it.subject === '산업재산권법' ? '산업재산' : '민법'}</td>
                <td style={{ ...s.td, whiteSpace: 'nowrap', fontSize: 11 }}>{Q_TYPE_LABELS[it.question_type]?.slice(0, 6)}</td>
                <td style={{ ...s.td, maxWidth: 260, fontSize: 12 }}>{it.choice_text}</td>
                <td style={s.td}>
                  {showOX ? <span style={s.ox(answer)}>{answer}</span> : <span style={{ color: '#cbd5e1', fontSize: 12 }}>-</span>}
                </td>
                <td style={{ ...s.td, whiteSpace: 'nowrap', fontSize: 12, color: '#16a34a' }}>{st.correct_count ?? 0}</td>
                <td style={{ ...s.td, whiteSpace: 'nowrap', fontSize: 12, color: '#dc2626' }}>{st.wrong_count ?? 0}</td>
                <td style={{ ...s.td, whiteSpace: 'nowrap', fontSize: 12, color: '#ea580c' }}>{st.error_count ?? 0}</td>
                <td style={{ ...s.td, whiteSpace: 'nowrap', fontSize: 12, color: '#7c3aed' }}>{st.good_count ?? 0}</td>
                <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'nowrap', position: 'relative' }}>
                    <button style={s.iconBtn('#64748b')} onClick={() => setBkOpen(bkOpen === it.id ? null : it.id)}>★</button>
                    <button style={s.iconBtn('#ea580c')} onClick={() => handleFeedback(it.id, 'error')}>오류</button>
                    <button style={s.iconBtn('#7c3aed')} onClick={() => handleFeedback(it.id, 'good')}>좋아요</button>
                    {bkOpen === it.id && <BookmarkSelector itemId={it.id} lists={lists} fetchLists={fetchLists} onClose={() => setBkOpen(null)} />}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
