import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const s = {
  divider: { display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0', color: '#94a3b8', fontSize: 12 },
  line: { flex: 1, height: 1, background: '#e2e8f0' },
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa' },
  card: { background: '#fff', padding: 36, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', width: '100%', maxWidth: 380 },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 24, textAlign: 'center', color: '#2563eb' },
  label: { display: 'block', fontSize: 13, color: '#64748b', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 15, marginBottom: 14 },
  btn: { width: '100%', padding: '11px', background: '#2563eb', color: '#fff', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { color: '#dc2626', fontSize: 13, marginBottom: 10 },
  links: { marginTop: 18, textAlign: 'center', fontSize: 13, color: '#64748b' },
  a: { color: '#2563eb', marginLeft: 4 },
}

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    const error = await signIn(email, pw)
    setLoading(false)
    if (error) setErr(error.message)
    else navigate('/')
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.title}>변리사 OX학습</div>
        <form onSubmit={submit}>
          {err && <div style={s.err}>{err}</div>}
          <label style={s.label}>이메일</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          <label style={s.label}>비밀번호</label>
          <input style={s.input} type="password" value={pw} onChange={e => setPw(e.target.value)} required />
          <button style={s.btn} disabled={loading}>{loading ? '로그인 중...' : '로그인'}</button>
        </form>
        <div style={s.divider}><div style={s.line} />또는<div style={s.line} /></div>
        <button onClick={signInWithGoogle} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
          <img src="https://www.google.com/favicon.ico" width={18} height={18} alt="" />
          Google로 로그인
        </button>
        <div style={s.links}>
          <Link to="/forgot-password" style={s.a}>비밀번호 찾기</Link>
          {' · '}
          <Link to="/register" style={s.a}>회원가입</Link>
        </div>
      </div>
    </div>
  )
}
