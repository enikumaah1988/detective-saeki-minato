"""Incrementally export chapter candidate art and dialogue previews; no repainting."""
from pathlib import Path
import json,hashlib
from PIL import Image,ImageDraw,ImageFont,ImageOps
ROOT=Path(__file__).resolve().parents[3];HERE=Path(__file__).resolve().parent
rows=json.loads((HERE/'chapter-sources.json').read_text(encoding='utf-8'));records=[]
board=Image.new('RGB',(1920,1080),(230,232,235));font=ImageFont.truetype('C:/Windows/Fonts/meiryo.ttc',18)
for i,row in enumerate(rows):
 raw=Image.open(row['source']).convert('RGB');out=ImageOps.pad(raw,(1920,1080),method=Image.Resampling.LANCZOS,color=(21,26,32))
 name=row.get('fileKey',row['id'])+'-'+str(row.get('version',1)).zfill(2)+'.png'
 p=HERE/'drafts'/name;p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists():assert Image.open(p).convert('RGB').tobytes()==out.tobytes(),'Version required for changed source'
 else:out.save(p)
 preview=out.convert('RGBA');layer=Image.new('RGBA',preview.size);d=ImageDraw.Draw(layer)
 d.rounded_rectangle((96,736,1824,1056),radius=8,fill=(16,25,34,173))
 d.text((145,785),'会話欄の重なり確認：画像は採用待ち',font=font,fill=(235,228,215));preview.alpha_composite(layer)
 preview.convert('RGB').save(HERE/'drafts'/(name[:-4]+'-ui.png'))
 x,y=(i%4)*480,(i//4)*540;board.paste(out.resize((480,270),Image.Resampling.LANCZOS),(x,y+20));d=ImageDraw.Draw(board)
 d.text((x+12,y+333),' / '.join(row['connections']),font=font,fill=(32,37,44))
 d.text((x+12,y+375),row['time'],font=font,fill=(60,65,75))
 records.append(dict(id=row['id'],connections=row['connections'],file=p.relative_to(ROOT).as_posix(),width=1920,height=1080,time=row['time'],state=row.get('state','採用確認待ち'),sourceSha256=hashlib.sha256(Path(row['source']).read_bytes()).hexdigest(),sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
board.save(HERE/'chapter-review.png')
(HERE/'chapter-validation.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(str(len(rows))+' chapter candidates incrementally exported; source hashes and static UI previews saved.')
