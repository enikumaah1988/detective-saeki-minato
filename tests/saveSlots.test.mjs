import test, {before} from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from './viteServer.mjs'
import {loadRevision,buildPlaythrough} from './revisionHarness.mjs'
import {savePhase} from '../src/features/story/autoSave.ts'
let readSlots,writeSlot,loadSlot,SLOT_STORAGE_KEY,SAVE_STORAGE_KEY
before(async()=>{const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});try{({readSlots,writeSlot,loadSlot,SLOT_STORAGE_KEY}=await server.ssrLoadModule('/src/features/story/saveSlots.ts'));({SAVE_STORAGE_KEY}=await server.ssrLoadModule('/src/features/story/storage.ts'))}finally{await server.close()}})
const storage=()=>{const map=new Map();return{getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value),removeItem:key=>map.delete(key)}}
test('手動3枠を最新順に繰り下げ、AUTOは独立1枠。枠内SaveData v2と履歴を復元する',async()=>{
 const api=await loadRevision(),store=storage(),base=api.createInitialState(api.scenario)
 for(let i=1;i<=4;i++) assert.equal(writeSlot({...base,nodeId:`episode-prologue-${Math.min(i,2)}`},'manual',String(i),[{speaker:'湊',text:String(i),nodeId:base.nodeId}],store).ok,true)
 assert.deepEqual(readSlots(store).manual.map(slot=>slot.label),['4','3','2'])
 writeSlot(base,'auto','A',[],store);writeSlot(base,'auto','B',[],store)
 assert.equal(readSlots(store).auto.label,'B');assert.equal(readSlots(store).manual.length,3)
 const loaded=loadSlot(1,[api.scenario],store);assert.equal(loaded.ok,true);assert.equal(loaded.history[0].text,'3')
 assert.equal(readSlots(store).manual[0].data.version,2)
 assert.equal(loadSlot('auto',[api.scenario],storage()).reason,'no-save')
})
test('旧単一セーブを失わず移行し、失敗時は既存データを保持する',async()=>{
 const api=await loadRevision(),store=storage(),base=api.createInitialState(api.scenario)
 const raw=JSON.stringify(api.createSaveData(base));store.setItem(SAVE_STORAGE_KEY,raw)
 assert.equal(readSlots(store).manual.length,1);assert.equal(store.getItem(SAVE_STORAGE_KEY),raw)
 assert.deepEqual(loadSlot(0,[api.scenario],store).state,base)
 readSlots(store);assert.equal(readSlots(store).manual.length,1)
 store.setItem(SLOT_STORAGE_KEY,'broken');assert.equal(writeSlot(base,'manual','x',[],store).ok,false)
 assert.equal(store.getItem(SLOT_STORAGE_KEY),'broken');assert.equal(store.getItem(SAVE_STORAGE_KEY),raw)
})
test('AUTO識別は通常の話題追加・ページ送りで変わらず場面と段階切替でだけ変わる',async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true)
 let state=api.createInitialState(api.scenario),changes=0
 for(const op of run.operations){
  const before=savePhase(api.scenario,state),next=api.reduceGameState(api.scenario,state,op.action),after=savePhase(api.scenario,next)
  if(before!==after&&after)changes++
  if(op.before.startsWith('p1-company-call-')||op.before==='p1-company-call')assert.equal(before,after)
  state=next
 }
 assert.ok(changes>=48&&changes<70,String(changes))
})
