import test from 'node:test'
import assert from 'node:assert/strict'
import { loadEpisode,playEpisode } from './e01EpisodeHarness.mjs'
const api=await loadEpisode(),{scenario}=api
const source=api.source.find(scene=>scene.id==='S26')
const note='（S25の再聴取内容は警察内部の情報であり、佐伯と澪は知らない）'

test('監査注記は原文に保持し、実行文字列から制作・プレイヤー向け操作注記を除く',()=>{
  assert.equal(source.body[0].text,note)
  const runtime=JSON.stringify({nodes:scenario.nodes,records:scenario.records,title:scenario.title})
  assert.ok(!runtime.includes(note))
  assert.doesNotMatch(runtime,/（S\d{2}の[^）]*(?:警察内部|知らない)|（プレイヤーの整理：|※(?:制作|演出|実装)|(?:制作|監査)用注記/)
  // Normal scene directions are narrative, rather than notes to be removed wholesale.
  assert.ok(runtime.includes('（場面は奥村と瀬川の捜査に切り替わる。佐伯は同席しない）'))
})

test('旧保存履歴の制作注記は表示から除外し、元の履歴配列は変更しない',()=>{
  const entries=[{nodeId:'S26-intro',speaker:'',text:note},{nodeId:'S26-intro-1',speaker:'澪',text:source.body[1].text}]
  const snapshot=JSON.stringify(entries)
  assert.deepEqual(api.selectVisibleHistory(scenario,'S26-intro',entries),[entries[1]])
  assert.equal(JSON.stringify(entries),snapshot)
})

test('S26は澪の本文から開始し、本文を重複なく表示して必須操作後にS27へ進む',()=>{
  const run=playEpisode(api),states=run.states.filter(state=>scenario.nodes[state.nodeId].historyScope==='S26')
  const intro=states.filter(state=>state.nodeId.startsWith('S26-intro'))
  assert.equal(intro[0].nodeId,'S26-intro')
  assert.equal(scenario.nodes[intro[0].nodeId].speakerId,'mio')
  assert.deepEqual(intro.map(state=>scenario.nodes[state.nodeId].text),source.body.slice(1).map(line=>line.text))
  assert.ok(!intro.some(state=>state.nodeId==='S26-intro-1'))
  const menu=scenario.nodes['S26-menu'],ready=states.filter(state=>state.nodeId==='S26-menu').at(-1)
  const exit=api.visibleChoices(menu,ready).find(option=>option.next==='S26-finish')
  assert.ok(exit)
  for(const missing of exit.condition.ids){
    const incomplete={...ready,acquiredInformation:ready.acquiredInformation.filter(id=>id!==missing)}
    assert.ok(!api.visibleChoices(menu,incomplete).some(option=>option.id===exit.id))
  }
  assert.equal(run.states[run.states.indexOf(states.at(-1))+1].nodeId,'S27-intro')
})

test('旧S26冒頭のv2保存は本文から再開し、情報境界と保存項目を保持する',()=>{
  const run=playEpisode(api),before=run.states.find(state=>state.nodeId==='S26-intro')
  for(const nodeId of ['S26-intro','S26-intro-1']){
    const original={...before,nodeId}
    const restored=api.restoreSaveData(api.createSaveData(original),api.scenarioCatalog)
    assert.deepEqual(restored,{ok:true,state:original})
    const current=api.selectCurrentNode(scenario,restored.state)
    assert.deepEqual({text:current.text,speakerId:current.speakerId},source.body[1])
    const after=api.reduceGameState(scenario,restored.state,{type:'advance'})
    assert.equal(after.nodeId,'S26-intro-2')
    for(const key of ['flags','acquiredInformation','heardTopics','inspectedTargets'])assert.deepEqual(after[key],before[key])
    assert.equal(playEpisode(api,{state:restored.state}).state.nodeId,'episode-complete')
  }
})
