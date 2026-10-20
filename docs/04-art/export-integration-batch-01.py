"""Export candidate images and static overlay previews; never repaint."""
from pathlib import Path
import json,hashlib
from PIL import Image,ImageDraw,ImageFont,ImageOps
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
rows=json.loads((HERE/'integration-batch-01-sources.json').read_text(encoding='utf-8'))
font=ImageFont.truetype('C:/Windows/Fonts/meiryo.ttc',28)
records=[]
for row in rows:
 raw=Image.open(row['source']).convert('RGB')
 # Contain, never distort, fill at most 1px edge with dark base.
 result=ImageOps.pad(raw,(1920,1080),method=Image.Resampling.LANCZOS,color=(21,26,32))
 p=HERE/row['kind']/'drafts'/(row['id']+'-01.png')
 p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists():assert Image.open(p).convert('RGB').tobytes()==result.tobytes()
 else:result.save(p)
 records.append(dict(id=row['id'],kind=row['kind'],file=p.relative_to(ROOT).as_posix(),width=1920,height=1080,sourceSize=raw.size,time=row['time'],state='正式素材候補・採用確認待ち',sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
def dialogue(im,text):
 layer=Image.new('RGBA',im.size)
 d=ImageDraw.Draw(layer)
 d.rounded_rectangle((96,736,1824,1056),radius=8,fill=(16,25,34,173))
 d.text((145,785),text,font=font,fill=(235,228,215))
 im.alpha_composite(layer)
 return im
board=Image.new('RGB',(1920,1080),(230,232,235))
for i,key in enumerate(['minato-smoking','minato-non-smoking']):
 p=HERE/'cutins/drafts'/(key+'-01.png')
 a=Image.open(p).convert('RGBA')
 b=dialogue(a.copy(),'思考整理の挿絵：会話欄との重なり確認')
 board.paste(a.convert('RGB').resize((960,540),Image.Resampling.LANCZOS),(i*960,0))
 board.paste(b.convert('RGB').resize((960,540),Image.Resampling.LANCZOS),(i*960,540))
board.save(HERE/'cutins/ui-review-01.png')
bg=Image.open(HERE/'backgrounds/drafts/office-interior-day-01.png').convert('RGBA')
for id,x,top,width in [('minato',.26,.12,.54),('mio',.74,.18,.486)]:
 s=Image.open(ROOT/'src/assets/images/characters'/id/'waist/neutral.png').convert('RGBA')
 w=round(1920*width);s=s.resize((w,w),Image.Resampling.LANCZOS)
 bg.alpha_composite(s,(round(1920*x-w/2),round(1080*top)))
bg=dialogue(bg,'表示位置は未採用案。女性90%のみ合意済みの暫定倍率。')
layer=Image.new('RGBA',bg.size);d=ImageDraw.Draw(layer)
d.rounded_rectangle((1500,340,1850,635),radius=8,fill=(16,25,34,190))
d.text((1540,375),'コマンド表示余地\n\n調べる\n話す',font=font,fill=(235,228,215))
bg.alpha_composite(layer)
bg.convert('RGB').save(HERE/'backgrounds/ui-review-01.png')
(HERE/'integration-batch-01-validation.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PASS: four1920x1080 opaque candidates and two static UI review boards.')
