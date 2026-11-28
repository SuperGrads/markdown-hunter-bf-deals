"""Builds a judge-style contact sheet from a folder of screenshots (Pillow), to check what survives the shrink.

The cover (first file by name) is fitted inside 768x480 on top, never enlarged; the other screenshots sit in a
row beneath it, each fitted inside an equal cell of the same total width.

    python3 tools/contact-sheet.py screenshots/ sheet.jpg
"""
import sys
from pathlib import Path

from PIL import Image

COVER = (768, 480)
GAP = 8


def fit(img, box):
    scale = min(box[0] / img.width, box[1] / img.height, 1.0)
    return img.resize((max(1, round(img.width * scale)), max(1, round(img.height * scale))), Image.LANCZOS)


def build(folder, out):
    files = sorted(p for p in Path(folder).iterdir() if p.suffix.lower() in ('.jpg', '.jpeg', '.png') and not p.name.startswith('.'))
    shots = [Image.open(p).convert('RGB') for p in files]
    cover = fit(shots[0], COVER)
    rest = shots[1:]
    cell_w = (COVER[0] - GAP * (len(rest) - 1)) // max(1, len(rest))
    cells = [fit(img, (cell_w, 240)) for img in rest]
    row_h = max((c.height for c in cells), default=0)
    sheet = Image.new('RGB', (COVER[0], cover.height + GAP + row_h), 'white')
    sheet.paste(cover, ((COVER[0] - cover.width) // 2, 0))
    for i, c in enumerate(cells):
        sheet.paste(c, (i * (cell_w + GAP) + (cell_w - c.width) // 2, cover.height + GAP))
    sheet.save(out, quality=90)
    print(f'{out}: {sheet.width}x{sheet.height}, cover {cover.width}x{cover.height}, cells {[c.size for c in cells]}')


if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
