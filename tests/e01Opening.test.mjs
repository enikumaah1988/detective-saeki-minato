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
  assert.deepEqual(visibleChoices(scenario.nodes[state.nodeId], state).map(choice => choice.label), ['見る', '話す'])
  assert.deepEqual(api.selectCurrentNode(scenario, state).stage.characters.map(person => [person.characterId, person.position]), [['mio', 'center']])
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
  assert.equal(scenario.nodes[state.nodeId].heading, '見る')
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
    // Conversation restoration changes the main-story menu hierarchy and return
    // destination; manuscript, updates and every saved S01 ID stay intact.
    if (node.type === 'dialogue') {
      const { next: _oldNext, stage: _oldStage, sceneId: _oldScene, ...before } = node
      const { next: _newNext, stage: _newStage, sceneId: _newScene, ...after } = scenario.nodes[id]
      assert.deepEqual(after, before, `既存S01本文・更新を変更しない: ${id}`)
    }
    const saved = { ...api.createInitialState(api.firstPart), scenarioId: scenario.id, nodeId: id }
    assert.deepEqual(api.restoreSaveData(api.createSaveData(saved), api.scenarioCatalog), { ok: true, state: saved })
  }
  assert.equal(api.firstPart.start, 'S01-intro')
})

test('窓は任意の観察で、調査・汎用進行・通常のempty復帰を表示も実行もしない', () => {
  const menu = advanceTo(createInitialState(scenario), 'S01-opening-menu')
  let state = choose(choose(menu, 'look'), 'S01-opening-window')
  state = advanceTo(state, 'S01-opening-targets')
  assert.deepEqual(state.flags, menu.flags)
  assert.deepEqual(state.acquiredInformation, menu.acquiredInformation)
  state = choose(state, 'return')
  for (const current of [menu, state]) {
    assert.deepEqual(visibleChoices(scenario.nodes[current.nodeId], current).map(choice => choice.label), ['見る', '話す'])
    assert.equal(api.emptyContinuation(scenario.nodes[current.nodeId], current), undefined)
    for (const choiceId of ['investigate', 'proceed', 'p1-ledger']) {
      assert.deepEqual(choose(current, choiceId), current)
    }
    assert.deepEqual(reduceGameState(scenario, current, { type: 'continue' }), current)
  }
  // Even an artificial zero-option menu must return to daily life, not bypass coffee.
  const emptyScenario = { ...scenario, nodes: { ...scenario.nodes,
    [menu.nodeId]: { ...scenario.nodes[menu.nodeId], options: [] } } }
  let fallback = reduceGameState(emptyScenario, menu, { type: 'continue' })
  assert.equal(fallback.nodeId, 'S01-opening-daily')
  for (let count = 0; fallback.nodeId !== menu.nodeId; count++) {
    assert.ok(count < 3)
    fallback = reduceGameState(emptyScenario, fallback, { type: 'advance' })
  }
  assert.deepEqual(fallback, menu)
})

test('導入から本編への出口はコーヒー話題だけで、任意行動を省略して来訪へ進める', () => {
  const exits = []
  for (const [id, node] of Object.entries(scenario.nodes).filter(([id]) => id.startsWith('S01-opening-'))) {
    if ('options' in node) for (const choice of node.options) {
      if (!choice.next.startsWith('S01-opening-')) exits.push([id, choice.id, choice.next])
    }
    if (node.type === 'dialogue') assert.ok(node.next.startsWith('S01-opening-'))
    if (node.type === 'choice') assert.ok(node.empty.next.startsWith('S01-opening-'))
  }
  assert.deepEqual(exits, [['S01-opening-topics', 'S01-opening-coffee', 'S01-intro']])
  const menu = advanceTo(createInitialState(scenario), 'S01-opening-menu')
  const coffee = choose(choose(choose(menu, 'speak'), 'mio'), 'S01-opening-coffee')
  assert.deepEqual(coffee.heardTopics, [])
  assert.deepEqual(coffee.inspectedTargets, [])
  const arrived = advanceTo(coffee, 'S01-intro-8')
  assert.equal(arrived.flags.akari_present, true)
})
