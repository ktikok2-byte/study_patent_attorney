# 변리사 OX학습 앱

2018~2025년 변리사 시험 문제를 OX 퀴즈 형식으로 학습하는 웹 앱입니다.
- 과목: 산업재산권법, 민법개론
- 2918개 OX 아이템 (각 선택지를 독립 O/X 문항으로 변환)

## 배포 구성

| 구성요소 | 서비스 | 비용 |
|---|---|---|
| 프론트엔드 | Vercel | 무료 |
| 데이터베이스/인증 | Supabase | 무료 |

---

## 1단계: Supabase 설정

1. [supabase.com](https://supabase.com) → 프로젝트 생성
2. **Settings > API** 에서 `Project URL`과 `anon public` 키 복사
3. **SQL Editor** 에서 `supabase/schema.sql` 전체 내용 실행
4. 이미 schema를 실행했다면 `supabase/migration_add_feedback.sql`도 실행
5. **Authentication > Providers > Email** → **Confirm email OFF** (권장)
6. **Authentication > URL Configuration** → Site URL을 Vercel 배포 주소로 설정

### 데이터 업로드 (PowerShell)
```powershell
cd scripts
$env:SUPABASE_URL="https://xxxx.supabase.co"
$env:SUPABASE_SERVICE_KEY="eyJ..."   # service_role key (Settings > API)
python upload_to_supabase.py
```

## 2단계: Vercel 배포

1. [vercel.com](https://vercel.com) → **Add New Project** → GitHub 저장소 연결
2. **Framework Preset**: Vite
3. **Root Directory**: `frontend`
4. **Environment Variables** 추가:
   - `VITE_SUPABASE_URL` = `https://xxxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = anon public 키
5. **Deploy** 클릭

## 3단계: Google 로그인 설정 (선택)

1. [console.cloud.google.com](https://console.cloud.google.com) → OAuth 2.0 Client ID 생성
   - Authorized redirect URIs: `https://xxxx.supabase.co/auth/v1/callback`
2. Supabase → **Authentication > Providers > Google** → Client ID/Secret 입력

## 로컬 개발

```powershell
cd frontend
npm install
# .env 파일 생성:
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
npm run dev
```

---

## 기능

### 인증
- 이메일 회원가입/로그인
- 아이디 전용 가입 (이메일 없이 사용, 단 비밀번호 분실 시 복구 불가)
- Google 소셜 로그인

### 문제 목록
- 연도·과목·유형·정답수·오답수·오류횟수·좋아요 횟수 범위 필터
- 정답(OX) 보이기/가리기 토글 (기본: 가림)
- 컬럼 헤더 클릭으로 오름차순/내림차순 정렬
- 북마크 (여러 목록 생성 가능)
- 문제 오류 신고 / 좋아요 버튼
- 선택 문제만 골라 학습 시작

### 자동학습
- 정답 횟수 적은 문제 우선 → 오답 횟수 많은 문제 우선 자동 정렬
- 17초 타이머 (색상으로 시간 시각화)
- "아는 문제" 버튼 → O/X 버튼 활성화
- 일시정지 기능

### 설정
- 모든 학습 통계 초기화
- 북마크 목록 추가/삭제

## 데이터 재추출 (참고)

```bash
cd scripts
python extract_questions.py   # frontend/public/data/ox_items.json 재생성
```
