import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const s = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa' },
  card: { background: '#fff', padding: 36, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', width: '100%', maxWidth: 380 },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: 'center' },
  label: { display: 'block', fontSize: 13, color: '#64748b', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 15, marginBottom: 14 },
  btn: { width: '100%', padding: '11px', background: '#2563eb', color: '#fff', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { color: '#dc2626', fontSize: 13, marginBottom: 10 },
  ok: { color: '#16a34a', fontSize: 13, marginBottom: 10 },
  links: { marginTop: 16, textAlign: 'center', fontSize: 13, color: '#64748b' },
  a: { color: '#2563eb', marginLeft: 4 },
}

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (pw !== pw2) return setErr('비밀번호가 일치하지 않습니다.')
    setLoading(true)
    const error = await signUp(email, pw)
    setLoading(false)
    if (error) setErr(error.message)
    else setOk('가입 확인 이메일을 발송했습니다. 이메일을 확인해 주세요.')
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.title}>회원가입</div>
        <form onSubmit={submit}>
          {err && <div style={s.err}>{err}</div>}
          {ok && <div style={s.ok}>{ok}</div>}
          <label style={s.label}>이메일</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          <label style={s.label}>비밀번호 (6자 이상)</label>
          <input style={s.input} type="password" value={pw} onChange={e => setPw(e.target.value)} required minLength={6} />
          <label style={s.label}>비밀번호 확인</label>
          <input style={s.input} type="password" value={pw2} onChange={e => setPw2(e.target.value)} required />
          <button style={s.btn} disabled={loading || !!ok}>{loading ? '처리 중...' : '가입하기'}</button>
        </form>
        <div style={s.links}>
          이미 계정이 있으신가요?<Link to="/login" style={s.a}>로그인</Link>
        </div>
      </div>
    </div>
  )
}
