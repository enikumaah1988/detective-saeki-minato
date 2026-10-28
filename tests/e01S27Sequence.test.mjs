import test from 'node:test'
import assert from 'node:assert/strict'
import { loadEpisode, playEpisode } from './e01EpisodeHarness.mjs'
const api = await loadEpisode(), { scenario } = api
const source = api.source.find(scene => scene.id === 'S27')

test('S27は3カード・3問の後に結論、電話開始、連絡1回の順でS28へ進む', () => {
  for (const wrong of [false,true]) {
    const run = playEpisode(api,{wrong})
    const states = run.states.filter(state => scenario.nodes[state.nodeId].historyScope === 'S27')
    for (let index=0;index<3;index++) assert.ok(states.some(state=>state.nodeId===`S27-card-${index}`))
    const lastAnswer = states.findIndex(state=>state.nodeId==='S27-question3-answer')
    const after = states.slice(lastAnswer+1)
    assert.deepEqual(after.map(state=>scenario.nodes[state.nodeId].text),source.body.slice(3).map(line=>line.text))
    assert.equal(states.filter(state=>scenario.nodes[state.nodeId].text==='（奥村に電話）').length,1)
    const phone = states.findIndex(state=>scenario.nodes[state.nodeId].text==='（奥村に電話）')
    assert.ok(!states.slice(0,phone).some(state=>scenario.nodes[state.nodeId].speakerId==='okumura'))
    for (const line of source.actions.find(action=>action.id==='全正答後').lines) assert.ok(!states.some(state=>scenario.nodes[state.nodeId].text===line.text))
    assert.equal(run.states[run.states.indexOf(states.at(-1))+1].nodeId,'S28-intro')
    assert.equal(run.states[run.states.indexOf(states.at(-1))+1].flags.F_FINAL_HANDOFF,true)
  }
})

test('S27旧終了6ノードのv2保存は情報を失わず、重複連絡なくS28へ復帰する', () => {
  const run=playEpisode(api), before=run.states.find(state=>state.nodeId==='S27-question3-answer')
  for(const nodeId of ['S27-finish',...Array.from({length:5},(_,index)=>`S27-finish-${index+1}`)]) {
    const state={...before,nodeId}
    const restored=api.restoreSaveData(api.createSaveData(state),api.scenarioCatalog)
    assert.deepEqual(restored,{ok:true,state})
    let current=restored.state; const seen=[]
    while(current.nodeId!=='S28-intro') {
      assert.ok(seen.length<6,nodeId)
      seen.push(scenario.nodes[current.nodeId].text)
      current=api.reduceGameState(scenario,current,{type:'advance'})
    }
    assert.equal(new Set(seen).size,seen.length,nodeId)
    assert.equal(current.flags.F_FINAL_HANDOFF,true,nodeId)
    assert.deepEqual(current.acquiredInformation.filter(id=>id!=='F_FINAL_HANDOFF'),before.acquiredInformation)
  }
})
