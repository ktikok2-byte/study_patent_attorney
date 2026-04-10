"""
OX 아이템 생성 모듈
"""
import re, json, uuid
from pathlib import Path
from extract_data import JAMO, OUT_PATH

JAMO_LABELS = JAMO[:8]

Q_CORRECT = re.compile(r"옳은\s*것|맞는\s*것|올바른\s*것|바른\s*것")
Q_INCORRECT = re.compile(r"옳지\s*않|틀린\s*것|잘못된|맞지\s*않|아닌\s*것|않은\s*것")
Q_ALL = re.compile(r"모두\s*고른|있는\s*대로|모두\s*선택")

def detect_q_type(text):
    is_all = bool(Q_ALL.search(text))
    is_incorrect = bool(Q_INCORRECT.search(text))
    if is_all and is_incorrect:
        return "multi_incorrect"
    if is_all:
        return "multi_correct"
    if is_incorrect:
        return "incorrect"
    return "correct"

def make_ox_items(year, subject, q_num, q_text, q_type, choices, sub_choices, answer_num, final_choices=None):
    """선택지 → OX 아이템 목록 생성"""
    items = []
    fc = final_choices or {}
    if sub_choices:
        # 다중선택: choices = {str(num): "ㄱ,ㄴ"} 형식의 최종선택지
        # answer_num이 가리키는 최종선택지의 ㄱ,ㄴ 조합이 정답 서브선택지
        ans_choice_text = choices.get(str(answer_num), "")
        correct_jamos = [c for c in ans_choice_text.split(",") if c.strip() in JAMO_LABELS]
        if not correct_jamos:
            correct_jamos = [j for j in JAMO_LABELS if j in ans_choice_text]
        for label, text in sub_choices.items():
            if not text.strip():
                continue
            in_correct = label in correct_jamos
            is_correct = in_correct if q_type in ("multi_correct", "correct") else not in_correct
            items.append(build_item(year, subject, q_num, q_text, q_type, label, text, is_correct, answer_num, fc))
    else:
        for label, text in choices.items():
            if not text.strip():
                continue
            is_answer = (label == str(answer_num))
            is_correct = is_answer if q_type in ("correct", "multi_correct") else not is_answer
            items.append(build_item(year, subject, q_num, q_text, q_type, label, text, is_correct, answer_num, fc))
    return items

def build_item(year, subject, q_num, q_text, q_type, label, text, is_correct, answer_num=None, final_choices=None):
    return {
        "id": str(uuid.uuid4()),
        "year": year, "subject": subject,
        "question_number": q_num, "question_text": q_text.strip(),
        "question_type": q_type, "choice_label": label,
        "choice_text": text.strip(), "is_correct": is_correct,
        "answer_num": answer_num,
        "final_choices": final_choices or {},
    }

def extract_and_save():
    from parse_html_answers import load_html_answers
    from section_parser import find_question_sections
    answer_keys = load_html_answers()
    all_items = find_question_sections(answer_keys)

    OUT_PATH.mkdir(parents=True, exist_ok=True)
    out_file = OUT_PATH / "ox_items.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_items, f, ensure_ascii=False, indent=2)

    from collections import defaultdict
    stats = defaultdict(lambda: defaultdict(int))
    for item in all_items:
        stats[item["year"]][item["subject"]] += 1
    print(f"\n총 {len(all_items)}개 OX 아이템 추출 → {out_file}\n")
    for year in sorted(stats.keys(), reverse=True):
        for subj, cnt in stats[year].items():
            print(f"  {year} {subj}: {cnt}개")

if __name__ == "__main__":
    extract_and_save()
