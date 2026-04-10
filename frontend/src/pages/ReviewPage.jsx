import { useState, useMemo } from 'react'
import { useOxItems } from '../hooks/useOxItems'
import FilterPanel from '../components/list/FilterPanel'
import QuestionGroup from '../components/review/QuestionGroup'
import Pagination from '../components/list/Pagination'
import { SUBJECTS, YEARS } from '../lib/constants'

const PAGE_SIZE = 10
const DEFAULT_F = { year: '', subject: '', qType: '', keyword: '' }

function groupItems(items) {
  const map = new Map()
  for (const it of items) {
    const key = `${it.year}|${it.subject}|${it.question_number}`
    if (!map.has(key)) map.set(key, { year: it.year, subject: it.subject, question_number: it.question_number, question_text: it.question_text, question_type: it.question_type, choices: [] })
    map.get(key).choices.push(it)
  }
  return Array.from(map.values()).sort((a, b) => b.year - a.year || SUBJECTS.indexOf(a.subject) - SUBJECTS.indexOf(b.subject) || a.question_number - b.question_number)
}

function filterGroups(groups, f) {
  return groups.filter(g => {
    if (f.year && g.year !== f.year) return false
    if (f.subject && g.subject !== f.subject) return false
    if (f.qType && g.question_type !== f.qType) return false
    if (f.keyword) {
      const kw = f.keyword.toLowerCase()
      const match = g.question_text?.toLowerCase().includes(kw) || g.choices.some(c => c.choice_text?.toLowerCase().includes(kw))
      if (!match) return false
    }
    return true
  })
}

export default function ReviewPage() {
  const { items, loading } = useOxItems()
  const [filters, setFilters] = useState(DEFAULT_F)
  const [page, setPage] = useState(1)

  const groups = useMemo(() => groupItems(items), [items])
  const filtered = useMemo(() => filterGroups(groups, filters), [groups, filters])
  const pageGroups = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>문제 전체 보기</h2>
      <FilterPanel filters={filters} setFilters={f => { setFilters(f); setPage(1) }} simple />
      <div style={{ fontSize: 13, color: '#64748b', margin: '10px 0 12px' }}>
        총 {filtered.length}개 문제 (전체 {groups.length}개)
      </div>
      {pageGroups.map(g => (
        <QuestionGroup key={`${g.year}|${g.subject}|${g.question_number}`} group={g} keyword={filters.keyword} />
      ))}
      <Pagination page={page} total={totalPages} onChange={setPage} />
    </div>
  )
}
