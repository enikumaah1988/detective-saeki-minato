"""Export old-building base scenes and four light variants, no repainting."""
from pathlib import Path
import json,hashlib
from PIL import Image,ImageDraw,ImageFont,ImageOps
ROOT=Path(__file__).resolve().parents[3];HERE=Path(__file__).resolve().parent
rows=json.loads((HERE/'batch-03-sources.json').read_text(encoding='utf-8'));records=[]
overview=Image.new('RGB',(1920,1080),(230,232,235))
font=ImageFont.truetype('C:/Windows/Fonts/meiryo.ttc',18)
for i,row in enumerate(rows):
 raw=Image.open(row['source']).convert('RGB')
 out=ImageOps.pad(raw,(1920,1080),method=Image.Resampling.LANCZOS,color=(21,26,32))
 p=HERE/'drafts'/(row['id']+'-01.png')
 if p.exists():assert Image.open(p).convert('RGB').tobytes()==out.tobytes()
 else:out.save(p)
 records.append(dict(id=row['id'],bgId=row['bgId'],file=p.relative_to(ROOT).as_posix(),width=1920,height=1080,sourceSize=raw.size,time=row['time'],state=row['state'],sourceSha256=hashlib.sha256(Path(row['source']).read_bytes()).hexdigest(),sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
 x,y=(i%4)*480,(i//4)*540
 overview.paste(out.resize((480,270),Image.Resampling.LANCZOS),(x,y+20))
 d=ImageDraw.Draw(overview)
 d.text((x+12,y+335),row['bgId']+' / '+row['id'],font=font,fill=(32,37,44))
 d.text((x+12,y+378),row['time']+'・採用確認待ち',font=font,fill=(60,65,75))
overview.save(HERE/'batch-03-review.png')
(HERE/'batch-03-validation.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PASS: eight1920x1080 background candidates and source/export SHA-256.')
