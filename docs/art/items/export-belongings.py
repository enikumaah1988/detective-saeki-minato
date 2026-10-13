from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json,hashlib
ROOT=Path(__file__).resolve().parents[3]
HERE=Path(__file__).resolve().parent
rows=json.loads((HERE/"belongings-prompts.json").read_text(encoding="utf-8"))
target=ROOT/"src/assets/images/items"
target.mkdir(parents=True,exist_ok=True)
validation=[]
for row in rows:
    raw=Image.open(row["source"]).convert("RGBA")
    box=raw.getchannel("A").point(lambda a:255 if a>8 else 0).getbbox()
    assert box
    sprite=raw.crop(box)
    scale=min(840/sprite.width,840/sprite.height)
    sprite=sprite.resize((round(sprite.width*scale),round(sprite.height*scale)),Image.Resampling.LANCZOS)
    out=Image.new("RGBA",(1024,1024))
    out.alpha_composite(sprite,((1024-sprite.width)//2,(1024-sprite.height)//2))
    path=target/(row["key"]+".png")
    assert not path.exists(),"Do not overwrite an existing asset"
    out.save(path)
    alpha=out.getchannel("A")
    assert all(alpha.getpixel(p)==0 for p in [(0,0),(1023,0),(0,1023),(1023,1023)])
    hist=alpha.histogram()
    validation.append(dict(key=row["key"],file=path.relative_to(ROOT).as_posix(),size=out.size,mode=out.mode,sourceSize=raw.size,boundsAlphaAbove8=alpha.point(lambda a:255 if a>8 else 0).getbbox(),transparentPixels=hist[0],opaquePixels=hist[255],sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
font=ImageFont.truetype("C:/Windows/Fonts/meiryo.ttc",28)
review=Image.new("RGBA",(1920,1080),(239,235,226,255))
review.paste((35,40,48,255),(0,540,1920,1080))
draw=ImageDraw.Draw(review)
for i,row in enumerate(rows):
    im=Image.open(target/(row["key"]+".png")).convert("RGBA")
    for y,size,fg in [(0,440,(40,43,48)),(540,260,(240,240,240))]:
        scaled=im.resize((size,size),Image.Resampling.LANCZOS)
        review.alpha_composite(scaled,(i*640+(640-size)//2,y+(460-size)//2+20))
        draw.text((i*640+80,y+480),row["label"]+" / "+("確認用" if y==0 else "画像高260px"),font=font,fill=fg)
review.convert("RGB").save(HERE/"belongings-review.png")
(HERE/"belongings-validation.json").write_text(json.dumps(validation,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("PASS: 3 transparent RGBA PNGs, 1024x1024, transparent corners; light/dark and260px previews saved.")

