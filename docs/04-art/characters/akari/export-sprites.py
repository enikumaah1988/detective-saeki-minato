"""Only dimension/position normalization and review layout; no repainting."""
from pathlib import Path
import sys
from PIL import Image

root = Path(__file__).resolve().parents[4]
mode, source, key = sys.argv[1:4]
raw = Image.open(source).convert('RGBA')
alpha = raw.getchannel('A')
box = alpha.point(lambda a: 255 if a > 8 else 0).getbbox()
if not box:
    raise ValueError('Empty alpha silhouette')
if mode == 'full':
    x0, y0, x1, y1 = box
    figure = raw.crop(box)
    target_h = 1380
    target_w = round(figure.width * target_h / figure.height)
    if target_w > 960:
        raise ValueError('Full silhouette exceeds width budget')
    figure = figure.resize((target_w, target_h), Image.Resampling.LANCZOS)
    result = Image.new('RGBA', (1024,1536))
    result.alpha_composite(figure, ((1024-target_w)//2,81))
elif mode == 'waist':
    if raw.width != raw.height:
        raise ValueError('Expected square source for common waist anchors')
    result = Image.new('RGBA',(1024,1024))
    # Entire source canvas, not an independently fitted alpha bounding box.
    result.alpha_composite(raw.resize((960,960),Image.Resampling.LANCZOS),(32,32))
else:
    raise ValueError(mode)
target = root / 'src/assets/images/characters/akari' / mode / (key+'.png')
target.parent.mkdir(parents=True,exist_ok=True)
result.save(target)
print({'sourceSize':raw.size, 'sourceBoundsAlphaAbove8':box, 'file':str(target), 'size':result.size})
