"""Generates the placeholder app icons (a round lavender cat face).
Run:  python3 scripts/make_icons.py     (needs Pillow)
Replace src-tauri/icons/* with final artwork any time - or run `npx tauri icon your.png`.
"""
from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "src-tauri", "icons")
os.makedirs(OUT, exist_ok=True)


def draw(size):
    s = size * 4
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    u = s / 200
    d.rounded_rectangle([8 * u, 8 * u, 192 * u, 192 * u], radius=44 * u, fill=(157, 139, 224, 255))
    base, patch, ink, pink = (255, 250, 255), (190, 170, 235), (59, 42, 92), (255, 150, 180)
    d.polygon([(48 * u, 88 * u), (52 * u, 40 * u), (88 * u, 66 * u)], fill=base)
    d.polygon([(152 * u, 88 * u), (148 * u, 40 * u), (112 * u, 66 * u)], fill=base)
    d.polygon([(58 * u, 80 * u), (60 * u, 52 * u), (78 * u, 68 * u)], fill=pink)
    d.polygon([(142 * u, 80 * u), (140 * u, 52 * u), (122 * u, 68 * u)], fill=pink)
    d.ellipse([34 * u, 58 * u, 166 * u, 168 * u], fill=base)
    d.pieslice([34 * u, 58 * u, 120 * u, 140 * u], 180, 270, fill=patch)
    for cx in (74, 126):
        d.ellipse([(cx - 8) * u, 98 * u, (cx + 8) * u, 120 * u], fill=ink)
        d.ellipse([(cx - 1) * u, 100 * u, (cx + 5) * u, 106 * u], fill=(255, 255, 255))
    for cx in (58, 142):
        d.ellipse([(cx - 11) * u, 118 * u, (cx + 11) * u, 132 * u], fill=(255, 170, 195, 200))
    d.polygon([(94 * u, 122 * u), (106 * u, 122 * u), (100 * u, 130 * u)], fill=pink)
    d.arc([88 * u, 124 * u, 100 * u, 138 * u], 0, 180, fill=ink, width=int(3 * u))
    d.arc([100 * u, 124 * u, 112 * u, 138 * u], 0, 180, fill=ink, width=int(3 * u))
    return im.resize((size, size), Image.LANCZOS)


for name, sz in (("32x32.png", 32), ("128x128.png", 128), ("128x128@2x.png", 256), ("icon.png", 512)):
    draw(sz).save(os.path.join(OUT, name))
draw(256).save(os.path.join(OUT, "icon.ico"), sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print("icons written to", os.path.abspath(OUT))
