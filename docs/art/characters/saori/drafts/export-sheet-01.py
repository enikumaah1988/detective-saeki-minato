from pathlib import Path
from PIL import Image
import sys, json, hashlib
p=Path(__file__).resolve().parent
im=Image.open(sys.argv[1]).convert("RGB")
original=im.size
im.thumbnail((1920,1080),Image.Resampling.LANCZOS)
if im.width<1920 and im.height<1080:
    scale=min(1920/im.width,1080/im.height)
    im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS)
out=Image.new("RGB",(1920,1080),(218,218,218))
out.paste(im,((1920-im.width)//2,(1080-im.height)//2))
target=p/"sheet-01.png"
assert not target.exists()
out.save(target)
record=dict(sourceSize=original,outputSize=out.size,contentSize=im.size,sha256=hashlib.sha256(target.read_bytes()).hexdigest())
(p/"sheet-01-validation.json").write_text(json.dumps(record,indent=2)+"\n",encoding="utf-8")
print(record)

