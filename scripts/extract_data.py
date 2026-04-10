"""
변리사 시험 기출문제 데이터 추출 스크립트
TXT 파일에서 산업재산권법 + 민법개론 문제를 파싱하여 JSON으로 저장
"""
import re, json
from pathlib import Path

TXT_PATH = Path(__file__).parent.parent.parent.parent / "a_1_input/b_1_변시_2025_2018.txt"
OUT_PATH = Path(__file__).parent.parent / "frontend/public/data"

ANSWER_CHARS = {"①": 1, "②": 2, "③": 3, "④": 4, "⑤": 5}
JAMO = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ"]
# 특수 답안 패턴: 0 = 정답없음, 99 = 모두정답
SPECIAL_ANSWER = {"정답없음": 0, "정답 없음": 0, "모두정답": 99, "모두 정답": 99}

def read_lines():
    with open(TXT_PATH, encoding="utf-8-sig", errors="replace") as f:
        return f.readlines()

def extract_answer_from_line(t):
    """텍스트에서 첫 번째 답안 문자(①~⑤) 또는 특수답안 추출. 없으면 None."""
    for special, val in SPECIAL_ANSWER.items():
        if special in t:
            return val
    for ch in t:
        if ch in ANSWER_CHARS:
            return ANSWER_CHARS[ch]
    return None

def parse_answer_block(lines, start):
    """주어진 시작 위치부터 40문제 답안 파싱. {q_num: answer} 반환."""
    answers = {}
    i = start
    limit = min(start + 100, len(lines))

    while i < limit and len(answers) < 40:
        # 문제 번호 배치 수집 (1~40 사이 숫자)
        nums = []
        while i < limit:
            t = lines[i].strip()
            if re.match(r"^\d{1,2}$", t) and 1 <= int(t) <= 40:
                nums.append(int(t))
                i += 1
            elif not t:
                i += 1
            else:
                break

        if not nums:
            t = lines[i].strip() if i < limit else ""
            # 답안 문자도 없고 번호도 없으면 종료
            if not t or extract_answer_from_line(t) is None:
                break
            i += 1
            continue

        # 각 번호에 대한 답안 수집
        ans_idx = 0
        while i < limit and ans_idx < len(nums):
            t = lines[i].strip()
            if not t:
                i += 1
                continue
            ans = extract_answer_from_line(t)
            if ans is not None:
                if ans != 0 and ans != 99:  # 유효한 답안만 저장
                    answers[nums[ans_idx]] = ans
                ans_idx += 1  # 특수답안도 한 문제 슬롯 소비
            elif re.match(r"^\d{1,2}$", t) and 1 <= int(t) <= 40:
                break  # 다음 번호 배치 시작
            i += 1

    return answers

def parse_answer_key(lines):
    """{year: {subject: {q_num: answer_num}}} 추출"""
    result = {}
    current_year = None

    for i, raw in enumerate(lines):
        line = raw.strip()
        m = re.search(r"(\d{4})년도.*변리사.*최종", line)
        if m:
            current_year = int(m.group(1))
            result[current_year] = {}
            continue

        m2 = re.match(r"(\d)교시\s*[lｌ|]\s*(산업재산권법|민법개론)", line)
        if m2 and current_year is not None:
            subject = m2.group(2)
            answers = parse_answer_block(lines, i + 1)
            result[current_year][subject] = answers

    return result

if __name__ == "__main__":
    from extract_questions import extract_and_save
    extract_and_save()
