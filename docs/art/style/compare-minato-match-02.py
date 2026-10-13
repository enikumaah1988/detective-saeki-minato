from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import json, hashlib
root=Path.cwd(); font=lambda s:ImageFont.truetype('C:/Windows/Fonts/BIZ-UDGothicR.ttc',s)
paths=[('湊：眼鏡あり','docs/art/characters/minato/drafts/gekiga-neutral-02-glasses.png',(395,58,628,290)),('澪：再試作3','docs/art/characters/mio/drafts/gekiga-neutral-03-minato-match.png',(365,65,590,290)),('あかり：試作2','docs/art/characters/akari/drafts/gekiga-neutral-02-minato-match.png',(375,80,595,300))]
board=Image.new('RGBA',(1800,1440),(212,206,193,255));d=ImageDraw.Draw(board)
d.text((28,20),'湊のタッチに合わせる：全身・顔の比較',font=font(34),fill=(43,40,35))
d.text((28,65),'試作 / 2026-10-13　顔・肌・線・陰影の比較。表示倍率は実身長を表さない。',font=font(21),fill=(83,77,66))
for n,(label,path,box) in enumerate(paths):
 x=20+n*600;im=Image.open(root/path).convert('RGBA')
 d.rectangle((x,109,x+558,997),fill=(231,226,215),outline=(145,135,118),width=2)
 d.text((x+15,120),label,font=font(25),fill=(48,42,34))
 b=im.getchannel('A').point(lambda a:255 if a>128 else 0).getbbox();pic=im.crop(b)
 s=min(530/pic.width,805/pic.height);pic=pic.resize((round(pic.width*s),round(pic.height*s)),Image.Resampling.LANCZOS)
 board.alpha_composite(pic,(x+(558-pic.width)//2,175+(805-pic.height)//2))
 d.rectangle((x,1012,x+558,1413),fill=(231,226,215),outline=(145,135,118),width=2)
 face=im.crop(box);s=min(520/face.width,370/face.height);face=face.resize((round(face.width*s),round(face.height*s)),Image.Resampling.LANCZOS)
 board.alpha_composite(face,(x+(558-face.width)//2,1027+(370-face.height)//2))
out=root/'docs/art/style/minato-match-trials-02.png';board.convert('RGB').save(out)
print(json.dumps({'path':str(out),'size':[1800,1440],'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}))
