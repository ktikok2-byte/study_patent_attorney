import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const s = {
  nav: { background: '#2563eb', color: '#fff', padding: '0 12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', minHeight: 52, gap: '0 12px' },
  brand: { fontWeight: 700, fontSize: 15, color: '#fff', marginRight: 'auto', padding: '14px 0' },
  link: (active) => ({ color: active ? '#bfdbfe' : '#fff', fontSize: 13, fontWeight: active ? 600 : 400, padding: '14px 4px' }),
  btn: { color: '#fff', fontSize: 12, background: 'rgba(255,255,255,0.15)', padding: '5px 10px', borderRadius: 6, whiteSpace: 'nowrap' },
}

export default function Navbar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleSignOut = async () => { await signOut(); navigate('/login') }

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>변리사 OX</Link>
      <Link to="/list" style={s.link(pathname === '/list')}>문제목록</Link>
      <Link to="/study" style={s.link(pathname === '/study')}>자동학습</Link>
      <Link to="/review" style={s.link(pathname === '/review')}>전체보기</Link>
      <Link to="/settings" style={s.link(pathname === '/settings')}>설정</Link>
      <button style={s.btn} onClick={handleSignOut}>로그아웃</button>
    </nav>
  )
}
