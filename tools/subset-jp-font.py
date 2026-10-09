"""日本語グリフ用のサブセットフォントを作り直す。

    python tools/subset-jp-font.py

docs 内のテキストに出てくる文字 + かな/全角記号だけを Gen-Gothic-L-P.ttf から抜き出して
woff2 にする。新しい日本語をページに追加したら、このスクリプトを実行し直す
(抜き出されなかった文字は OS の日本語フォントで表示される)。
"""
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
SRC = DOCS / "assets" / "fonts" / "Gen-Gothic-L-P.ttf"
OUT = DOCS / "assets" / "fonts" / "Gen-Gothic-L-P.subset.woff2"

chars = set()
for path in sorted(DOCS.glob("*.html")) + sorted(DOCS.glob("*.js")) + sorted(DOCS.glob("*.css")):
    chars |= {c for c in path.read_text(encoding="utf-8") if ord(c) > 0x2000}

# かな・全角記号は文言追加に備えて丸ごと入れておく
for start, end in [(0x3000, 0x303F), (0x3040, 0x309F), (0x30A0, 0x30FF), (0xFF01, 0xFF60), (0xFFE0, 0xFFE6)]:
    chars |= {chr(c) for c in range(start, end + 1)}

with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
    f.write("".join(sorted(chars)))
    text_file = f.name

subprocess.run(
    [
        sys.executable, "-m", "fontTools.subset", str(SRC),
        "--text-file=" + text_file,
        "--flavor=woff2",
        "--layout-features=*",
        "--output-file=" + str(OUT),
    ],
    check=True,
)
print("%d chars -> %s (%.1f KB)" % (len(chars), OUT.name, OUT.stat().st_size / 1024))
