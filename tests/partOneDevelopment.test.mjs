import test from 'node:test'
import assert from 'node:assert/strict'
import {loadRevision,buildPlaythrough} from './revisionHarness.mjs'

test('新第1部は会社・旧ビル・階段・帰所まで。警察と本人との約束は第2部',async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true)
 assert.equal(api.revisionData.scenes.filter(phase=>phase.part===1).length,16)
 assert.equal(api.revisionData.scenes.find(phase=>phase.id==='P2-06').part,1)
 assert.equal(api.revisionData.scenes.find(phase=>phase.id==='P2-07').part,2)
 assert.equal(api.revisionData.scenes.find(phase=>phase.id==='P2-07').locationId,'office')
 const ending=run.checkpoints.find(point=>point.phase==='P1-08-REPORT').state
 for(const id of ['F19','E01','E03','F32','F39','F40','IT04','initial-inquiry-reviewed'])assert.ok(ending.acquiredInformation.includes(id),id)
 for(const id of ['F33','E02','F36','F41','F42','W01','W02','W03'])assert.equal(ending.acquiredInformation.includes(id),false,id)
 assert.equal(ending.flags.part1_completed,true)
 assert.equal(run.checkpoints.find(point=>point.phase==='P1-06').state.flags.part1_completed,undefined)
 const firstOut=run.operations.find(operation=>api.scenario.nodes[operation.before].illustration?.id==='C1-OUT')
 assert.equal(firstOut.before,'P1-08-REPORT-end')
 const secondStart=run.operations.find(operation=>api.scenario.nodes[operation.before].illustration?.id==='C2-IN')
 assert.equal(secondStart.before,'P2-07-start')
 assert.ok(api.selectInvestigationRecords(ending,api.scenario.records).some(record=>record.id==='initial-inquiry'))
})

test('第1部の追加話題は既存項目の後ろ。切替前に会話を読み、8件以下に収める',async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api)
 let state=api.createInitialState(api.scenario),max=0
 for(const operation of run.operations){
  const node=api.scenario.nodes[state.nodeId]
  if(node.type==='topic'&&node.appendUnlockedTopics&&node.selection!=='person'){
   const before=api.visibleChoices(node,state).filter(item=>item.id!=='return').map(item=>item.id)
   max=Math.max(max,before.length);assert.ok(before.length<=8,state.nodeId)
   if(operation.action.type==='choose'&&operation.action.choiceId!=='return'){
    let after=api.reduceGameState(api.scenario,state,operation.action),bridge=false
    for(let count=0;count<80&&api.scenario.nodes[after.nodeId].type==='dialogue';count++){
     const next=api.scenario.nodes[after.nodeId]
     if(next.conditionalNext?.some(branch=>api.matchesCondition(api.applyUpdates(after,next.updates??[]),branch.condition)))bridge=true
     after=api.reduceGameState(api.scenario,after,{type:'advance'})
    }
    if(after.nodeId===state.nodeId){
     const displayed=api.visibleChoices(node,after).filter(item=>item.id!=='return').map(item=>item.id)
     const remaining=before.filter(id=>displayed.includes(id)),added=displayed.filter(id=>!before.includes(id))
     assert.deepEqual(displayed,[...remaining,...added],state.nodeId)
     if(before.length&&!remaining.length&&added.length)assert.equal(bridge,true,state.nodeId)
    }
   }
  }
  state=api.reduceGameState(api.scenario,state,operation.action)
 }
 assert.ok(max>=6,'深掘りが必要な場面の話題を一律3件にはしない')
 console.log(JSON.stringify({partOneMaximumVisibleTopics:max,backExcluded:true}))
})

test('旧保存で新しい帰所報告を通っていなくても、読んだ報告だけを取得して第2部を続ける',async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true)
 const checkpoint=run.checkpoints.find(point=>point.phase==='P2-08-EXIT').state
 let state={...checkpoint,nodeId:'P2-09-intro',acquiredInformation:checkpoint.acquiredInformation.filter(id=>!['F38','F39','F40','IT04','initial-inquiry-reviewed'].includes(id))}
 const saved=api.restoreSaveData(api.createSaveData(state),[api.scenario]);assert.deepEqual(saved.state,state)
 const read=()=>{while(api.scenario.nodes[state.nodeId].type==='dialogue')state=api.reduceGameState(api.scenario,state,{type:'advance'})}
 read();assert.equal(state.nodeId,'P2-09-menu')
 state=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:'speak'})
 state=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:'mio'})
 for(const id of ['p2-police-report','p2-company-report','p2-building-report']){
  assert.ok(api.visibleChoices(api.scenario.nodes[state.nodeId],state).some(option=>option.id===id),id)
  state=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:id});read()
 }
 assert.equal(state.nodeId,'P2-10-menu')
 for(const id of ['F39','F40','IT04','F41'])assert.ok(state.acquiredInformation.includes(id))
 const fresh=run.checkpoints.find(point=>point.phase==='P2-09').state
 assert.equal(api.visibleChoices(api.scenario.nodes['P2-09-speak-mio'],fresh).some(option=>['p2-company-report','p2-building-report'].includes(option.id)),false)
})

test('あかりの後半は受諾→写真と連絡先→見送り。任意の補足を持ち越さない',async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true)
 let state={...run.checkpoints.find(point=>point.phase==='P1-04').state,nodeId:'P1-05-speak-akari'}
 const topics=()=>api.visibleChoices(api.scenario.nodes[state.nodeId],state).filter(item=>item.id!=='return').map(item=>item.id)
 const read=id=>{
  state=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:id})
  const seen=[]
  while(api.scenario.nodes[state.nodeId].type==='dialogue'){seen.push(state.nodeId);state=api.reduceGameState(api.scenario,state,{type:'advance'})}
  return seen
 }
 assert.deepEqual(topics(),['p1-accept','p1-request-scope'])
 assert.ok(read('p1-accept').includes('p1-request-to-materials'))
 assert.deepEqual(topics(),['p1-photo'])
 read('p1-photo');assert.deepEqual(topics(),['p1-photo','p1-client-contact'])
 assert.ok(read('p1-client-contact').includes('p1-materials-to-farewell'))
 assert.deepEqual(topics(),['p1-return-home','P1-05-farewell'])
 const restored=api.restoreSaveData(api.createSaveData(state),[api.scenario]);assert.deepEqual(restored.state,state)
 for(const id of ['P1-06-end','P2-01-start','p2-company-report','p2-building-report']){
  const saved={...state,nodeId:id};const old=api.restoreSaveData(api.createSaveData(saved),[api.scenario])
  assert.equal(old.ok,true);assert.deepEqual(old.state.acquiredInformation,saved.acquiredInformation)
 }
})
