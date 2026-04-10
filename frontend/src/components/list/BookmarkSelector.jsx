import { useState, useEffect } from 'react'
import { useBookmarks } from '../../hooks/useBookmarks'

const s = {
  box: { position: 'absolute', zIndex: 100, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 10, minWidth: 180 },
  item: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', fontSize: 13, cursor: 'pointer' },
  addRow: { display: 'flex', gap: 4, marginTop: 8 },
  inp: { flex: 1, padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12 },
  addBtn: { padding: '4px 8px', background: '#2563eb', color: '#fff', borderRadius: 6, fontSize: 12 },
}

export default function BookmarkSelector({ itemId, lists, fetchLists, onClose }) {
  const { addBookmark, removeBookmark, getItemBookmarks, addList } = useBookmarks()
  const [checked, setChecked] = useState([])
  const [newName, setNewName] = useState('')

  useEffect(() => {
    getItemBookmarks(itemId).then(setChecked)
    fetchLists()
  }, [itemId])

  const toggle = async (listId) => {
    if (checked.includes(listId)) {
      await removeBookmark(itemId, listId)
      setChecked(c => c.filter(x => x !== listId))
    } else {
      await addBookmark(itemId, listId)
      setChecked(c => [...c, listId])
    }
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    await addList(newName.trim())
    setNewName('')
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={s.box}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
          <span>북마크 목록</span>
          <button onClick={onClose} style={{ color: '#64748b', fontSize: 14 }}>✕</button>
        </div>
        {lists.map(l => (
          <label key={l.id} style={s.item}>
            <input type="checkbox" checked={checked.includes(l.id)} onChange={() => toggle(l.id)} />
            {l.name}
          </label>
        ))}
        {lists.length === 0 && <div style={{ fontSize: 12, color: '#94a3b8' }}>목록이 없습니다</div>}
        <div style={s.addRow}>
          <input style={s.inp} placeholder="새 목록 이름" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          <button style={s.addBtn} onClick={handleAdd}>추가</button>
        </div>
      </div>
    </div>
  )
}
