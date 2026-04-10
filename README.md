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
4. 데이터 업로드:
   ```bash
   cd scripts
   export SUPABASE_URL=https://xxxx.supabase.co
   export SUPABASE_SERVICE_KEY=eyJ...   # service_role key
   python upload_to_supabase.py
   ```

## 2단계: 프론트엔드 환경변수 설정

`frontend/.env` 파일 생성:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 3단계: Vercel 배포

```bash
cd frontend
npm install
npm run build   # 로컬 빌드 테스트
```

Vercel에 배포:
1. [vercel.com](https://vercel.com) → 로그인 → **Add New Project**
2. GitHub 저장소(`study_patent_attorney`) 연결
3. **Framework Preset**: Vite
4. **Root Directory**: `frontend`
5. **Environment Variables** 추가:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. **Deploy** 클릭

## 로컬 개발

```bash
cd frontend
npm install
cp .env.example .env   # 환경변수 입력 후
npm run dev
```

## 기능

- **회원가입/로그인/비밀번호 재설정** (이메일 기반)
- **문제 목록**: 연도·과목·유형·정답수·오답수·북마크 필터
- **자동학습**: 정답 적은 문제 우선 → 오답 많은 문제 우선 정렬
- **17초 타이머** + 일시정지 / "아는 문제" 버튼 → O/X 버튼 활성화
- **북마크**: 여러 목록 생성·관리
- **설정**: 통계 초기화, 북마크 목록 관리

## 데이터 추출 (참고)

원본 데이터 재추출이 필요한 경우:
```bash
cd scripts
python extract_questions.py   # frontend/public/data/ox_items.json 생성
```
