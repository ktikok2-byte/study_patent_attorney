"""
Supabase에 OX 문제 데이터를 업로드합니다.
실행 전 환경변수 설정:
  SUPABASE_URL=https://xxxx.supabase.co
  SUPABASE_SERVICE_KEY=eyJ...  (service_role key, Settings > API에서 확인)
"""
import json, os, sys, urllib.request, urllib.error

URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

if not URL or not KEY:
    sys.exit("환경변수 SUPABASE_URL, SUPABASE_SERVICE_KEY를 설정하세요.")

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "data", "ox_items.json")

def post(endpoint, batch):
    body = json.dumps(batch).encode()
    req = urllib.request.Request(
        f"{URL}/rest/v1/{endpoint}",
        data=body,
        headers={
            "apikey": KEY,
            "Authorization": f"Bearer {KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status
    except urllib.error.HTTPError as e:
        print(f"  오류 {e.code}: {e.read().decode()[:200]}")
        return e.code

def delete_all():
    """기존 데이터 전체 삭제"""
    req = urllib.request.Request(
        f"{URL}/rest/v1/ox_items?id=neq.00000000-0000-0000-0000-000000000000",
        headers={
            "apikey": KEY,
            "Authorization": f"Bearer {KEY}",
            "Content-Type": "application/json",
        },
        method="DELETE",
    )
    try:
        with urllib.request.urlopen(req) as r:
            print(f"기존 데이터 삭제 완료 (status={r.status})")
    except urllib.error.HTTPError as e:
        print(f"삭제 오류 {e.code}: {e.read().decode()[:200]}")

EXTRA_FIELDS = {"answer_num", "final_choices"}

def strip_extra(items):
    """새 컬럼이 아직 없을 때 업로드용으로 제거"""
    return [{k: v for k, v in item.items() if k not in EXTRA_FIELDS} for item in items]

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--full", action="store_true", help="answer_num, final_choices 포함 업로드")
    args = parser.parse_args()

    with open(DATA_PATH, encoding="utf-8") as f:
        items = json.load(f)
    if not args.full:
        items = strip_extra(items)
        print("※ --full 없이 실행: answer_num/final_choices 제외 업로드 (마이그레이션 전)")

    delete_all()
    print(f"총 {len(items)}개 업로드 시작...")
    BATCH = 200
    success = 0
    for i in range(0, len(items), BATCH):
        batch = items[i:i+BATCH]
        status = post("ox_items", batch)
        if status in (200, 201):
            success += len(batch)
        print(f"  [{i+len(batch)}/{len(items)}] status={status}")
    print(f"완료! (성공: {success}/{len(items)})")

if __name__ == "__main__":
    main()
