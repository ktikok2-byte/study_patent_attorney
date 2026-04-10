"""
HTML 파일 파서 - bold(c0) = 문제, normal(c2) = 선택지
Python 내장 html.parser 사용 (외부 라이브러리 불필요)
"""
import re, html
from html.parser import HTMLParser
from pathlib import Path

HTML_PATH = Path(__file__).parent.parent.parent.parent / "a_1_input/a_1_변시_2025_2018/b_1_2025_2018.html"

# CSS 클래스 매핑: c0=굵은체(문제), c2=보통체(선택지)
BOLD_CLASS = "c0"
NORMAL_CLASS = "c2"

class ExamHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []   # [(is_bold, text)]
        self._stack = []     # 현재 활성 span 클래스들
        self._cur_class = None
        self._capture = False
        self._buf = ""

    def handle_starttag(self, tag, attrs):
        if tag == "span":
            attrs_d = dict(attrs)
            cls = attrs_d.get("class", "")
            self._stack.append(cls)
            classes = cls.split()
            if BOLD_CLASS in classes:
                self._cur_class = "bold"
                self._capture = True
                self._buf = ""
            elif NORMAL_CLASS in classes:
                self._cur_class = "normal"
                self._capture = True
                self._buf = ""
        elif tag in ("p", "li", "div") and self._capture:
            self._buf += " "

    def handle_endtag(self, tag):
        if tag == "span":
            if self._stack:
                cls = self._stack.pop()
                classes = cls.split()
                if BOLD_CLASS in classes or NORMAL_CLASS in classes:
                    text = html.unescape(self._buf).strip()
                    if text:
                        is_bold = (self._cur_class == "bold")
                        self.elements.append((is_bold, text))
                    self._capture = False
                    self._cur_class = None
                    self._buf = ""

    def handle_data(self, data):
        if self._capture:
            self._buf += data

    def handle_entityref(self, name):
        if self._capture:
            self._buf += html.unescape(f"&{name};")

    def handle_charref(self, name):
        if self._capture:
            if name.startswith('x'):
                self._buf += chr(int(name[1:], 16))
            else:
                self._buf += chr(int(name))

def parse_html():
    """HTML 파싱 → [(is_bold, text)] 리스트 반환"""
    with open(HTML_PATH, encoding="utf-8", errors="replace") as f:
        content = f.read()
    parser = ExamHTMLParser()
    parser.feed(content)
    return parser.elements

def load_parsed_elements():
    """파싱된 요소 로드 (캐시 파일 사용)"""
    cache_path = HTML_PATH.parent / "parsed_elements.json"
    import json
    if cache_path.exists():
        with open(cache_path, encoding="utf-8") as f:
            return json.load(f)
    print("HTML 파싱 중... (최초 1회, 약 30-60초 소요)")
    elements = parse_html()
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(elements, f, ensure_ascii=False)
    print(f"파싱 완료: {len(elements)}개 요소")
    return elements

if __name__ == "__main__":
    elements = load_parsed_elements()
    bold_count = sum(1 for b, _ in elements if b)
    normal_count = sum(1 for b, _ in elements if not b)
    print(f"Bold(문제): {bold_count}, Normal(선택지): {normal_count}")
    print("\n처음 10개:")
    for is_bold, text in elements[:10]:
        print(f"  {'[굵]' if is_bold else '[일반]'} {text[:80]}")
