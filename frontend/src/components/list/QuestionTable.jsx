import { useState } from 'react'
import BookmarkSelector from './BookmarkSelector'
import { Q_TYPE_LABELS } from '../../lib/constants'

const s = {
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
  th: { background: '#f8fafc', padding: '10px 8px', fontSize: 12, color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '10px 8px', fontSize: 13, borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' },
  ox: (v) => ({ display: 'inline-block', width: 22, height: 22, lineHeight: '22px', textAlign: 'center', borderRadius: 4, fontSize: 12, fontWeight: 700, background: v === 'O' ? '#dcfce7' : '#fee2e2', color: v === 'O' ? '#16a34a' : '#dc2626' }),
  bkBtn: { fontSize: 11, padding: '2px 7px', borderRadius: 5, border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b' },
}

export default function QuestionTable({ items, stats, selected, setSelected, lists, fetchLists }) {
  const [bkOpen, setBkOpen] = useState(null)

  const toggleSelect = (id) => setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id])

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}></th>
            <th style={s.th}>연도</th>
            <th style={s.th}>과목</th>
            <th style={s.th}>유형</th>
            <th style={s.th}>지문</th>
            <th style={s.th}>OX</th>
            <th style={s.th}>정/오</th>
            <th style={s.th}>북마크</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => {
            const st = stats[it.id] || {}
            return (
              <tr key={it.id} style={{ background: selected.includes(it.id) ? '#eff6ff' : undefined }}>
                <td style={s.td}><input type="checkbox" checked={selected.includes(it.id)} onChange={() => toggleSelect(it.id)} /></td>
                <td style={s.td}>{it.year}</td>
                <td style={{ ...s.td, whiteSpace: 'nowrap' }}>{it.subject.replace('산업재산권법', '산업재산').replace('민법개론', '민법')}</td>
                <td style={{ ...s.td, whiteSpace: 'nowrap', fontSize: 11 }}>{Q_TYPE_LABELS[it.question_type] ?? it.question_type}</td>
                <td style={{ ...s.td, maxWidth: 320 }}>{it.choice_text}</td>
                <td style={s.td}><span style={s.ox(it.is_correct ? 'O' : 'X')}>{it.is_correct ? 'O' : 'X'}</span></td>
                <td style={{ ...s.td, whiteSpace: 'nowrap', fontSize: 12 }}>
                  <span style={{ color: '#16a34a' }}>{st.correct_count ?? 0}정</span>
                  {' / '}
                  <span style={{ color: '#dc2626' }}>{st.wrong_count ?? 0}오</span>
                </td>
                <td style={s.td}>
                  <button style={s.bkBtn} onClick={() => setBkOpen(bkOpen === it.id ? null : it.id)}>★</button>
                  {bkOpen === it.id && <BookmarkSelector itemId={it.id} lists={lists} fetchLists={fetchLists} onClose={() => setBkOpen(null)} />}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
