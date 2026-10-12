import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {resolveExpression} from '../src/data/presentation.ts'
import {loadRevision,buildPlaythrough} from './revisionHarness.mjs'

test('全75表情と肖像が新素材へ接続し、旧画風の角度候補を表示しない',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../docs/imported-character-assets.json',import.meta.url),'utf8'))
 assert.equal(manifest.counts.characters,11)
 for(const entry of manifest.files.filter(entry=>entry.kind!=='full')){
  const image=resolveExpression(entry.characterId,entry.kind==='portrait'?'normal':entry.expression).imageSrc
  assert.ok(image,`${entry.characterId}:${entry.expression}`)
  assert.ok(image.endsWith(entry.file.replace('src/','')),entry.file)
 }
 assert.equal(resolveExpression('minato','front-normal').imageSrc,resolveExpression('minato','normal').imageSrc)
 assert.equal(resolveExpression('akari','right-sad').imageSrc,resolveExpression('akari','sad').imageSrc)
})

test('黒田・宮原は対面後に顔を表示。名前だけの登場と三崎の未確認肖像はUNKNOWN',async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true)
 const state=id=>run.checkpoints.find(point=>point.phase===id).state
 const person=(phase,id)=>api.selectInvestigationRecords(state(phase),api.scenario.records).find(record=>record.id===id)
 assert.equal(person('P2-02','kuroda').imageSrc,undefined)
 assert.ok(person('P2-03','kuroda').imageSrc)
 assert.equal(person('P2-03','miyahara').imageSrc,undefined)
 assert.ok(person('P2-04','miyahara').imageSrc)
 assert.equal(person('P2-05','misaki').imageSrc,undefined)
})
