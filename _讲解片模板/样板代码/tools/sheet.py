import sys, glob
from PIL import Image, ImageDraw
d, cols = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 4
fs = sorted(glob.glob(d + '/t*.jpg'))
im0 = Image.open(fs[0]); w, h = im0.size
rows = -(-len(fs) // cols)
W = Image.new('RGB', (cols * w, rows * (h + 26)), (20, 20, 22))
dr = ImageDraw.Draw(W)
for i, f in enumerate(fs):
    x, y = (i % cols) * w, (i // cols) * (h + 26)
    W.paste(Image.open(f), (x, y + 26)); dr.text((x + 8, y + 6), '%.2f s' % (int(f[-9:-4]) / 100), fill=(230, 230, 230))
W.save(d + '/sheet.jpg', quality=86); print(W.size)
