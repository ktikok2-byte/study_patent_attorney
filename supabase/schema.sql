-- 변리사 시험 OX 학습 앱 데이터베이스 스키마
-- Supabase (PostgreSQL) 용

-- OX 문제 아이템 (정적 데이터)
CREATE TABLE IF NOT EXISTS ox_items (
  id UUID PRIMARY KEY,
  year INTEGER NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('산업재산권법', '민법개론')),
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('correct','incorrect','multi_correct','multi_incorrect')),
  choice_label TEXT NOT NULL,
  choice_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ox_items_year_subj ON ox_items(year, subject, question_number);

-- 즐겨찾기 목록
CREATE TABLE IF NOT EXISTS bookmark_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 즐겨찾기 항목
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ox_item_id UUID REFERENCES ox_items(id) ON DELETE CASCADE,
  bookmark_list_id UUID REFERENCES bookmark_lists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ox_item_id, bookmark_list_id)
);

-- 사용자별 OX 아이템 통계
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ox_item_id UUID REFERENCES ox_items(id) ON DELETE CASCADE,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  timeout_count INTEGER DEFAULT 0,
  skip_count INTEGER DEFAULT 0,
  total_time_ms BIGINT DEFAULT 0,
  last_answered_at TIMESTAMPTZ,
  last_correct_at TIMESTAMPTZ,
  last_wrong_at TIMESTAMPTZ,
  UNIQUE(user_id, ox_item_id)
);

CREATE INDEX idx_user_stats_user ON user_stats(user_id);
CREATE INDEX idx_user_stats_item ON user_stats(ox_item_id);

-- Row Level Security
ALTER TABLE bookmark_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ox_items ENABLE ROW LEVEL SECURITY;

-- ox_items: 누구나 읽기 가능
CREATE POLICY "ox_items_read" ON ox_items FOR SELECT USING (true);

-- bookmark_lists: 본인만 접근
CREATE POLICY "bl_self" ON bookmark_lists USING (auth.uid() = user_id);
CREATE POLICY "bl_insert" ON bookmark_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bl_delete" ON bookmark_lists FOR DELETE USING (auth.uid() = user_id);

-- bookmarks: 본인만 접근
CREATE POLICY "bm_self" ON bookmarks USING (auth.uid() = user_id);
CREATE POLICY "bm_insert" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bm_delete" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- user_stats: 본인만 접근
CREATE POLICY "us_self" ON user_stats USING (auth.uid() = user_id);
CREATE POLICY "us_insert" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "us_update" ON user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "us_delete" ON user_stats FOR DELETE USING (auth.uid() = user_id);
