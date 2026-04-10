import { SUBJECTS, YEARS, Q_TYPE_LABELS } from '../../lib/constants'

const s = {
  panel: { background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: 8 },
  row: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 8 },
  sel: { padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, background: '#f8fafc' },
  num: { padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, width: 60, background: '#f8fafc' },
  label: { fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' },
  reset: { marginLeft: 'auto', fontSize: 12, color: '#2563eb', background: 'none', border: '1px solid #2563eb', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' },
  sep: { fontSize: 12, color: '#94a3b8' },
}

const DEFAULT = { year: '', subject: '', qType: '', onlyBookmarked: false, minCorrect: '', maxCorrect: '', minWrong: '', maxWrong: '', exclCorrect0: false, exclWrong0: false, minError: '', maxError: '', minGood: '', maxGood: '' }

export default function FilterPanel({ filters: f, setFilters }) {
  const set = (k, v) => setFilters({ ...f, [k]: v })
  return (
    <div style={s.panel}>
      <div style={s.row}>
        <select style={s.sel} value={f.year} onChange={e => set('year', e.target.value ? +e.target.value : '')}>
          <option value="">전체 연도</option>
          {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
        </select>
        <select style={s.sel} value={f.subject} onChange={e => set('subject', e.target.value)}>
          <option value="">전체 과목</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select style={s.sel} value={f.qType} onChange={e => set('qType', e.target.value)}>
          <option value="">전체 유형</option>
          {Object.entries(Q_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button style={s.reset} onClick={() => setFilters(DEFAULT)}>초기화</button>
      </div>
      <div style={s.row}>
        <span style={s.label}>정답:</span>
        <input style={s.num} type="number" min={0} placeholder="최소" value={f.minCorrect} onChange={e => set('minCorrect', e.target.value)} />
        <span style={s.sep}>~</span>
        <input style={s.num} type="number" min={0} placeholder="최대" value={f.maxCorrect} onChange={e => set('maxCorrect', e.target.value)} />
        <span style={s.label}>오답:</span>
        <input style={s.num} type="number" min={0} placeholder="최소" value={f.minWrong} onChange={e => set('minWrong', e.target.value)} />
        <span style={s.sep}>~</span>
        <input style={s.num} type="number" min={0} placeholder="최대" value={f.maxWrong} onChange={e => set('maxWrong', e.target.value)} />
      </div>
      <div style={s.row}>
        <span style={s.label}>오류:</span>
        <input style={s.num} type="number" min={0} placeholder="최소" value={f.minError} onChange={e => set('minError', e.target.value)} />
        <span style={s.sep}>~</span>
        <input style={s.num} type="number" min={0} placeholder="최대" value={f.maxError} onChange={e => set('maxError', e.target.value)} />
        <span style={s.label}>좋아요:</span>
        <input style={s.num} type="number" min={0} placeholder="최소" value={f.minGood} onChange={e => set('minGood', e.target.value)} />
        <span style={s.sep}>~</span>
        <input style={s.num} type="number" min={0} placeholder="최대" value={f.maxGood} onChange={e => set('maxGood', e.target.value)} />
      </div>
      <div style={s.row}>
        <label style={s.label}><input type="checkbox" checked={f.exclCorrect0} onChange={e => set('exclCorrect0', e.target.checked)} /> 정답0회 제외</label>
        <label style={s.label}><input type="checkbox" checked={f.exclWrong0} onChange={e => set('exclWrong0', e.target.checked)} /> 오답0회 제외</label>
        <label style={s.label}><input type="checkbox" checked={f.onlyBookmarked} onChange={e => set('onlyBookmarked', e.target.checked)} /> 북마크만</label>
      </div>
    </div>
  )
}
