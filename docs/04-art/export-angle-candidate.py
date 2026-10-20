"""Whole-canvas dimension normalization only; no mirroring/repainting."""
from pathlib import Path
import json,hashlib,sys
from PIL import Image
root=Path(__file__).resolve().parents[2]
source=Path(sys.argv[1]);target=root/sys.argv[2]
im=Image.open(source).convert('RGBA')
assert im.width==im.height
out=im.resize((1024,1024),Image.Resampling.LANCZOS)
alpha=out.getchannel('A');bounds=alpha.point(lambda a:255 if a>8 else 0).getbbox()
assert bounds and alpha.histogram()[0]>0
assert all(alpha.getpixel(p)==0 for p in [(0,0),(1023,0),(0,1023),(1023,1023)])
if target.exists():assert Image.open(target).convert('RGBA').tobytes()==out.tobytes()
else:target.parent.mkdir(parents=True,exist_ok=True);out.save(target)
record=dict(file=target.relative_to(root).as_posix(),width=1024,height=1024,mode='RGBA',alphaBoundsAbove8=bounds,source=str(source),sourceSize=im.size,sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),sha256=hashlib.sha256(target.read_bytes()).hexdigest(),state='採用確認待ち',operation='whole source canvas resized without bounding-box fit or horizontal flip')
target.with_suffix('.validation.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(record,ensure_ascii=False))
