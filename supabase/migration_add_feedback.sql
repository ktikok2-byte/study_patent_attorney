-- user_stats 테이블에 피드백 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS good_count INTEGER DEFAULT 0;
