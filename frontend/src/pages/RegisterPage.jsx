import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const toFakeEmail = (id) => `${id.trim().toLowerCase()}@id.app`

const s = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa' },
  card: { background: '#fff', padding: 36, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', width: '100%', maxWidth: 380 },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: 'center' },
  tabs: { display: 'flex', marginBottom: 20, borderBottom: '2px solid #e2e8f0' },
  tab: (active) => ({ flex: 1, padding: '8px', fontSize: 14, fontWeight: active ? 700 : 400, color: active ? '#2563eb' : '#94a3b8', borderBottom: active ? '2px solid #2563eb' : 'none', marginBottom: -2, cursor: 'pointer', background: 'none' }),
  label: { display: 'block', fontSize: 13, color: '#64748b', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 15, marginBottom: 14 },
  btn: { width: '100%', padding: '11px', background: '#2563eb', color: '#fff', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { color: '#dc2626', fontSize: 13, marginBottom: 10 },
  ok: { color: '#16a34a', fontSize: 13, marginBottom: 10 },
  warn: { background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#92400e', marginBottom: 14, lineHeight: 1.5 },
  links: { marginTop: 16, textAlign: 'center', fontSize: 13, color: '#64748b' },
  a: { color: '#2563eb', marginLeft: 4 },
}

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('email') // 'email' | 'id'
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (pw !== pw2) return setErr('비밀번호가 일치하지 않습니다.')
    if (tab === 'id' && !/^[a-zA-Z0-9_]{3,20}$/.test(userId)) return setErr('아이디는 영문·숫자·_ 3~20자로 입력하세요.')
    setLoading(true)
    const regEmail = tab === 'email' ? email : toFakeEmail(userId)
    const error = await signUp(regEmail, pw)
    setLoading(false)
    if (error) {
      if (error.message.includes('already registered')) setErr('이미 사용 중인 아이디입니다.')
      else setErr(error.message)
    } else {
      if (tab === 'email') setOk('가입 확인 이메일을 발송했습니다. 이메일을 확인해 주세요.')
      else { setOk('가입 완료! 로그인 페이지로 이동합니다.'); setTimeout(() => navigate('/login'), 1500) }
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.title}>회원가입</div>
        <div style={s.tabs}>
          <button style={s.tab(tab === 'email')} onClick={() => { setTab('email'); setErr(''); setOk('') }}>이메일로 가입</button>
          <button style={s.tab(tab === 'id')} onClick={() => { setTab('id'); setErr(''); setOk('') }}>아이디로 가입</button>
        </div>
        {tab === 'id' && (
          <div style={s.warn}>
            ⚠️ 아이디로 가입하면 이메일 없이 사용할 수 있습니다.<br />
            단, <strong>비밀번호를 잊어버리면 계정을 복구할 수 없습니다.</strong><br />
            비밀번호를 반드시 기억하거나 따로 저장해 두세요.
          </div>
        )}
        <form onSubmit={submit}>
          {err && <div style={s.err}>{err}</div>}
          {ok && <div style={s.ok}>{ok}</div>}
          {tab === 'email' ? (
            <>
              <label style={s.label}>이메일</label>
              <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </>
          ) : (
            <>
              <label style={s.label}>아이디 (영문·숫자·_ 3~20자)</label>
              <input style={s.input} type="text" value={userId} onChange={e => setUserId(e.target.value)} required autoFocus placeholder="예: patent_user1" />
            </>
          )}
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
