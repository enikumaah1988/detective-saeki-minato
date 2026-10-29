import test from 'node:test'
import assert from 'node:assert/strict'
import { loadEpisode } from './e01EpisodeHarness.mjs'

const api = await loadEpisode()
const { scenario, reduceGameState, visibleChoices, createInitialState } = api
const advanceTo = (state, target) => {
  for (let count = 0; state.nodeId !== target; count++) {
    assert.ok(count < 30, state.nodeId)
    assert.equal(scenario.nodes[state.nodeId].type, 'dialogue', state.nodeId)
    state = reduceGameState(scenario, state, { type: 'advance' })
  }
  return state
}
const choose = (state, choiceId) => reduceGameState(scenario, state, { type: 'choose', choiceId })

test('導入・作品扉・来訪前の日常操作を経て、新稿のコーヒーとノックへ接続する', () => {
  let state = createInitialState(scenario)
  assert.equal(state.nodeId, 'S01-opening-prologue-1')
  for (let number = 1; number <= 4; number++) {
    assert.equal(state.nodeId, `S01-opening-prologue-${number}`)
    assert.deepEqual(api.selectCurrentNode(scenario, state).stage.characters, [])
    assert.equal(scenario.nodes[state.nodeId].hideConversationToolbar, true)
    state = reduceGameState(scenario, state, { type: 'advance' })
  }
  assert.equal(state.nodeId, 'S01-opening-cover')
  assert.equal(scenario.nodes[state.nodeId].illustration.subtitle, 'Episode 01　消された記録 — 第1部　消えた男')
  state = advanceTo(state, 'S01-opening-menu')
  assert.deepEqual(visibleChoices(scenario.nodes[state.nodeId], state).map(choice => choice.label), ['話す', '調べる'])
  assert.deepEqual(api.selectCurrentNode(scenario, state).stage.characters.map(person => [person.characterId, person.position]), [['minato', 'left'], ['mio', 'right']])
  assert.deepEqual(state.acquiredInformation, [])
  state = choose(state, 'speak')
  assert.equal(scenario.nodes[state.nodeId].selection, 'person')
  state = choose(state, 'mio')
  assert.deepEqual(visibleChoices(scenario.nodes[state.nodeId], state).map(choice => choice.label), ['今日の予定', 'コーヒー', '戻る'])
  state = choose(state, 'S01-opening-schedule')
  state = advanceTo(state, 'S01-opening-topics')
  assert.ok(state.heardTopics.includes('S01-opening-schedule'))
  state = choose(choose(state, 'return'), 'return')
  assert.equal(state.nodeId, 'S01-opening-menu')
  state = choose(state, 'look')
  state = choose(state, 'S01-opening-window')
  state = advanceTo(state, 'S01-opening-targets')
  assert.ok(state.inspectedTargets.includes('S01-opening-window'))
  state = choose(state, 'return')
  assert.deepEqual(state.acquiredInformation, [])
  state = choose(choose(choose(state, 'speak'), 'mio'), 'S01-opening-coffee')
  assert.equal(state.nodeId, 'S01-intro')
  state = advanceTo(state, 'S01-intro-7')
  assert.equal(scenario.nodes[state.nodeId].text, '（ノック）')
  assert.notEqual(state.flags.akari_present, true)
  state = reduceGameState(scenario, state, { type: 'advance' })
  assert.equal(state.nodeId, 'S01-intro-8')
  assert.equal(state.flags.akari_present, true)
})

test('日常の任意操作を省略でき、戻る・全導入ノードのv2復帰で進捗を変えない', () => {
  let state = createInitialState(scenario)
  for (let count = 0; state.nodeId !== 'S01-opening-menu'; count++) {
    assert.ok(count < 12, state.nodeId)
    assert.equal(scenario.nodes[state.nodeId].type, 'dialogue')
    assert.deepEqual(api.restoreSaveData(api.createSaveData(state), api.scenarioCatalog), { ok: true, state })
    state = reduceGameState(scenario, state, { type: 'advance' })
  }
  const menu = state
  state = choose(state, 'speak')
  state = choose(state, 'return')
  assert.deepEqual(state, menu)
  state = choose(state, 'look')
  state = choose(state, 'return')
  assert.deepEqual(state, menu)
  assert.equal(choose(choose(choose(state, 'speak'), 'mio'), 'S01-opening-coffee').nodeId, 'S01-intro')
  for (const [id, node] of Object.entries(api.firstPart.nodes).filter(([id]) => id.startsWith('S01-'))) {
    assert.deepEqual(scenario.nodes[id], node, `既存S01ノードを変更しない: ${id}`)
    const saved = { ...api.createInitialState(api.firstPart), scenarioId: scenario.id, nodeId: id }
    assert.deepEqual(api.restoreSaveData(api.createSaveData(saved), api.scenarioCatalog), { ok: true, state: saved })
  }
  assert.equal(api.firstPart.start, 'S01-intro')
})
