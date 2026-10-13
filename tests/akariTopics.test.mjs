import test from 'node:test'
import assert from 'node:assert/strict'
import {loadRevision,buildPlaythrough} from './revisionHarness.mjs'

test('あかりの質問は基本3件→追加質問→次の話題。順序と途中保存に依存しない',async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true)
 const initial=run.checkpoints.find(point=>point.phase==='P1-02').state
 const orders=[['p1-missing','p1-morning','p1-contact'],['p1-missing','p1-contact','p1-morning'],['p1-morning','p1-missing','p1-contact'],['p1-morning','p1-contact','p1-missing'],['p1-contact','p1-missing','p1-morning'],['p1-contact','p1-morning','p1-missing']]
 for(const order of orders){
  let state={...initial,nodeId:'P1-03-speak-akari'}
  const topics=()=>api.visibleChoices(api.scenario.nodes[state.nodeId],state).filter(option=>option.id!=='return').map(option=>option.id)
  const read=id=>{
   state=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:id})
   assert.notEqual(state.nodeId,'P1-03-speak-akari',id)
   while(api.scenario.nodes[state.nodeId].type==='dialogue')state=api.reduceGameState(api.scenario,state,{type:'advance'})
  }
  assert.deepEqual(topics(),['p1-missing','p1-morning','p1-contact'])
  const denied=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:'p1-workplace'});assert.strictEqual(denied,state)
  for(const [index,id]of order.entries()){
   read(id)
   const restored=api.restoreSaveData(api.createSaveData(state),[api.scenario]);assert.deepEqual(restored.state,state);state=restored.state
   if(index<2)assert.deepEqual(topics(),['p1-missing','p1-morning','p1-contact'])
  }
  const reopen=()=>{assert.equal(state.nodeId,'P1-03-menu');state=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:'speak'});state=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:'akari'})}
  reopen()
  assert.deepEqual(topics(),['p1-workplace','p1-searched'])
  read('p1-workplace');assert.deepEqual(topics(),['p1-workplace','p1-searched','p1-company-answer'])
  read('p1-searched');assert.deepEqual(topics(),['p1-workplace','p1-searched','p1-company-answer','p1-police'])
  read('p1-company-answer');assert.equal(topics().includes('p1-family'),false)
  read('p1-police')
  reopen()
  assert.deepEqual(topics(),['p1-age','p1-daily','p1-family','P1-03-close-conversation'])
  const retired=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:'p1-morning'});assert.strictEqual(retired,state)
  read('P1-03-close-conversation');assert.equal(state.nodeId,'P1-04-menu')
 }
})

test('外の表示は建物名称前、マップを開く選択は他に移動する',async()=>{
 const api=await loadRevision()
 for(const [id,node]of Object.entries(api.scenario.nodes)){
  if(!/^P\d-/.test(id))continue
  if(node.type==='choice' && /-(outside|destination)$/.test(id)){
   assert.match(node.prompt,/前$/);assert.doesNotMatch(node.prompt,/建物前/)
   assert.equal(node.options.find(option=>option.id==='map').label,'他に移動する')
  }
 }
})
