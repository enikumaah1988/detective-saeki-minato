"""Mechanical export verification and review layout; no repainting."""
import hashlib,json,os,re
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[3]
ART=ROOT/'docs/04-art'
STYLE=ART/'style'
plan=json.loads((STYLE/'gekiga-rebuild-plan.json').read_text(encoding='utf-8-sig'))
chars=plan['characters']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,o):p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
old_map={}
for id in plan['adoptedFullTrials']:
 old=ART/'characters'/id/'drafts/gekiga-neutral-01.png'
 new=ROOT/'src/assets/images/characters'/id/'full/neutral.png'
 assert old.resolve().is_relative_to(ROOT) and new.resolve().is_relative_to(ROOT)
 if old.exists():
  assert sha(old)==sha(new),id
  old_map[old.resolve()]=new.resolve()
  doc=old.with_name('gekiga-neutral-01-prompt.md').read_text(encoding='utf-8-sig')
  raw=re.search(r'原本：([^\r\n]+)',doc)
  fence=chr(96)*3
  record={'id':id,'key':'neutral','kind':'full','dest':new.relative_to(ROOT).as_posix(),'source':raw.group(1) if raw else 'see prompt document','prompt':doc.split(fence+'text\n')[-1].split(fence)[0],'status':'base_design_user_adopted'}
  write(STYLE/'rebuild-records'/f'{id}-full-neutral.json',record)
  old.unlink()
for p in ART.rglob('*.md'):
 if 'history' in p.parts:continue
 original=p.read_text(encoding='utf-8-sig')
 def repl(m):
  t=m.group(1)
  if ':' in t or '#' in t:return m.group(0)
  resolved=(p.parent/t).resolve()
  return ']('+os.path.relpath(old_map[resolved],p.parent).replace('\\','/')+')' if resolved in old_map else m.group(0)
 updated=re.sub(r'\]\(([^)]+)\)',repl,original)
 if updated!=original:p.write_text(updated,encoding='utf-8')
records=[json.loads(p.read_text(encoding='utf-8-sig')) for p in (STYLE/'rebuild-records').glob('*.json')]
for e in records:
 current=[]
 for ref in e.get('refs',[]):
  for id in plan['adoptedFullTrials']:
   ref=ref.replace((ART/'characters'/id/'drafts/gekiga-neutral-01.png').as_posix(),(ROOT/'src/assets/images/characters'/id/'full/neutral.png').as_posix())
  current.append(ref)
 if current:e['refs_current']=current
 source=Path(e['source'])
 if source.exists():e['source_sha256']=sha(source)
 write(STYLE/'rebuild-records'/f"{e['id']}-{e['kind']}-{e['key']}.json",e)
lookup={(e['id'],e['kind'],e['key']):e for e in records}
assets=[]
for c in chars:
 pairs=[('portrait','neutral')] if c['id']=='misaki' else [('full','neutral')]+[('waist',k) for k in c['keys']]
 for kind,key in pairs:
  e=lookup[(c['id'],kind,key)];p=ROOT/e['dest'];im=Image.open(p)
  assert im.size==((1024,1536) if kind=='full' else (1024,1024)) and im.mode=='RGBA',p
  a=im.getchannel('A');corners=[a.getpixel(q) for q in [(0,0),(im.width-1,0),(0,im.height-1),(im.width-1,im.height-1)]]
  assert a.getextrema()[0]==0,p
  assert max(corners[:2] if kind=='portrait' else corners)==0,p
  h=sha(p)
  if e.get('validation'):assert h==e['validation']['sha256'],p
  assets.append({'id':c['id'],'kind':kind,'key':key,'path':e['dest'],'size':list(im.size),'mode':im.mode,'alpha_range':list(a.getextrema()),'corner_alpha':corners,'sha256':h,'source':e['source'],'record':f"rebuild-records/{c['id']}-{kind}-{key}.json"})
assert len(assets)==86 and len({e['sha256'] for e in assets})==86
def font(n):return ImageFont.truetype('C:/Windows/Fonts/BIZ-UDGothicR.ttc',n)
labels={'neutral':'通常','smile':'微笑み','serious':'真剣','surprised':'驚き','irritated':'苛立ち','pained':'沈痛','relieved':'安堵','amused':'楽しげ','playful':'おちゃらけ','smirk':'含み笑い','cool':'冷ややか','wary':'警戒','stern':'厳しさ','skeptical':'疑念','reluctant':'煙たさ','worried':'心配','sad':'悲しみ','determined':'決意','remorseful':'自責','confused':'困惑'}
def paste_fit(canvas,im,box):
 x,y,w,h=box;im=im.convert('RGBA')
 if im.height>im.width:
  bbox=im.getchannel('A').point(lambda a:255 if a>128 else 0).getbbox()
  if bbox:im=im.crop(bbox)
 s=min(w/im.width,h/im.height)
 im=im.resize((round(im.width*s),round(im.height*s)),Image.Resampling.LANCZOS)
 canvas.alpha_composite(im,(x+(w-im.width)//2,y+(h-im.height)//2))
sheets=[]
for c in chars:
 id=c['id']
 if id=='misaki':continue
 canvas=Image.new('RGBA',(1920,1080),(223,216,204,255));d=ImageDraw.Draw(canvas)
 d.text((28,24),c['name']+' / '+id,font=font(34),fill=(45,41,36))
 d.text((30,72),'劇画調・全身と表情確認 / 2026-10-13',font=font(19),fill=(78,70,60))
 d.rectangle((22,118,427,1047),fill=(204,200,190),outline=(125,119,108),width=2)
 paste_fit(canvas,Image.open(ROOT/f'src/assets/images/characters/{id}/full/neutral.png'),(25,120,400,920))
 for n in range(8):
  x=452+(n%4)*361;y=119+(n//4)*462
  d.rectangle((x,y,x+347,y+446),fill=(230,225,215),outline=(148,140,126),width=2)
  if n<len(c['keys']):
   key=c['keys'][n];paste_fit(canvas,Image.open(ROOT/f'src/assets/images/characters/{id}/waist/{key}.png'),(x+3,y+4,342,387))
   d.line((x,y+392,x+347,y+392),fill=(148,140,126))
   d.text((x+10,y+403),labels[key]+' / '+key,font=font(21),fill=(50,45,40))
  else:d.text((x+80,y+206),'追加用',font=font(23),fill=(145,137,126))
 dest=ART/f'characters/{id}/drafts/gekiga-sheet-01.png';canvas.convert('RGB').save(dest)
 sheets.append({'id':id,'path':dest.relative_to(ROOT).as_posix(),'size':[1920,1080],'sha256':sha(dest)})
manifest={'date':'2026-10-13','status':'generation_and_file_validation_complete','scope':plan['scope'],'counts':{'characters':11,'full':10,'waist':75,'portrait':1,'assets':86,'review_sheets':10},'assets':assets,'sheets':sheets,'verification':'All expected keys, sizes, RGBA, transparent four corners for standing/waist sprites and top corners for the chest portrait; hashes and unique files. Visual checks at generation; game UI and final individual adoption pending.'}
write(STYLE/'gekiga-rebuild-validation.json',manifest)
plan.update(status='generation_and_file_validation_complete',records='rebuild-records/',validation='gekiga-rebuild-validation.json')
write(STYLE/'gekiga-rebuild-plan.json',plan)
for c in chars:
 id=c['id'];p=ART/f'characters/{id}/profile.md';content=p.read_text(encoding='utf-8-sig')
 if '## 現行画風・再制作：2026-10-13' in content:continue
 first,rest=content.split('\n',1)
 block='\n\n## 現行画風・再制作：2026-10-13\nユーザーが主要5人の新テイストを採用し、全キャラクター・サブキャラと人物別の必要表情の再制作を指示。共通画風は[手描き劇画調](../../style/gekiga-style-revision-proposal.md)。旧画像は人物の識別点を引き継ぐ制作履歴とし、旧塗りを再利用しない。\n'
 if id=='misaki':block+='[新しい通常肖像](../../../../src/assets/images/characters/misaki/portrait/neutral.png)を制作。故人として写真・調査記録用のみ。生きた全身・会話表情は作らない。\n'
 else:block+=f'[新画風確認シート](drafts/gekiga-sheet-01.png)を制作。全身通常1枚と腰上{len(c["keys"])}表情をsrc/assets/images/characters/{id}/に保存。キー：'+', '.join(c['keys'])+'。\n'
 block+='[全員の制作一覧・生成記録](../../style/gekiga-rebuild.md)。画風の採用と、新規個別画像・確認シートの採用確認、ゲーム内表示の確認は別管理。今回の差分は制作済み・確認待ち。年齢・人物設定・未決・非公開情報・ストーリーは変更しない。以下の旧制作記録より本節を優先する。\n'
 if id=='minato':block+='現行の湊は新基準と採用全身に合わせ、眼鏡なし、白系シャツと緩めた黒ネクタイ、チャコール短丈ジャケット、無精髭。眼鏡あり・ノーネクタイは旧版の記録。喫煙具は電子タバコの設定を維持し、今回の立ち絵では描かない。\n'
 block+='\n## 移行前のプロフィール・制作記録\n'
 p.write_text(first+block+rest,encoding='utf-8')
lines=['# 全キャラクター：劇画調の再制作','','2026-10-13。ユーザー採用のテイストで、人物別に必要な既存表情と未制作分を一式制作。組み込みimage_gen使用。画風採用済み。今回の個別画像・確認シートの最終確認とゲーム内表示は未実施。','','| 人物 | 全身 | 腰上表情 | 確認資料 |','|---|---|---|---|']
for c in chars:
 id=c['id']
 if id=='misaki':lines.append(f'| {c["name"]} | 写真用肖像1 | 会話差分なし | [肖像](../../../src/assets/images/characters/{id}/portrait/neutral.png) |')
 else:lines.append(f'| {c["name"]} | 1 | {len(c["keys"])}：'+', '.join(c['keys'])+f' | [確認シート](../characters/{id}/drafts/gekiga-sheet-01.png) |')
lines+=['','計86素材：全身10・腰上75・肖像1。既存8人の62腰上を再制作し、黒田6・宮原7の未制作13腰上を追加。主要5人の採用済み全身試作を使用、他5人の全身と三崎の肖像を新規作画。人物別の素材パスを維持。','','## 保存と由来','ゲーム素材はsrc/assets/images/characters/<id>/full/neutral.pngとwaist/<key>.png。三崎はportrait/neutral.png。同一PNGの二重管理をしない。主要5人の試作はゲーム素材正本へ移し、リンクを更新。原本はgenerated_imagesに保持。旧版はGit b749657、11924ee以前から参照できる。新確認シートは背景付き1920×1080、左全身・右4×2最大8表情。実際の個別素材を縮小合成しており、別の顔を生成していない。','','[制作対象](gekiga-rebuild-plan.json) / [各プロンプト・原本・検証記録](rebuild-records/) / [全86素材の検証](gekiga-rebuild-validation.json) / [書出し](save-rebuild-asset.py) / [確認シート作成](finalize-rebuild.py)。','','## 確認範囲・残る調整','生成結果を目視し、顔・衣装・表情・所作・全身の収まりを確認。必要キー、共通寸法、RGBA、四隅の透明、ハッシュ、全86点の重複なしを照合済み。原本全キャンバスを等比調整し、表情ごとの輪郭再フィット・左右反転・後付け画風フィルターを使っていない。','','実身長・頭の大きさ合わせは既存ART-01のバックログ。靴の光沢、若手の整った顔、半透明の縁・全身周辺のにじみ、切替時の微差は調整候補。UI確認・個別採用は未完了。直人は今回、画面右向きに近い顔になっており、旧左向きの配置へ単純反転しない。正面湊・右向きあかり等の追加角度と挿絵は今回の通常・表情一式とは別の後続制作。過去の角度候補や挿絵は旧画風資料。','','## 後続制作','共通画風と最新の全身・waist/neutral.pngを優先する。旧sheet.pngは人物識別・所作の履歴で、塗りの基準にしない。新シート確認後に採用sheet.pngを更新する。黒田・宮原・三崎の未承認属性、直人・沙織のストーリー同期待ち、湊の非公開情報を勝手に確定しない。ゲームコード・ストーリーは変更していない。']
(STYLE/'gekiga-rebuild.md').write_text(('\n'.join(lines)+'\n').replace('四隅の透明','立ち絵の四隅と肖像の上側2隅の透明'),encoding='utf-8')
print(json.dumps(manifest['counts'],ensure_ascii=False))
