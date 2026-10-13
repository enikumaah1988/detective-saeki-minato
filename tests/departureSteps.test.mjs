import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'

test('写真確認の後は電話→留守中の対応→出発の挨拶を会話送りだけで読み、移動と任意話題を残す', async () => {
  const api = await loadRevision(), run = buildPlaythrough(api,true)
  let state = {...run.checkpoints.find(p=>p.phase==='P1-05').state,nodeId:'P1-06-menu'}
  const choose = id => {state=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:id})}
  choose('look'); choose('p1-inspect-photo')
  assert.equal(state.acquiredInformation.includes('F10'),false)
  const seen=[]
  while(api.scenario.nodes[state.nodeId].type==='dialogue') {
    seen.push(state.nodeId)
    if(state.nodeId.startsWith('p1-company-call')) assert.equal(state.acquiredInformation.includes('F11'),false)
    if(state.nodeId.startsWith('p1-mio-role')) assert.equal(state.acquiredInformation.includes('F12'),false)
    state=api.reduceGameState(api.scenario,state,{type:'advance'})
  }
  for(const id of ['p1-company-call','p1-mio-role','p2-depart']) assert.ok(seen.includes(id),id)
  assert.equal(state.nodeId,'P2-01-menu')
  for(const id of ['F10','F11','mentioned-company-reception','F12','p2-departed']) assert.ok(state.acquiredInformation.includes(id),id)
  assert.equal(state.acquiredInformation.includes('optional-client-mood'),false)
  const options=api.visibleChoices(api.scenario.nodes[state.nodeId],state)
  assert.ok(options.some(option=>option.id==='move'))
  choose('speak');choose('mio')
  assert.ok(api.visibleChoices(api.scenario.nodes[state.nodeId],state).some(option=>option.id==='p1-client-mood'))
  for(const phase of ['P1-06','P2-01']) for(const node of Object.values(api.scenario.nodes)) {
    if(node.type==='topic'&&node.sceneId?.startsWith(phase)) assert.equal(node.options.some(option=>['p1-company-call','p1-mio-role','p2-depart'].includes(option.id)),false)
  }
})

test('旧保存の一覧は前提に応じた段取りから再開し、途中会話と取得済み情報を維持する', async () => {
  const api=await loadRevision(),run=buildPlaythrough(api,true)
  const base=run.checkpoints.find(p=>p.phase==='P1-05').state
  for(const [nodeId, extra, expected] of [
    ['P1-06-menu',[], 'P1-06-menu'],
    ['P1-06-speak-mio',['F10'],'p1-company-call'],
    ['P1-06-menu',['F10','F11','mentioned-company-reception'],'p1-mio-role'],
    ['P2-01-menu',['F10','F11','mentioned-company-reception','F12'],'p2-depart'],
    ['p1-company-call-3',['F10'],'p1-company-call-3'],
    ['p1-mio-role-2',['F10','F11','mentioned-company-reception'],'p1-mio-role-2'],
  ]) {
    const saved={...base,nodeId,acquiredInformation:[...base.acquiredInformation,...extra]}
    const restored=api.restoreSaveData(api.createSaveData(saved),[api.scenario]);assert.equal(restored.ok,true)
    const after=api.reduceGameState(api.scenario,api.createInitialState(api.scenario),{type:'restore',state:restored.state})
    assert.equal(after.nodeId,expected)
    for(const id of ['F11','F12','p2-departed']) assert.equal(after.acquiredInformation.includes(id),saved.acquiredInformation.includes(id))
  }
  const finished={...run.checkpoints.find(p=>p.phase==='P2-01').state,nodeId:'P2-01-menu'}
  assert.deepEqual(api.reduceGameState(api.scenario,finished,{type:'restore',state:finished}),finished)
})
