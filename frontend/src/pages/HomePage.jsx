import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const s = {
  wrap: { textAlign: 'center', paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 700, color: '#2563eb', marginBottom: 8 },
  sub: { fontSize: 15, color: '#64748b', marginBottom: 48 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, maxWidth: 640, margin: '0 auto' },
  card: { background: '#fff', borderRadius: 12, padding: '32px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.15s' },
  icon: { fontSize: 36, marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: 700, marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#64748b' },
}

const MENU = [
  { icon: '📋', title: '문제 목록', desc: '필터로 문제를 선택하고\n학습을 시작하세요', path: '/list' },
  { icon: '⚡', title: '자동학습', desc: '틀린 문제부터 자동으로\n순서를 정해 학습합니다', path: '/study' },
  { icon: '⚙️', title: '설정', desc: '통계 초기화, 북마크\n목록을 관리합니다', path: '/settings' },
]

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={s.wrap}>
      <div style={s.title}>변리사 OX학습</div>
      <div style={s.sub}>{user?.email?.replace(/@id\.app$/, '')} 님, 환영합니다</div>
      <div style={s.grid}>
        {MENU.map(m => (
          <div key={m.path} style={s.card}
            onClick={() => navigate(m.path)}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={s.icon}>{m.icon}</div>
            <div style={s.cardTitle}>{m.title}</div>
            <div style={s.cardDesc}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
