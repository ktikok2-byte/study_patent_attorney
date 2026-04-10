"""
HTML 요소 기반 질문 파싱 (완전 재작성)
- 굵은체(c0) + 물음표 → 질문
- 굵은체(c0) + 물음표 없음 → 서브선택지(ㄱ,ㄴ,ㄷ)
- 보통체(c2) → 일반선택지 또는 다중선택 최종선택지
"""
import re
from extract_data import JAMO, ANSWER_CHARS

JAMO_LABELS = JAMO[:8]  # ㄱ~ㅇ
SUBJ_ORDER = ["산업재산권법", "민법개론", "자연과학개론"]
Q_MARK = re.compile(r"(것|무엇|어느|어떤)\s*(인가|을|은|이)\??|아닌\s*것|않은\s*것|않는\s*것|틀린\s*것")
CIRC_PATTERN = re.compile(r"^([①②③④⑤])\s*(.*)$")
JAMO_CIRC = re.compile(r"[ㄱ-ㅎ]")

def parse_final_choice(text):
    """'① ㄱ ㄴ,' 형식 → (choice_num, [ㄱ,ㄴ]) or None"""
    m = CIRC_PATTERN.match(text.strip())
    if not m:
        return None
    num = ANSWER_CHARS.get(m.group(1))
    rest = m.group(2)
    jamos = [c for c in rest if JAMO_CIRC.match(c)]
    if not jamos:
        # 숫자 방식 ① 1, 2 → ㄱ,ㄴ
        nums = re.findall(r'\d+', rest)
        jamos = [JAMO_LABELS[int(n)-1] for n in nums if 0 < int(n) <= len(JAMO_LABELS)]
    return (num, jamos) if num else None

def find_question_sections(answer_keys):
    """HTML 파싱 기반으로 모든 OX 아이템 생성"""
    from html_parser import load_parsed_elements
    from extract_questions import make_ox_items, detect_q_type
    elements = load_parsed_elements()

    years = sorted(answer_keys.keys(), reverse=True)
    year_idx, subj_idx = 0, 0
    q_counter = 0  # 현재 과목 내 문제 번호 (0~39)
    all_items = []

    q_text, choices, sub_choices, final_map = None, {}, {}, {}
    sub_idx = 0  # 서브선택지 순서 인덱스

    def get_year(): return years[year_idx] if year_idx < len(years) else None
    def get_subj(): return SUBJ_ORDER[subj_idx] if subj_idx < 3 else None

    def flush():
        nonlocal q_text, choices, sub_choices, final_map, sub_idx
        if q_text:
            year = get_year()
            subj = get_subj()
            if year and subj and subj != "자연과학개론":
                q_num = q_counter
                ans_tuple = answer_keys.get(year, {}).get(subj, {}).get(q_num)
                if ans_tuple:
                    # HTML 답안: (primary, raw_list) 튜플
                    ans_num = ans_tuple[0] if isinstance(ans_tuple, tuple) else ans_tuple
                    q_type = detect_q_type(q_text)
                    # 다중선택: choices = final_map (① → [ㄱ,ㄴ] 형식)
                    eff_choices = final_map if sub_choices else choices
                    fc = final_map if sub_choices else {}
                    items = make_ox_items(year, subj, q_num, q_text, q_type,
                                          eff_choices, sub_choices, ans_num, fc)
                    all_items.extend(items)
        q_text, choices, sub_choices, final_map = None, {}, {}, {}
        sub_idx = 0

    def advance():
        nonlocal year_idx, subj_idx, q_counter
        subj_idx += 1
        if subj_idx >= 3:
            subj_idx = 0
            year_idx += 1
        q_counter = 0

    for is_bold, text in elements:
        text = text.strip()
        if not text:
            continue

        if is_bold and Q_MARK.search(text):
            # 새로운 질문 시작
            flush()
            q_counter += 1
            if q_counter > 40:
                advance()
                q_counter = 1
            q_text = text
            sub_idx = 0
        elif is_bold and q_text:
            # 서브선택지 (ㄱ,ㄴ,ㄷ) - 다중선택 질문 이후
            if sub_idx < len(JAMO_LABELS):
                sub_choices[JAMO_LABELS[sub_idx]] = text
                sub_idx += 1
        elif not is_bold and q_text:
            # 한 요소에 ①②③④⑤ 여러 개가 있으면 분리 처리
            circ_count = len(re.findall(r"[①②③④⑤]", text))
            if circ_count > 1:
                # "① ㄱ ㄷ, ② ㄱ ㄹ, ③ ..." 형태 분리
                segments = re.split(r"([①②③④⑤])", text)
                # segments: ['', '①', ' ㄱ ㄷ, ', '②', ' ㄱ ㄹ, ', ...]
                i = 1
                while i + 1 < len(segments):
                    seg_text = segments[i] + segments[i + 1]
                    fc = parse_final_choice(seg_text)
                    if fc:
                        num, jamos = fc
                        final_map[str(num)] = ",".join(jamos) if jamos else segments[i + 1].strip()
                    elif not CIRC_PATTERN.match(seg_text):
                        n = str(len(choices) + 1)
                        if len(choices) < 5:
                            choices[n] = seg_text.strip()
                    i += 2
            else:
                fc = parse_final_choice(text)
                if fc:
                    # 다중선택 최종선택지 ① ㄱ,ㄴ 형식
                    num, jamos = fc
                    final_map[str(num)] = ",".join(jamos) if jamos else text
                elif not CIRC_PATTERN.match(text):
                    # 일반 선택지 (순서대로 1~5)
                    n = str(len(choices) + 1)
                    if len(choices) < 5:
                        choices[n] = text

    flush()
    return all_items
