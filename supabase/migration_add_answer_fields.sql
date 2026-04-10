-- OX 아이템에 정답 번호와 최종선택지 매핑 추가
ALTER TABLE ox_items ADD COLUMN IF NOT EXISTS answer_num INTEGER;
ALTER TABLE ox_items ADD COLUMN IF NOT EXISTS final_choices JSONB DEFAULT '{}';
