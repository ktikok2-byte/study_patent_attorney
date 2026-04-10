import { useState, useEffect, useRef } from 'react'
import { useBookmarks } from '../../hooks/useBookmarks'

const s = {
  box: { position: 'fixed', zIndex: 1000, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: 12, minWidth: 200, maxHeight: 320, overflowY: 'auto' },
  item: { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', fontSize: 13, cursor: 'pointer' },
  addRow: { display: 'flex', gap: 4, marginTop: 8 },
  inp: { flex: 1, padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12 },
  addBtn: { padding: '4px 8px', background: '#2563eb', color: '#fff', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
}

export default function BookmarkSelector({ itemId, lists, fetchLists, onClose }) {
  const { addBookmark, removeBookmark, getItemBookmarks, addList } = useBookmarks()
  const [checked, setChecked] = useState([])
  const [newName, setNewName] = useState('')
  const btnRef = useRef(null)
  const boxRef = useRef(null)

  useEffect(() => {
    getItemBookmarks(itemId).then(setChecked)
    fetchLists()

    // 팝업 위치 조정: 화면 밖으로 나가지 않도록
    const adjust = () => {
      const box = boxRef.current
      if (!box) return
      const rect = box.getBoundingClientRect()
      if (rect.right > window.innerWidth - 8) box.style.left = `${window.innerWidth - rect.width - 8}px`
      if (rect.bottom > window.innerHeight - 8) box.style.top = `${window.innerHeight - rect.height - 8}px`
    }
    setTimeout(adjust, 0)

    const handleClick = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [itemId])

  const toggle = async (listId) => {
    if (checked.includes(listId)) { await removeBookmark(itemId, listId); setChecked(c => c.filter(x => x !== listId)) }
    else { await addBookmark(itemId, listId); setChecked(c => [...c, listId]) }
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    await addList(newName.trim()); setNewName(''); await fetchLists()
  }

  return (
    <div ref={boxRef} style={{ ...s.box, top: 28, left: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 8 }}>
        <span style={{ fontWeight: 600 }}>북마크 목록</span>
        <button onClick={onClose} style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1 }}>✕</button>
      </div>
      {lists.length === 0 && <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>목록이 없습니다</div>}
      {lists.map(l => (
        <label key={l.id} style={s.item}>
          <input type="checkbox" checked={checked.includes(l.id)} onChange={() => toggle(l.id)} />
          {l.name}
        </label>
      ))}
      <div style={s.addRow}>
        <input style={s.inp} placeholder="새 목록 이름" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <button style={s.addBtn} onClick={handleAdd}>추가</button>
      </div>
    </div>
  )
}
