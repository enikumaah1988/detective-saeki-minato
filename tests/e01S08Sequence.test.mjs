import test from 'node:test'
import assert from 'node:assert/strict'
import { loadEpisode, playEpisode } from './e01EpisodeHarness.mjs'
const api=await loadEpisode(),{scenario}=api
const source=api.source.find(scene=>scene.id==='S08')
const ids=['S08-discovery','S08-discovery-1','S08-finish-1','S08-finish','S08-finish-2','S08-finish-3']
const expected=[...source.actions.find(action=>action.id==='発見演出').lines,source.body[7],...source.actions.find(action=>action.id==='移動').lines,...source.body.slice(8)]

test('S08は安全確認依頼→経路確保→案内→入口発見→物音、S09の扉前へ進む',()=>{
  const run=playEpisode(api),start=run.states.findIndex(state=>state.nodeId==='S08-discovery')
  const states=run.states.slice(start,start+ids.length)
  assert.deepEqual(states.map(state=>state.nodeId),ids)
  assert.deepEqual(states.map(state=>scenario.nodes[state.nodeId].text),expected.map(line=>line.text))
  assert.equal(run.states[start+ids.length].nodeId,'S09-intro')
  assert.equal(run.states[start+ids.length].flags.F_NAOTO_RESCUED,undefined)
  for(const [index,state] of states.entries()){
    const node=api.selectCurrentNode(scenario,state)
    assert.equal(node.stage.backgroundId,index<4?'building-room':'building-storage-door')
    assert.match(api.selectDateLabel(scenario,state),/10月8日.*朝/)
    assert.equal(node.historyScope,'S08')
    assert.equal(node.savePhaseId,'S08')
  }
  assert.equal(api.selectCurrentNode(scenario,run.states[start+ids.length]).stage.backgroundId,'building-storage-door')
})

test('詳細図の必須条件・戻る・再選択・既存ノードのv2復元を保持する',()=>{
  const run=playEpisode(api),ready=run.states.find(state=>state.nodeId==='S08-route')
  const missing={...ready,nodeId:'S08-menu',acquiredInformation:ready.acquiredInformation.filter(id=>id!=='F_ROUTE_BEND')}
  assert.ok(!api.visibleChoices(scenario.nodes['S08-menu'],missing).some(option=>option.next==='S08-route'))
  const back=api.reduceGameState(scenario,ready,{type:'choose',choiceId:'return'})
  assert.equal(back.nodeId,'S08-menu')
  assert.equal(back.flags.F_ROUTE_SELECTED,undefined)
  const route=api.visibleChoices(scenario.nodes[back.nodeId],back).find(option=>option.next==='S08-route')
  const again=api.reduceGameState(scenario,back,{type:'choose',choiceId:route.id})
  assert.equal(again.nodeId,'S08-route')
  assert.match(api.selectDateLabel(scenario,again),/10月8日.*朝/)
  for(const nodeId of ['S08-route',...ids,'S09-intro']){
    const original=run.states.find(state=>state.nodeId===nodeId)
    const restored=api.restoreSaveData(api.createSaveData(original),api.scenarioCatalog)
    assert.deepEqual(restored,{ok:true,state:original})
    assert.equal(playEpisode(api,{state:restored.state}).state.nodeId,'episode-complete')
  }
})
