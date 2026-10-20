import argparse, hashlib, json
from pathlib import Path
from PIL import Image

p = argparse.ArgumentParser()
p.add_argument('source')
p.add_argument('destination')
p.add_argument('width', type=int)
p.add_argument('height', type=int)
a = p.parse_args()
source, target = Path(a.source), Path(a.destination)
target.parent.mkdir(parents=True, exist_ok=True)
im = Image.open(source).convert('RGBA')
original = list(im.size)
if im.size == (a.width, a.height):
    target.write_bytes(source.read_bytes())
else:
    scale = min(a.width / im.width, a.height / im.height)
    resized = im.resize((round(im.width * scale), round(im.height * scale)), Image.Resampling.LANCZOS)
    output = Image.new('RGBA', (a.width, a.height), (0, 0, 0, 0))
    output.alpha_composite(resized, ((a.width-resized.width)//2, (a.height-resized.height)//2))
    output.save(target)
im = Image.open(target)
alpha = im.getchannel('A')
print(json.dumps({'source': str(source), 'destination': str(target), 'source_size': original, 'size': list(im.size), 'mode': im.mode, 'alpha_range': list(alpha.getextrema()), 'corner_alpha': [alpha.getpixel(xy) for xy in [(0,0),(im.width-1,0),(0,im.height-1),(im.width-1,im.height-1)]], 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()}, ensure_ascii=False))
