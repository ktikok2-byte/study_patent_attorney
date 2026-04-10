import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOxItems, useUserStats } from '../hooks/useOxItems'
import { useBookmarks } from '../hooks/useBookmarks'
import FilterPanel from '../components/list/FilterPanel'
import QuestionTable from '../components/list/QuestionTable'
import Pagination from '../components/list/Pagination'
import { PAGE_SIZE } from '../lib/constants'

function applyFilters(items, stats, f, bookmarkedIds) {
  return items.filter(it => {
    const st = stats[it.id] || {}
    if (f.year && it.year !== f.year) return false
    if (f.subject && it.subject !== f.subject) return false
    if (f.qType && it.q_type !== f.qType) return false
    if (f.onlyBookmarked && !bookmarkedIds.has(it.id)) return false
    if (f.minCorrect !== '' && (st.correct_count ?? 0) < Number(f.minCorrect)) return false
    if (f.maxCorrect !== '' && (st.correct_count ?? 0) > Number(f.maxCorrect)) return false
    if (f.minWrong !== '' && (st.wrong_count ?? 0) < Number(f.minWrong)) return false
    if (f.maxWrong !== '' && (st.wrong_count ?? 0) > Number(f.maxWrong)) return false
    if (f.exclCorrect0 && (st.correct_count ?? 0) === 0) return false
    if (f.exclWrong0 && (st.wrong_count ?? 0) === 0) return false
    return true
  })
}

const DEFAULT_F = { year: '', subject: '', qType: '', onlyBookmarked: false, minCorrect: '', maxCorrect: '', minWrong: '', maxWrong: '', exclCorrect0: false, exclWrong0: false }

export default function ListPage() {
  const navigate = useNavigate()
  const { items, loading } = useOxItems()
  const { stats, fetchStats } = useUserStats()
  const { lists, fetchLists } = useBookmarks()
  const [filters, setFilters] = useState(DEFAULT_F)
  const [page, setPage] = useState(1)
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [selected, setSelected] = useState([])

  useEffect(() => { fetchStats(); fetchLists() }, [])

  useEffect(() => {
    if (!lists.length) { setBookmarkedIds(new Set()); return }
    import('../lib/supabase').then(({ supabase }) => {
      import('../hooks/useAuth').then(({ useAuth: _ }) => {})
      supabase.from('bookmarks').select('ox_item_id').then(({ data }) => {
        setBookmarkedIds(new Set(data?.map(b => b.ox_item_id) ?? []))
      })
    })
  }, [lists])

  const filtered = useMemo(() => applyFilters(items, stats, filters, bookmarkedIds), [items, stats, filters, bookmarkedIds])
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const startStudy = () => {
    const ids = selected.length ? selected : filtered.map(i => i.id)
    navigate('/study', { state: { ids } })
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>

  return (
    <div>
      <FilterPanel filters={filters} setFilters={f => { setFilters(f); setPage(1) }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 8px' }}>
        <span style={{ fontSize: 14, color: '#64748b' }}>총 {filtered.length}개</span>
        <button onClick={startStudy} style={{ background: '#2563eb', color: '#fff', padding: '7px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
          {selected.length ? `선택 ${selected.length}개 학습` : '전체 학습'}
        </button>
      </div>
      <QuestionTable items={pageItems} stats={stats} selected={selected} setSelected={setSelected} lists={lists} fetchLists={fetchLists} />
      <Pagination page={page} total={totalPages} onChange={setPage} />
    </div>
  )
}
