const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  box: { background: '#fff', borderRadius: 16, padding: '40px 48px', textAlign: 'center' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  sub: { color: '#64748b', marginBottom: 24 },
  btn: { padding: '12px 36px', background: '#2563eb', color: '#fff', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer' },
}

export default function PauseOverlay({ onResume }) {
  return (
    <div style={s.overlay} onClick={onResume}>
      <div style={s.box} onClick={e => e.stopPropagation()}>
        <div style={s.title}>⏸ 일시정지</div>
        <div style={s.sub}>화면을 클릭하거나 버튼을 눌러 재개하세요</div>
        <button style={s.btn} onClick={onResume}>계속하기</button>
      </div>
    </div>
  )
}
