# Tile PNG frames into one contact sheet: python3 tools/contact.py out.png cols img1 img2 ...
import sys
from PIL import Image, ImageDraw
out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
ims = [Image.open(f) for f in files]
w, h = ims[0].size
sc = 0.5
tw, th = int(w * sc), int(h * sc)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw + (cols + 1) * 6, rows * (th + 18) + 6), (40, 40, 40))
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = 6 + (i % cols) * (tw + 6), 6 + (i // cols) * (th + 18)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + 12))
    d.text((x, y), f.split('/')[-1], fill=(255, 255, 255))
sheet.save(out)
print('wrote', out)
