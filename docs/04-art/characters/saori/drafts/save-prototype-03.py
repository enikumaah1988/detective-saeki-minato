from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys
p=Path(__file__).resolve().parent
src=Path(sys.argv[1])
target=p/"prototype-03.png"
assert not target.exists()
target.write_bytes(src.read_bytes())
im=Image.open(target).convert("RGBA")
assert im.size==(1024,1536)
bg=Image.new("RGBA",im.size,(239,235,226,255))
bg.alpha_composite(im)
bg.convert("RGB").save(p/"prototype-03-review.png")
out=Image.new("RGBA",(1200,700),(239,235,226,255))
font=ImageFont.truetype("C:/Windows/Fonts/meiryo.ttc",26)
for x,name,label in [(0,"prototype-01.png","修正前"),(600,"prototype-03.png","修正後")]:
    face=Image.open(p/name).convert("RGBA").crop((395,60,610,270))
    face.thumbnail((530,560),Image.Resampling.LANCZOS)
    face=face.resize((530,518),Image.Resampling.LANCZOS)
    out.alpha_composite(face,(x+35,50))
    ImageDraw.Draw(out).text((x+220,610),label,font=font,fill=(45,45,45))
out.convert("RGB").save(p/"face-comparison-03.png")
print("Saved full-body 1024x1536 and face comparison.")

