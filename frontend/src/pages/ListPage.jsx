import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOxItems, useUserStats } from '../hooks/useOxItems'
import { useBookmarks } from '../hooks/useBookmarks'
import FilterPanel from '../components/list/FilterPanel'
import QuestionTable from '../components/list/QuestionTable'
import Pagination from '../components/list/Pagination'
import { PAGE_SIZE } from '../lib/constants'
import { supabase } from '../lib/supabase'

const DEFAULT_F = { year: '', subject: '', qType: '', onlyBookmarked: false, minCorrect: '', maxCorrect: '', minWrong: '', maxWrong: '', exclCorrect0: false, exclWrong0: false, minError: '', maxError: '', minGood: '', maxGood: '' }

function applyFilters(items, stats, f, bkIds) {
  return items.filter(it => {
    const st = stats[it.id] || {}
    if (f.year && it.year !== f.year) return false
    if (f.subject && it.subject !== f.subject) return false
    if (f.qType && it.question_type !== f.qType) return false
    if (f.onlyBookmarked && !bkIds.has(it.id)) return false
    if (f.minCorrect !== '' && (st.correct_count ?? 0) < +f.minCorrect) return false
    if (f.maxCorrect !== '' && (st.correct_count ?? 0) > +f.maxCorrect) return false
    if (f.minWrong !== '' && (st.wrong_count ?? 0) < +f.minWrong) return false
    if (f.maxWrong !== '' && (st.wrong_count ?? 0) > +f.maxWrong) return false
    if (f.exclCorrect0 && (st.correct_count ?? 0) === 0) return false
    if (f.exclWrong0 && (st.wrong_count ?? 0) === 0) return false
    if (f.minError !== '' && (st.error_count ?? 0) < +f.minError) return false
    if (f.maxError !== '' && (st.error_count ?? 0) > +f.maxError) return false
    if (f.minGood !== '' && (st.good_count ?? 0) < +f.minGood) return false
    if (f.maxGood !== '' && (st.good_count ?? 0) > +f.maxGood) return false
    return true
  })
}

function applySort(items, stats, col, dir) {
  if (!col) return items
  const mul = dir === 'asc' ? 1 : -1
  return [...items].sort((a, b) => {
    let va, vb
    if (['correct_count','wrong_count','error_count','good_count'].includes(col)) {
      va = stats[a.id]?.[col] ?? 0; vb = stats[b.id]?.[col] ?? 0
    } else if (col === 'is_correct') { va = a.is_correct ? 1 : 0; vb = b.is_correct ? 1 : 0 }
    else { va = a[col] ?? ''; vb = b[col] ?? '' }
    return va < vb ? -mul : va > vb ? mul : 0
  })
}

export default function ListPage() {
  const navigate = useNavigate()
  const { items, loading } = useOxItems()
  const { stats, fetchStats } = useUserStats()
  const { lists, fetchLists } = useBookmarks()
  const [filters, setFilters] = useState(DEFAULT_F)
  const [page, setPage] = useState(1)
  const [bkIds, setBkIds] = useState(new Set())
  const [selected, setSelected] = useState([])
  const [showOX, setShowOX] = useState(false)
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  useEffect(() => { fetchStats(); fetchLists() }, [])
  useEffect(() => {
    supabase.from('bookmarks').select('ox_item_id').then(({ data }) => setBkIds(new Set(data?.map(b => b.ox_item_id) ?? [])))
  }, [lists.length])

  const onSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const filtered = useMemo(() => applyFilters(items, stats, filters, bkIds), [items, stats, filters, bkIds])
  const sorted = useMemo(() => applySort(filtered, stats, sortCol, sortDir), [filtered, stats, sortCol, sortDir])
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  const startStudy = () => {
    const ids = selected.length ? selected : sorted.map(i => i.id)
    navigate('/study', { state: { ids } })
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>

  return (
    <div>
      <FilterPanel filters={filters} setFilters={f => { setFilters(f); setPage(1) }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0 8px', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 14, color: '#64748b' }}>총 {sorted.length}개</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowOX(v => !v)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: showOX ? '#eff6ff' : '#fff', color: showOX ? '#2563eb' : '#64748b', fontWeight: showOX ? 600 : 400 }}>
            {showOX ? '정답 가리기' : '정답 보기'}
          </button>
          <button onClick={startStudy} style={{ background: '#2563eb', color: '#fff', padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            {selected.length ? `선택 ${selected.length}개 학습` : '전체 학습'}
          </button>
        </div>
      </div>
      <QuestionTable items={pageItems} stats={stats} selected={selected} setSelected={setSelected} lists={lists} fetchLists={fetchLists} showOX={showOX} sortCol={sortCol} sortDir={sortDir} onSort={col => { onSort(col); setPage(1) }} />
      <Pagination page={page} total={totalPages} onChange={setPage} />
    </div>
  )
}
