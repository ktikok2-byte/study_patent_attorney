"""
HTML 답안표에서 정답 추출
- 과목 레이블(산업재산권법/민법개론)이 앞 맥락에 있는 표 = 해당 과목 답안표
- 연도는 각 표 위치 기준으로 앞에서 가장 가까운 "YYYY년도" 텍스트 사용
- "②,④" 복수정답: primary=첫번째, raw=전체 리스트
"""
import re, html
from pathlib import Path

HTML_PATH = Path(__file__).resolve().parent.parent.parent.parent / "a_1_input/a_1_변시_2025_2018/b_1_2025_2018.html"

CIRC_MAP = {"①": 1, "②": 2, "③": 3, "④": 4, "⑤": 5}
SPECIAL_TEXTS = ["정답없음", "정답 없음", "모두정답", "모두 정답"]
SPECIAL_VALS = [0, 0, 99, 99]

def _decode_ctx(raw_bytes):
    """html.unescape + 태그 제거 + 공백 정리"""
    t = html.unescape(raw_bytes)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", t).strip()

def _parse_one_answer(cell):
    for sp, v in zip(SPECIAL_TEXTS, SPECIAL_VALS):
        if sp in cell:
            return v, [v]
    circs = re.findall(r"[①②③④⑤]", cell)
    if not circs:
        return None, []
    nums = [CIRC_MAP[c] for c in circs]
    return nums[0], nums

def _parse_table_answers(table_raw):
    """Raw HTML 표 → {q_num: (primary, raw_list)}
    표 구조: 번호배치(1~10) 다음에 답배치(①~⑤×10) 반복
    """
    text = _decode_ctx(table_raw)
    # 각 셀을 공백 구분으로 분리 (쉼표는 복수정답 "②,④"이므로 보존)
    cells = re.split(r"\s+", text.strip())

    answers = {}
    num_batch = []
    i = 0
    while i < len(cells):
        c = cells[i]
        is_qnum = bool(re.match(r"^(\d{1,2})$", c)) and 1 <= int(c) <= 40
        has_circ = bool(re.search(r"[①②③④⑤]", c))
        is_special = any(sp in c for sp in SPECIAL_TEXTS)

        if is_qnum and not has_circ:
            num_batch.append(int(c))
            i += 1
        elif (has_circ or is_special) and num_batch:
            # 답 배치 수집: num_batch 개수만큼
            ans_batch = []
            while i < len(cells) and len(ans_batch) < len(num_batch):
                ac = cells[i]
                if bool(re.match(r"^(\d{1,2})$", ac)) and 1 <= int(ac) <= 40 and not re.search(r"[①②③④⑤]", ac):
                    break  # 다음 번호 배치 시작
                primary, raw = _parse_one_answer(ac)
                if primary is not None:
                    ans_batch.append((primary, raw))
                i += 1
            # 짝짓기
            for q, (p, r) in zip(num_batch, ans_batch):
                answers[q] = (p, r)
            num_batch = []
        else:
            i += 1

    return answers

def load_html_answers():
    """Returns: {year: {subject: {q_num: (primary, raw_list)}}}"""
    with open(HTML_PATH, encoding="utf-8", errors="replace") as f:
        content = f.read()

    # HTML 전체 디코딩 (연도/과목 텍스트 검색용)
    decoded = html.unescape(content)

    # 연도 위치를 디코딩된 텍스트에서 수집
    # decoded와 content는 길이가 다를 수 있으므로 raw에서도 검색
    year_positions_raw = []
    for m in re.finditer(r"(20\d\d)", content):
        year = int(m.group(1))
        if 2018 <= year <= 2025:
            year_positions_raw.append((year, m.start()))

    tables = list(re.finditer(r"<table[^>]*>.*?</table>", content, re.DOTALL))
    result = {}

    for m in tables:
        traw = m.group()
        ttext = _decode_ctx(traw)
        pos = m.start()

        # 답안표 여부 확인
        nums = re.findall(r"\b([1-9]|[1-3][0-9]|40)\b", ttext)
        circs = re.findall(r"[①②③④⑤]", ttext)
        if len(nums) < 10 or len(circs) < 10:
            continue

        # 가장 가까운 이전 연도 (raw 위치 기준)
        prev_years = [(y, p) for y, p in year_positions_raw if p < pos]
        if not prev_years:
            continue
        current_year = max(prev_years, key=lambda x: x[1])[0]

        # 과목 감지: 표 앞 1000자 디코딩 텍스트
        ctx_raw = content[max(0, pos - 1000) : pos]
        ctx = _decode_ctx(ctx_raw)
        if "산업재산권법" in ctx[-500:]:
            subj = "산업재산권법"
        elif "민법개론" in ctx[-500:]:
            subj = "민법개론"
        else:
            continue

        answers = _parse_table_answers(traw)
        if len(answers) < 5:
            continue

        result.setdefault(current_year, {})
        if subj not in result[current_year]:
            result[current_year][subj] = answers

    return result

if __name__ == "__main__":
    import sys; sys.stdout.reconfigure(encoding="utf-8")
    data = load_html_answers()
    print(f"추출된 연도: {sorted(data.keys(), reverse=True)}")
    for year in sorted(data.keys(), reverse=True):
        for subj, ans in data[year].items():
            multi = {q: r for q, (p, r) in ans.items() if len(r) > 1}
            sp = {q: p for q, (p, r) in ans.items() if p in (0, 99)}
            print(f"  {year} {subj}: {len(ans)}문제  복수={multi}  특수={sp}")
