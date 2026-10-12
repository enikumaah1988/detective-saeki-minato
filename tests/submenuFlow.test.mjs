import test from 'node:test'
import assert from 'node:assert/strict'
import {loadRevision,buildPlaythrough} from './revisionHarness.mjs'
test('通常会話と人物を見るの後は元の一覧に留まり、戻るで一階層ずつ戻る',async()=>{
 const api=await loadRevision();let state={...api.createInitialState(api.scenario),nodeId:'P1-01-menu'}
 const choose=id=>{state=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:id})}
 const read=()=>{while(api.scenario.nodes[state.nodeId].type==='dialogue')state=api.reduceGameState(api.scenario,state,{type:'advance'})}
 choose('speak');choose('mio');choose('p1-schedule');read()
 assert.equal(state.nodeId,'P1-01-speak-mio')
 choose('return');assert.equal(state.nodeId,'P1-01-speak-people')
 choose('return');assert.equal(state.nodeId,'P1-01-menu')
 const facts=state.acquiredInformation
 choose('look');choose('P1-01-observe-mio');read()
 assert.equal(state.nodeId,'P1-01-targets');assert.deepEqual(state.acquiredInformation,facts)
 choose('p1-ledger');read();assert.equal(state.nodeId,'P1-02-menu')
 const unseen=api.visibleChoices(api.scenario.nodes['P1-02-targets'],state).find(item=>item.id==='P1-02-observe-akari')
 assert.equal(unseen.label,'女性');assert.doesNotMatch(api.scenario.nodes[unseen.next].text,/高瀬/)
 const mio=api.scenario.nodes['P1-02-observe-mio']
 assert.ok(mio.stage.characters.some(person=>person.characterId==='mio'))
 assert.equal(mio.stage.backgroundId,api.scenario.nodes['P1-02-menu'].stage.backgroundId)
 assert.equal(api.scenario.nodes['P1-02-speak-mio'].options.length,0)
})
test('全場面は標準のメインコマンドのみ。話題重複・二重進行を作らず部屋名で到着する',async()=>{
 const api=await loadRevision(),full=buildPlaythrough(api),mandatory=buildPlaythrough(api,true)
 for(const run of [full,mandatory]){assert.equal(run.state.nodeId,'episode-complete');assert.equal(run.checkpoints.length,46);assert.equal(run.boundaries.length,8)}
 const standard=new Set(['look','speak','investigate','talk','think','organize','move'])
 for(const phase of api.revisionData.scenes){
  const root=api.scenario.nodes[`${phase.id}-menu`]
  assert.equal(new Set(root.options.map(option=>option.id)).size,root.options.length)
  for(const option of root.options)assert.ok(standard.has(option.id),`${phase.id}:${option.label}`)
  const seen=new Set()
  for(const option of root.options){const node=api.scenario.nodes[option.next];if(node.type!=='topic')continue
   for(const person of node.options){const topics=api.scenario.nodes[person.next]
    for(const topic of topics.options){assert.ok(!seen.has(topic.id),`${phase.id}重複:${topic.id}`);seen.add(topic.id)}
   }
  }
 }
 assert.equal(api.scenario.nodes['P2-03-arrival'].text,'応接室に入った。')
 assert.equal(api.scenario.nodes['P2-06-arrival'].text,'階段に入った。')
 assert.equal(api.scenario.nodes['P4-02-arrival'].text,'旧事務室に入った。')
})
test('後から開いた任意話題を持ち越し、退出前の挨拶まで選べる',async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true)
 const state=run.checkpoints.find(point=>point.phase==='P1-05').state
 const before={...state,acquiredInformation:state.acquiredInformation.filter(id=>id!=='P1-05-farewell'),heardTopics:state.heardTopics.filter(id=>id!=='P1-05-farewell')}
 const options=api.visibleChoices(api.scenario.nodes['P1-05-speak-akari'],before)
 assert.ok(options.some(option=>option.id==='p1-return-home'))
 assert.ok(options.some(option=>option.id==='P1-05-farewell'))
 const carried=api.scenario.nodes['P1-04-speak-akari'].options
 assert.ok(carried.some(option=>option.id==='p1-family'))
})
test('旧「仕事に戻る」の保存位置は会話へ移行し、未読の名乗りを付与しない',async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true)
 const old={...run.checkpoints.find(point=>point.phase==='P1-01').state,nodeId:'P1-01-exit'}
 const restored=api.restoreSaveData(api.createSaveData(old),[api.scenario])
 assert.equal(restored.ok,true)
 assert.deepEqual(restored.state.acquiredInformation,old.acquiredInformation)
 const node=api.scenario.nodes[restored.state.nodeId]
 assert.equal(node.type,'dialogue');assert.ok(node.text.trim())
 const next=api.reduceGameState(api.scenario,restored.state,{type:'advance'})
 assert.equal(next.nodeId,'P1-02-intro')
 assert.ok(next.acquiredInformation.includes('met-akari'))
 assert.equal(next.acquiredInformation.includes('named-akari'),false)
})
