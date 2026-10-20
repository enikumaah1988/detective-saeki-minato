"""Normalize concept dimensions and compose review boards; no image repainting."""
from pathlib import Path
import json,hashlib
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
rows=json.loads((HERE/'episode-design-sources.json').read_text(encoding='utf-8'))
names={'kuroda':'黒田 征司 / 48歳','miyahara':'宮原 文雄 / 64歳','misaki':'三崎 健 / 死亡時35歳'}
records=[]
for row in rows:
 image=Image.open(row['path']).convert('RGB')
 source_size=image.size
 expected=(1024,1024) if row['id']=='misaki' else (1024,1536)
 assert image.width*expected[1]==image.height*expected[0], 'Aspect mismatch; do not distort'
 image=image.resize(expected,Image.Resampling.LANCZOS)
 p=HERE/'characters'/row['id']/'drafts/prototype-01.png'
 if p.exists():
  assert Image.open(p).convert('RGB').tobytes()==image.tobytes(), 'Existing draft differs; do not overwrite'
 else:
  image.save(p)
 records.append(dict(id=row['id'],file=p.relative_to(ROOT).as_posix(),source=row['path'],sourceSize=source_size,size=expected,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),state='未採用の試作'))
out=Image.new('RGB',(1920,1080),(236,237,240))
d=ImageDraw.Draw(out)
font=ImageFont.truetype('C:/Windows/Fonts/meiryo.ttc',26)
small=ImageFont.truetype('C:/Windows/Fonts/meiryo.ttc',21)
for i,row in enumerate(rows):
 x=i*640
 im=Image.open(HERE/'characters'/row['id']/'drafts/prototype-01.png')
 im.thumbnail((610,900),Image.Resampling.LANCZOS)
 out.paste(im,(x+(640-im.width)//2,20))
 d.text((x+24,944),names[row['id']],font=font,fill=(35,39,47))
 d.text((x+24,989),'肖像の仮案' if row['id']=='misaki' else '全身デザインの仮案',font=small,fill=(65,70,80))
 d.line((x,0,x,1080),fill=(195,197,202),width=1)
out.save(HERE/'episode-design-review.png')
# Face comparison uses clearly documented crops only, never game assets.
out=Image.new('RGB',(1920,800),(236,237,240))
d=ImageDraw.Draw(out)
crops={'kuroda':(370,15,610,255),'miyahara':(355,10,605,260),'misaki':(260,25,760,575)}
for i,row in enumerate(rows):
 im=Image.open(HERE/'characters'/row['id']/'drafts/prototype-01.png').crop(crops[row['id']])
 scale=min(580/im.width,660/im.height)
 im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS)
 out.paste(im,(i*640+(640-im.width)//2,30))
 d.text((i*640+24,726),names[row['id']],font=font,fill=(35,39,47))
out.save(HERE/'episode-design-faces.png')
(HERE/'episode-design-validation.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PASS: 3 background concept images, common full-body sizes and square portrait; two review boards.')
