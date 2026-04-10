import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useStats } from '../hooks/useStats'
import { useBookmarks } from '../hooks/useBookmarks'

const s = {
  section: { background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#1a1a2e' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  label: { fontSize: 14, color: '#374151' },
  dangerBtn: { padding: '7px 16px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btn: { padding: '7px 16px', background: '#eff6ff', color: '#2563eb', border: '1px solid #93c5fd', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  inp: { padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, marginRight: 6, width: 140 },
  listItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' },
  delBtn: { fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px' },
  ok: { color: '#16a34a', fontSize: 13, marginTop: 8 },
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { resetStats } = useStats()
  const { lists, fetchLists, addList, deleteList } = useBookmarks()
  const [newList, setNewList] = useState('')
  const [msg, setMsg] = useState('')
  const [resetting, setResetting] = useState(false)

  const handleReset = async () => {
    if (!confirm('모든 학습 통계(정답/오답 횟수)를 초기화하시겠습니까?')) return
    setResetting(true)
    await resetStats()
    setResetting(false)
    setMsg('통계가 초기화되었습니다.')
    setTimeout(() => setMsg(''), 3000)
  }

  const handleAddList = async () => {
    if (!newList.trim()) return
    await addList(newList.trim())
    setNewList('')
    await fetchLists()
  }

  const handleDeleteList = async (id, name) => {
    if (!confirm(`"${name}" 목록을 삭제하시겠습니까? 해당 북마크도 모두 삭제됩니다.`)) return
    await deleteList(id)
    await fetchLists()
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>설정</h1>
      <div style={s.section}>
        <div style={s.title}>계정</div>
        <div style={s.row}><span style={s.label}>이메일</span><span style={{ fontSize: 14, color: '#64748b' }}>{user?.email}</span></div>
      </div>
      <div style={s.section}>
        <div style={s.title}>학습 통계</div>
        <div style={s.row}>
          <span style={s.label}>모든 정답/오답 횟수 초기화</span>
          <button style={s.dangerBtn} onClick={handleReset} disabled={resetting}>{resetting ? '초기화 중...' : '초기화'}</button>
        </div>
        {msg && <div style={s.ok}>{msg}</div>}
      </div>
      <div style={s.section}>
        <div style={s.title}>북마크 목록 관리</div>
        {lists.length === 0 && <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>북마크 목록이 없습니다.</div>}
        {lists.map(l => (
          <div key={l.id} style={s.listItem}>
            <span style={{ fontSize: 14 }}>★ {l.name}</span>
            <button style={s.delBtn} onClick={() => handleDeleteList(l.id, l.name)}>삭제</button>
          </div>
        ))}
        <div style={{ display: 'flex', marginTop: 12 }}>
          <input style={s.inp} placeholder="새 목록 이름" value={newList} onChange={e => setNewList(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddList()} />
          <button style={s.btn} onClick={handleAddList}>추가</button>
        </div>
      </div>
    </div>
  )
}
