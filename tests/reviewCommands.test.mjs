import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'
test('導入→仮扉絵→日常。未聴取の人物・証言は取得しない', async () => {
  const api=await loadRevision();let state=api.createInitialState(api.scenario)
  assert.equal(state.nodeId,'episode-prologue-1')
  for(let i=1;i<=4;i++){
    assert.equal(state.nodeId,`episode-prologue-${i}`)
    assert.deepEqual(state.acquiredInformation,[])
    state=api.reduceGameState(api.scenario,state,{type:'advance'})
  }
  assert.equal(state.nodeId,'P1-01-start')
  assert.equal(api.scenario.nodes[state.nodeId].illustration.provisional,true)
  state=api.reduceGameState(api.scenario,state,{type:'advance'})
  assert.equal(state.nodeId,'P1-01-intro')
})
test('会話と質問・見ると詳細調査の役割、見出し・対象名・具体的な進行を統一',async()=>{
  const api=await loadRevision(),run=buildPlaythrough(api)
  assert.equal(run.state.nodeId,'episode-complete')
  for(const phase of api.revisionData.scenes){
    const state=run.checkpoints.find(point=>point.phase===phase.id).state
    const commands=api.visibleChoices(api.scenario.nodes[state.nodeId],state)
    for(const command of commands){
      assert.doesNotMatch(command.label,/^(次へ|続ける)$/)
      const target=api.scenario.nodes[command.next]
      if(target.type==='topic'){
        assert.equal(target.heading,command.label)
        for(const person of target.options)assert.equal(api.scenario.nodes[person.next].heading,command.label)
      }
      if(command.id==='look'||command.id==='investigate')for(const option of target.options){
        assert.doesNotMatch(option.label,/開く|調べる|見る|確認する/)
      }
    }
  }
  assert.equal(api.revisionCommand('inspect','p1-ledger'),'look')
  assert.equal(api.revisionCommand('inspect','p2-journal'),'investigate')
  assert.equal(api.revisionCommand('ask','p1-family'),'speak')
  assert.equal(api.revisionCommand('ask','p1-morning'),'talk')
})
test('3人シーンは左・中央・右を明示し、人物と位置の重複を拒否する',async()=>{
  const api=await loadRevision()
  const people=[{characterId:'segawa',expression:'normal',position:'left'},{characterId:'minato',expression:'normal',position:'center'},{characterId:'okumura',expression:'normal',position:'right'}]
  const scenario=characters=>({id:'three-people',start:'a',scenes:{room:{backgroundId:'police-meeting',characters}},nodes:{a:{type:'end',sceneId:'room',stage:{backgroundId:'police-meeting'},text:''}}})
  assert.equal(api.createInitialState(scenario(people)).nodeId,'a')
  assert.throws(()=>api.createInitialState(scenario(people.map(person=>({...person,position:'left'})))),/左・中央・右/)
  assert.throws(()=>api.createInitialState(scenario([...people.slice(0,2),people[0]])),/人物構成/)
})
