import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const s = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa' },
  card: { background: '#fff', padding: 36, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', width: '100%', maxWidth: 380 },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 13, color: '#64748b', marginBottom: 24, textAlign: 'center' },
  label: { display: 'block', fontSize: 13, color: '#64748b', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 15, marginBottom: 14 },
  btn: { width: '100%', padding: '11px', background: '#2563eb', color: '#fff', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { color: '#dc2626', fontSize: 13, marginBottom: 10 },
  ok: { color: '#16a34a', fontSize: 13, marginBottom: 10 },
  links: { marginTop: 16, textAlign: 'center', fontSize: 13 },
  a: { color: '#2563eb' },
}

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    const error = await resetPassword(email)
    setLoading(false)
    if (error) setErr(error.message)
    else setOk('비밀번호 재설정 이메일을 발송했습니다.')
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.title}>비밀번호 찾기</div>
        <div style={s.sub}>가입한 이메일을 입력하면 재설정 링크를 보내드립니다.</div>
        <form onSubmit={submit}>
          {err && <div style={s.err}>{err}</div>}
          {ok && <div style={s.ok}>{ok}</div>}
          <label style={s.label}>이메일</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          <button style={s.btn} disabled={loading || !!ok}>{loading ? '발송 중...' : '재설정 링크 보내기'}</button>
        </form>
        <div style={s.links}><Link to="/login" style={s.a}>← 로그인으로 돌아가기</Link></div>
      </div>
    </div>
  )
}
