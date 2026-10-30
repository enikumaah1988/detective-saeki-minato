import test from 'node:test'
import assert from 'node:assert/strict'
import { loadEpisode, playEpisode } from './e01EpisodeHarness.mjs'
const api = await loadEpisode(), { scenario } = api
const run = playEpisode(api)
const at = id => run.states.find(s => s.nodeId === id)
const choose = (state, choiceId) => api.reduceGameState(scenario, state, { type: 'choose', choiceId })
const options = state => api.visibleChoices(scenario.nodes[state.nodeId], state)
const read = state => {
  for (let i = 0; scenario.nodes[state.nodeId].type === 'dialogue'; i++) {
    assert.ok(i < 80)
    state = api.reduceGameState(scenario, state, { type: 'advance' })
  }
  return state
}
const labels = state => options(state).map(o => o.label)

test('あかりの段階解放は既存情報で判定し、既読の再選択と戻るを維持する', () => {
  let state = choose(choose(at('S01-menu'), 'speak'), 'akari')
  assert.deepEqual(labels(state), ['最後に会ったとき', '戻る'])
  assert.deepEqual(choose(state, 'S01-work'), state)
  state = read(choose(state, 'S01-last-seen'))
  assert.deepEqual(labels(state), ['最後に会ったとき', '直人の仕事', '最近の様子', '戻る'])
  state = read(choose(state, 'S01-recent'))
  assert.deepEqual(labels(state), ['最後に会ったとき', '直人の仕事', '最近の様子', '家族について', '戻る'])
  const family = options(state).find(o => o.id === 'S01-family')
  assert.equal(api.choiceStatus(scenario.nodes[state.nodeId], family, state), 'NEW')
  state = read(choose(state, 'S01-work'))
  assert.deepEqual(labels(state), ['最後に会ったとき', '直人の仕事', '最近の様子', '家族について', '連絡先・交友関係', '戻る'])
  const before = state
  state = read(choose(state, 'S01-last-seen'))
  assert.deepEqual(state, before)
  assert.equal(choose(state, 'return').nodeId, 'S01-topic')
  assert.equal(choose(choose(state, 'return'), 'return').nodeId, 'S01-menu')
})

test('同席中の澪3話題は条件通りに解放し、既読以外の情報・フラグを変えない', () => {
  const menu = at('S01-menu')
  const mio = choose(choose(menu, 'speak'), 'mio')
  assert.deepEqual(labels(mio), ['聞き取りについて', '戻る'])
  assert.deepEqual(choose(mio, 'S01-mio-work'), mio)
  assert.deepEqual(choose(mio, 'S01-mio-next'), mio)
  const work = { ...mio, acquiredInformation: ['F_WORK_SITE'] }
  assert.deepEqual(labels(work), ['聞き取りについて', '勤務先について', '戻る'])
  const ready = { ...work, acquiredInformation: ['F_LAST_SEEN', 'F_WORK_SITE'] }
  assert.deepEqual(labels(ready), ['聞き取りについて', '勤務先について', 'これからのこと', '戻る'])
  for (const option of options(ready).filter(o => o.id !== 'return')) {
    assert.equal(option.required, false)
    const after = read(choose(ready, option.id))
    assert.deepEqual(after.acquiredInformation, ready.acquiredInformation)
    assert.deepEqual(after.flags, ready.flags)
    assert.deepEqual(after.inspectedTargets, ready.inspectedTargets)
    assert.ok(after.heardTopics.includes(option.id))
    assert.deepEqual(read(choose(after, option.id)), after)
  }
  const finished = run.state
  assert.equal(finished.nodeId, 'episode-complete')
  assert.ok(!finished.heardTopics.some(id => id.startsWith('S01-mio-')))
  assert.ok(!finished.acquiredInformation.includes('O_OLD_BUILDING'))
  const accepted = run.states.find(s => s.nodeId === 'S01-menu' && s.acquiredInformation.includes('F_WORK_SITE'))
  assert.ok(options(accepted).some(o => o.id === 'proceed' && o.label === '依頼を受ける'))
})

test('通常会話は中央の相手1人。コーヒー・来訪・退出・S02・S03で湊を移動させない', () => {
  const people = (id, state = at('S01-menu')) => api.selectCurrentNode(scenario, { ...state, nodeId: id }).stage.characters.map(p => [p.characterId, p.position])
  for (const id of ['S01-opening-menu', 'S01-intro', 'S01-intro-6', 'S01-intro-7', 'S01-accept-4', 'S02-menu', 'S01-topic-mio', 'S01-mio-next']) assert.deepEqual(people(id), [['mio', 'center']], id)
  for (const id of ['S01-intro-8', 'S01-menu', 'S01-topic-akari']) assert.deepEqual(people(id), [['akari', 'center']], id)
  for (const id of ['S03-intro', 'S03-menu', 'S03-topic-miyahara']) assert.deepEqual(people(id), [['miyahara', 'center']], id)
})

test('会社へは地図・外観・ロビー・一覧・12階受付・応接室。取消で進捗を変えない', () => {
  const map = at('S02-travel-map')
  assert.ok(map)
  assert.equal(scenario.nodes[map.nodeId].map.current, 'office')
  assert.deepEqual(choose(map, 'return'), { ...map, nodeId: 'S02-menu' })
  let state = choose(choose(map, 'company'), 'enter')
  assert.equal(state.nodeId, 'S02-company-lobby')
  const rooms = choose(state, 'move')
  assert.ok(!labels(rooms).includes('12Fに移動'))
  assert.deepEqual(choose(rooms, 'reception'), rooms)
  state = read(choose(choose(state, 'look'), 'S02-tenant-list'))
  state = choose(choose(state, 'return'), 'move')
  assert.ok(labels(state).includes('12Fに移動'))
  state = choose(state, 'reception')
  assert.equal(state.nodeId, 'S02-company-reception')
  assert.equal(choose(state, 'return').nodeId, 'S02-company-lobby')
  assert.equal(choose(state, 'lounge').nodeId, 'S03-intro')
  assert.deepEqual(state.acquiredInformation, map.acquiredInformation)
  assert.deepEqual(state.flags, map.flags)
  for (const nodeId of ['S02-company-exterior', 'S02-company-map', 'S02-company-lobby', 'S02-lobby-targets', 'S02-lobby-rooms', 'S02-tenant-list', 'S02-company-reception', 'S01-mio-next', 'S01-topic-mio']) {
    const saved = { ...state, nodeId }
    assert.deepEqual(api.restoreSaveData(api.createSaveData(saved), api.scenarioCatalog), { ok: true, state: saved })
    assert.equal(playEpisode(api, { state: saved }).state.nodeId, 'episode-complete')
  }
})

test('共通proceedはデータの意味あるラベルだけを維持し、他コマンドの旧表示契約を変えない', () => {
  const node = { ...scenario.nodes['S01-menu'], implementedCommands: ['proceed', 'look', 'speak'], options: [
    { id: 'proceed', label: '依頼を受ける', next: 'S01-accept-pre' },
    { id: 'look', label: '任意の旧ラベル', next: 'S01-inspect' },
    { id: 'speak', label: '任意の旧会話ラベル', next: 'S01-topic' },
  ] }
  assert.deepEqual(api.visibleChoices(node, at('S01-menu')).map(o => o.label), ['話す', '調べる', '依頼を受ける'])
  assert.equal(api.firstPart.nodes['S01-topic'].selection, undefined)
  assert.equal(api.firstPart.nodes['S03-intro'].stage.characters.length, 2)
})
