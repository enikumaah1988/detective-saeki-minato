import test from 'node:test'
import assert from 'node:assert/strict'
import {loadRevision,buildPlaythrough} from './revisionHarness.mjs'

test('話すへの統合と電話表示、日常話題の期限、旧聞く保存位置の復元',async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true)
 for(const phase of api.revisionData.scenes){
  assert.equal(api.scenario.nodes[`${phase.id}-menu`].options.some(option=>option.id==='talk'),false)
 }
 assert.ok(api.scenario.nodes['P1-03-speak-akari'].options.some(option=>option.id==='p1-morning'))
 for(const phase of ['P1-02','P1-03','P1-05'])assert.equal(api.scenario.nodes[`${phase}-speak-people`].options.some(option=>option.id==='mio'),false)
 assert.match(api.scenario.nodes['P3-03-speak-people'].options.find(option=>option.id==='mio').label,/（電話）/)
 assert.match(api.scenario.nodes['P2-07-speak-people'].options.find(option=>option.id==='okumura').labelWhen.label,/（電話）/)
 const saved={...run.checkpoints.find(point=>point.phase==='P1-03').state,nodeId:'P1-03-talk-akari'}
 const restored=api.restoreSaveData(api.createSaveData(saved),[api.scenario])
 assert.equal(restored.ok,true);assert.deepEqual(restored.state.acquiredInformation,saved.acquiredInformation)
 assert.equal(api.scenario.nodes[restored.state.nodeId].heading,'話す')
 const back=api.reduceGameState(api.scenario,restored.state,{type:'choose',choiceId:'return'})
 assert.equal(back.nodeId,'P1-03-speak-people')
})

test('必要な質問を終えても一覧に留まり、確認を選んで会話を閉じる',async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true)
 const checkpoint=run.checkpoints.find(point=>point.phase==='P1-03').state
 let state={...checkpoint,nodeId:'P1-03-speak-akari',acquiredInformation:checkpoint.acquiredInformation.filter(id=>!['P1-03-conversation-closed','F06','police-consulted'].includes(id))}
 state=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:'p1-police'})
 while(api.scenario.nodes[state.nodeId].type==='dialogue')state=api.reduceGameState(api.scenario,state,{type:'advance'})
 assert.equal(state.nodeId,'P1-03-speak-akari')
 state=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:'P1-03-close-conversation'})
 while(api.scenario.nodes[state.nodeId].type==='dialogue')state=api.reduceGameState(api.scenario,state,{type:'advance'})
 assert.equal(state.nodeId,'P1-04-menu')
})

test('見るで対象を発見してから調べる。発見だけで証拠は取得しない',async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true)
 const checkpoint=run.checkpoints.find(point=>point.phase==='P2-05').state
 let state={...checkpoint,nodeId:'P2-05-menu',acquiredInformation:checkpoint.acquiredInformation.filter(id=>!['p2-journal-noticed','E01','IT02'].includes(id))}
 assert.equal(api.visibleChoices(api.scenario.nodes['P2-05-investigate-targets'],state).some(option=>option.id==='p2-journal'),false)
 state=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:'look'})
 state=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:'p2-journal-notice'})
 state=api.reduceGameState(api.scenario,state,{type:'advance'})
 assert.equal(state.nodeId,'P2-05-targets')
 assert.equal(state.acquiredInformation.includes('E01'),false)
 assert.equal(state.acquiredInformation.includes('IT02'),false)
 assert.ok(api.visibleChoices(api.scenario.nodes['P2-05-investigate-targets'],state).some(option=>option.id==='p2-journal'))
})

test('資料は相手・話題一覧から使用でき、元の階層に戻り、別の相手には使えない',async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true)
 const checkpoint=run.checkpoints.find(point=>point.phase==='P2-03').state
 for(const origin of ['P2-03-menu','P2-03-speak-people','P2-03-speak-kuroda']){
  let state={...checkpoint,nodeId:origin}
  state=api.reduceGameState(api.scenario,state,{type:'use-item',itemId:'naoto-photo'})
  assert.notEqual(state.nodeId,origin)
  const saved=api.restoreSaveData(api.createSaveData(state),[api.scenario])
  assert.equal(saved.ok,true);assert.deepEqual(saved.state,state)
  while(api.scenario.nodes[state.nodeId].type==='dialogue')state=api.reduceGameState(api.scenario,state,{type:'advance'})
  assert.equal(state.nodeId,origin)
 }
 const wrong={...run.checkpoints.find(point=>point.phase==='P4-04').state,nodeId:'P4-04-speak-okumura'}
 assert.strictEqual(api.reduceGameState(api.scenario,wrong,{type:'use-item',itemId:'site-plan'}),wrong)
})
