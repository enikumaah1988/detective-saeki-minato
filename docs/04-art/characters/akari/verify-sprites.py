"""Validate exported assets and composite previews without changing sprites."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
ASSETS = ROOT / "src/assets/images/characters/akari"
KEYS = ["neutral", "smile", "serious", "surprised", "worried", "sad", "relieved", "determined"]
LABELS = ["通常", "微笑み", "真剣", "驚き", "心配", "悲しみ", "安堵", "決意"]
FONT = ImageFont.truetype("C:/Windows/Fonts/meiryo.ttc", 26)

def record(path, size, key):
    im = Image.open(path)
    assert im.mode == "RGBA" and im.size == size
    alpha = im.getchannel("A")
    assert all(alpha.getpixel(p) == 0 for p in [(0,0),(size[0]-1,0),(0,size[1]-1),(size[0]-1,size[1]-1)])
    hist = alpha.histogram()
    bbox = alpha.point(lambda a: 255 if a > 8 else 0).getbbox()
    assert bbox and hist[0] and hist[255]
    return dict(id="akari", key=key, file=path.relative_to(ROOT).as_posix(), width=size[0], height=size[1],
                transparentPixels=hist[0], opaquePixels=hist[255], boundsAlphaAbove8=list(bbox),
                sha256=hashlib.sha256(path.read_bytes()).hexdigest())

rows = [record(ASSETS / "waist" / (key+".png"), (1024,1024), key) for key in KEYS]
full = record(ASSETS / "full/neutral.png", (1024,1536), "neutral")
for dark, name in [(False,"waist-review.png"),(True,"waist-review-dark.png")]:
    bg, fg = ((35,40,48),(240,240,240)) if dark else ((239,235,226),(40,43,48))
    out = Image.new("RGBA",(1920,1080),bg+(255,))
    draw = ImageDraw.Draw(out)
    for i,key in enumerate(KEYS):
        x,y=(i%4)*480,(i//4)*540
        sprite=Image.open(ASSETS/"waist"/(key+".png")).convert("RGBA").resize((480,480),Image.Resampling.LANCZOS)
        out.alpha_composite(sprite,(x,y+5))
        draw.text((x+22,y+490), LABELS[i]+" / "+key, font=FONT, fill=fg)
        draw.rectangle((x,y,x+479,y+539),outline=(100,105,110) if dark else (198,193,184))
    out.convert("RGB").save(HERE/name)

out=Image.new("RGBA",(1920,1080),(239,235,226,255))
out.paste((35,40,48,255),(960,0,1920,1080))
for x in [0,960]:
    sprite=Image.open(ASSETS/"full/neutral.png").convert("RGBA")
    sprite.thumbnail((700,1020),Image.Resampling.LANCZOS)
    out.alpha_composite(sprite,(x+(960-sprite.width)//2,20))
out.convert("RGB").save(HERE/"full-review.png")

(HERE/"sprite-validation.json").write_text(json.dumps([full]+rows,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
p=ROOT/"docs/04-art/waist-validation.json"
old=json.loads(p.read_text(encoding="utf-8-sig"))
p.write_text(json.dumps([v for v in old if v["id"]!="akari"]+rows,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
p=ROOT/"docs/04-art/neutral-validation.json"
old=json.loads(p.read_text(encoding="utf-8-sig"))
l,t,r,b=full["boundsAlphaAbove8"]
entry=dict(id="akari",width=1024,height=1536,alphaBounds=[l,t,r-l,b-t],sha256=full["sha256"].upper(),source="exec-8983c768-1d69-449f-8381-ebf8fbeb87df.png")
p.write_text(json.dumps([v for v in old if v["id"]!="akari"]+[entry],ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("PASS: 9 RGBA sprites, expected dimensions, transparent corners, nonempty silhouettes; generated light/dark previews.")
