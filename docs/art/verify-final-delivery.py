"""Read-only verification of 25 current art candidates; writes handoff JSON."""
from pathlib import Path
import json,hashlib,sys
from PIL import Image
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent
chapter_commit=sys.argv[1] if len(sys.argv)>1 else 'commit-pending'
groups=[
 ('integration-batch-01-validation.json','integration-batch-01-sources.json','8398e09',None),
 ('backgrounds/batch-02-validation.json','backgrounds/batch-02-sources.json','d919cda','background'),
 ('backgrounds/batch-03-validation.json','backgrounds/batch-03-sources.json','1c8485f','background'),
 ('illustrations/chapter-validation.json','illustrations/chapter-sources.json',chapter_commit,'chapter')]
all_rows=[];connections=[]
for validation,sources,commit,kind in groups:
 entries=json.loads((HERE/validation).read_text(encoding='utf-8'))
 source_by_id={v['id']:v for v in json.loads((HERE/sources).read_text(encoding='utf-8'))}
 for row in entries:
  path=ROOT/row['file'];im=Image.open(path)
  assert im.size==(1920,1080) and im.mode=='RGB',(row['file'],im.size,im.mode)
  digest=hashlib.sha256(path.read_bytes()).hexdigest()
  assert digest==row['sha256'],row['file']
  source=source_by_id[row['id']]['source']
  source_hash=hashlib.sha256(Path(source).read_bytes()).hexdigest()
  if row.get('sourceSha256'):assert source_hash==row['sourceSha256'],source
  category=kind or ('cutin' if row['kind']=='cutins' else 'background')
  entry=dict(row,kind=category,source=source,sourceSha256=source_hash,productionCommit=commit,
             sourceRecord=('docs/art/'+sources),validationRecord=('docs/art/'+validation),
             adoption='ユーザー採用確認待ち')
  if category=='chapter':
   entry['suggestedGameFile']=source_by_id[row['id']]['fileKey']+'.png'
   connections+=row['connections']
  all_rows.append(entry)
assert len(all_rows)==25
assert len({v['file'] for v in all_rows})==25
counts={k:sum(v['kind']==k for v in all_rows) for k in ['background','chapter','cutin']}
assert counts==dict(background=16,chapter=7,cutin=2),counts
assert sorted(connections)==sorted(['C1-IN','C1-OUT','C2-IN','C2-OUT','C3-IN','C3-OUT','C4-IN','C4-OUT'])
report=dict(date='2026-10-12',status='PASS: current candidates only; no formal adoption or game test',counts=counts,chapterConnections=8,branch='art/main-characters',assets=all_rows)
(HERE/'final-delivery-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PASS:25 RGB1920x1080 candidates; source/export SHA-256 match;16 backgrounds,7 chapter images,2 cutins,8 chapter connections.')
