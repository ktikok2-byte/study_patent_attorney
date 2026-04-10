const s = {
  wrap: { display: 'flex', justifyContent: 'center', gap: 4, marginTop: 16, flexWrap: 'wrap' },
  btn: (active) => ({
    padding: '6px 12px', borderRadius: 7, fontSize: 13, cursor: 'pointer',
    background: active ? '#2563eb' : '#fff', color: active ? '#fff' : '#374151',
    border: '1px solid ' + (active ? '#2563eb' : '#e2e8f0'),
  }),
}

export default function Pagination({ page, total, onChange }) {
  if (total <= 1) return null
  const pages = []
  const start = Math.max(1, page - 3)
  const end = Math.min(total, page + 3)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div style={s.wrap}>
      {page > 1 && <button style={s.btn(false)} onClick={() => onChange(1)}>«</button>}
      {page > 1 && <button style={s.btn(false)} onClick={() => onChange(page - 1)}>‹</button>}
      {pages.map(p => <button key={p} style={s.btn(p === page)} onClick={() => onChange(p)}>{p}</button>)}
      {page < total && <button style={s.btn(false)} onClick={() => onChange(page + 1)}>›</button>}
      {page < total && <button style={s.btn(false)} onClick={() => onChange(total)}>»</button>}
    </div>
  )
}
