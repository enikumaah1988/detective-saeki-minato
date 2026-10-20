from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib,re,os
root=Path.cwd()
path=root/'docs/04-art/style/three-character-rebuild-02.json'
data=json.loads(path.read_text(encoding='utf-8-sig'))
data['records']=[r for r in data['records'] if r['kind']!='full']
def validate(p):
 im=Image.open(p); a=im.getchannel('A') if im.mode=='RGBA' else None
 return dict(size=list(im.size),mode=im.mode,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),alpha_range=list(a.getextrema()) if a else None,corner_alpha=[a.getpixel(x) for x in [(0,0),(im.width-1,0),(0,im.height-1),(im.width-1,im.height-1)]] if a else None)
for r in data['cutins']:
 src=Path(r['source']); im=Image.open(src).convert('RGB')
 assert abs(im.width/im.height-16/9)<0.002
 r['source_size']=list(im.size)
 im.resize((1920,1080),Image.Resampling.LANCZOS).save(root/r['dest'])
 r['validation']=validate(root/r['dest'])
full_sources={'minato':'exec-41eee6d9-75a3-48e2-9ced-fbf22c43b999.png','mio':'exec-6604a21a-20f9-4377-9120-92769cf8da01.png','akari':'exec-18ed7c91-dfff-4623-b100-1e030560a4a1.png'}
for c in data['characters']:
 dest='src/assets/images/characters/'+c['id']+'/full/neutral.png'
 source='C:/Users/lemon/.codex/generated_images/01a123a2-b46f-77d3-b27e-a7f8a37b3920/'+full_sources[c['id']]
 assert (root/dest).read_bytes()==Path(source).read_bytes()
 data['records'].append(dict(id=c['id'],kind='full',key='neutral',dest=dest,source=source,operation='最新全身の生成原本を正本へ移動。画像加工なし。',validation=validate(root/dest)))
for r in data['records']:
 im=Image.open(root/r['dest'])
 assert im.size==((1024,1536) if r['kind']=='full' else (1024,1024))
 assert im.mode=='RGBA' and all(v==0 for v in validate(root/r['dest'])['corner_alpha'])
 assert hashlib.sha256((root/r['dest']).read_bytes()).hexdigest()==r['validation']['sha256']
assert len(data['records'])==26
assert len({r['validation']['sha256'] for r in data['records']})==26
# Fix live Markdown links after adopting and moving full-body prototypes. JSON prompts remain historical records.
mapping={str((root/r['from']).resolve()):root/r['to'] for r in data['relocations']}
for md in (root/'docs/04-art').rglob('*.md'):
 if 'history' in md.parts: continue
 s=md.read_text(encoding='utf-8-sig')
 def fix(m):
  target=m.group(2).strip('<>')
  if '://' in target:return m.group(0)
  key=str((md.parent/target).resolve())
  if key not in mapping:return m.group(0)
  return '['+m.group(1)+']('+os.path.relpath(mapping[key],md.parent).replace('\\','/')+')'
 t=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',fix,s)
 if s!=t:md.write_text(t,encoding='utf-8')
# Keep comparison script reproducible; existing rendered board remains a dated snapshot.
cp=root/'docs/04-art/style/compare-minato-match-02.py'
s=cp.read_text(encoding='utf-8')
for r in data['relocations']:s=s.replace(r['from'],r['to'])
cp.write_text(s,encoding='utf-8')
font=lambda n:ImageFont.truetype('C:/Windows/Fonts/BIZ-UDGothicR.ttc',n)
labels={'neutral':'通常','smile':'微笑み','serious':'真剣','surprised':'驚き','irritated':'苛立ち','pained':'沈痛','relieved':'安堵','amused':'楽しげ','worried':'不安・心配','sad':'悲しみ','determined':'決意'}
names={'minato':'佐伯 湊','mio':'相澤 澪','akari':'高瀬 あかり'}
def paste_fit(board,im,box):
 im=im.convert('RGBA'); b=im.getchannel('A').point(lambda a:255 if a>128 else 0).getbbox()
 if b: im=im.crop(b)
 x,y,w,h=box; scale=min(w/im.width,h/im.height)
 im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS)
 board.alpha_composite(im,(x+(w-im.width)//2,y+(h-im.height)//2))
for c in data['characters']:
 board=Image.new('RGBA',(1920,1080),(219,213,198,255)); d=ImageDraw.Draw(board)
 d.text((28,20),names[c['id']]+' / 全身・表情確認',font=font(32),fill=(45,40,34))
 d.text((28,65),'2026-10-13 更新　最大8表情 / 個別素材確認用',font=font(21),fill=(91,79,64))
 paste_fit(board,Image.open(root/('src/assets/images/characters/'+c['id']+'/full/neutral.png')),(20,116,435,915))
 for i,key in enumerate(c['keys']):
  x=480+(i%4)*354;y=115+(i//4)*475
  d.rectangle((x,y,x+338,y+456),fill=(235,230,218),outline=(162,149,127),width=2)
  paste_fit(board,Image.open(root/('src/assets/images/characters/'+c['id']+'/waist/'+key+'.png')),(x+7,y+7,324,405))
  d.text((x+12,y+418),labels[key]+' / '+key,font=font(21),fill=(48,42,34))
 out=root/('docs/04-art/characters/'+c['id']+'/drafts/gekiga-sheet-02.png')
 board.convert('RGB').save(out)
 c['sheet']=str(out.relative_to(root)).replace('\\','/')
# Static message-box placement preview (not game runtime validation).
board=Image.new('RGB',(1920,1080))
for i,r in enumerate(data['cutins']):
 im=Image.open(root/r['dest']).resize((960,540),Image.Resampling.LANCZOS)
 board.paste(im,(i*960,0)); board.paste(im,(i*960,540))
d=ImageDraw.Draw(board,'RGBA')
for i in range(2):
 d.rectangle((i*960+25,945,i*960+935,1060),fill=(12,16,21,220),outline=(163,153,136,255),width=2)
 d.text((i*960+45,957),'佐伯 湊',font=font(22),fill=(227,221,207,255))
 d.text((i*960+45,993),'メッセージ欄の配置確認（台詞ではありません）',font=font(20),fill=(227,221,207,255))
board.save(root/'docs/04-art/cutins/ui-review-02.png')
data['status']='generation_and_file_validation_complete_review_pending'
data['limitations']=['ゲーム実装・表示テストは未実施。身長に基づく頭身合わせは既存バックログ。','原画の顔・手・陰影は生成による微差がある。','透過エッジは半透明画素を含み、背景上の見え方は組み込み時に確認。','挿絵は頭頂の髪が上端に少しかかる構図。顔・電子タバコ・指は下部メッセージ欄を避ける。']
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'character_assets':26,'cutins':2,'sheets':3,'validation':'dimensions/mode/transparent corners/unique hashes verified'},ensure_ascii=False))
