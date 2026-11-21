"""Tile one edition's graphics (story figures + cover) into a single image for the rights review.

    python3 scripts/contact-sheet.py <YYYY-MM-DD>   ->  .publish/contact-<YYYY-MM-DD>.jpg (about 1600px wide)
"""
import glob
import os
import sys

from PIL import Image

date = sys.argv[1]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
figs = sorted(glob.glob(os.path.join(root, "public/figs", f"{date}-[0-9]*.jpg")),
              key=lambda f: int(os.path.basename(f)[len(date) + 1:].split(".")[0].split("-")[0]))
figs = [f for f in figs if os.path.basename(f).count("-") == 3]  # 2026-11-02-1.jpg, not the -lg/-md variants
cover = os.path.join(root, "public/figs", f"{date}-cover.jpg")
if os.path.exists(cover):
    figs.append(cover)
if not figs:
    print(f"no graphics for {date}")
    sys.exit(0)
W, cols = 530, 3
tiles = [Image.open(f).convert("RGB") for f in figs]
tiles = [t.resize((W, round(t.height * W / t.width))) for t in tiles]
rows = [tiles[i:i + cols] for i in range(0, len(tiles), cols)]
sheet = Image.new("RGB", (W * cols, sum(max(t.height for t in r) for r in rows)), "white")
y = 0
for r in rows:
    for j, t in enumerate(r):
        sheet.paste(t, (j * W, y))
    y += max(t.height for t in r)
out = os.path.join(root, ".publish", f"contact-{date}.jpg")
os.makedirs(os.path.dirname(out), exist_ok=True)
sheet.save(out, quality=80)
print(f"contact sheet: {os.path.relpath(out, root)} ({len(figs)} graphics)")
