import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { freeActionDemo as scenario } from '../src/data/scenario/freeActionDemo.ts'
import { matchesCondition, visibleChoices, applyUpdates } from '../src/features/story/freeAction.ts'
import { createSaveData, restoreSaveData } from '../src/features/story/saveData.ts'
let createInitialState, reduceGameState, saveGame, loadGame
before(async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const state = await server.ssrLoadModule('/src/features/story/state.ts')
    createInitialState = state.createInitialState
    reduceGameState = state.reduceGameState
    const storage = await server.ssrLoadModule('/src/features/story/storage.ts')
    saveGame = storage.saveGame
    loadGame = storage.loadGame
  } finally { await server.close() }
})
function menuState() {
  let state = createInitialState(scenario)
  // UI と同じ「次へ」で導入を読み終える。
  for (let i = 0; state.nodeId !== 'menu' && i < 10; i++) state = reduceGameState(scenario, state, { type: 'advance' })
  assert.equal(state.nodeId, 'menu')
  return state
}
const choose = (state, choiceId) => reduceGameState(scenario, state, { type: 'choose', choiceId })
const advance = (state) => reduceGameState(scenario, state, { type: 'advance' })

test('兄の話を聞き情報取得後メニューに戻り、最近の兄が解放される', () => {
  const initial = menuState()
  const topics = choose(initial, 'talk')
  assert.deepEqual(visibleChoices(scenario.nodes.topics, topics).map((x) => x.id), ['brother', 'missing', 'return'])
  assert.strictEqual(choose(topics, 'recent-brother'), topics)
  const dialogue = choose(topics, 'brother')
  assert.deepEqual(dialogue.heardTopics, [])
  const returned = advance(dialogue)
  assert.equal(returned.nodeId, 'menu')
  assert.deepEqual(returned.heardTopics, ['brother'])
  assert.deepEqual(returned.acquiredInformation, ['brother_profile'])
  assert.ok(visibleChoices(scenario.nodes.topics, returned).some((x) => x.id === 'recent-brother'))
  const repeated = advance(choose(choose(returned, 'talk'), 'brother'))
  assert.deepEqual(repeated.heardTopics, ['brother'])
  assert.deepEqual(initial.heardTopics, [])
})

test('写真を調べると対象・情報・フラグを更新しメニューに戻る', () => {
  const current = advance(choose(choose(menuState(), 'look'), 'photo'))
  assert.equal(current.nodeId, 'menu')
  assert.deepEqual(current.inspectedTargets, ['photo'])
  assert.deepEqual(current.acquiredInformation, ['photo_date'])
  assert.equal(current.flags.photo_examined, true)
  const reset = reduceGameState(scenario, current, { type: 'reset' })
  assert.deepEqual(reset.inspectedTargets, [])
  assert.deepEqual(reset.flags, {})
})

test('全条件種別と重複しない更新、戻る操作を扱える', () => {
  const initial = menuState()
  const updates = [
    { type: 'setFlag', id: 'ready', value: true }, { type: 'addHeardTopic', id: 'brother' },
    { type: 'addInspectedTarget', id: 'photo' }, { type: 'addInformation', id: 'a' },
    { type: 'addInformation', id: 'b' },
  ]
  const state = applyUpdates(initial, updates)
  assert.deepEqual(applyUpdates(state, updates), state)
  for (const condition of [
    { type: 'flag', id: 'ready' }, { type: 'heardTopic', id: 'brother' },
    { type: 'inspectedTarget', id: 'photo' }, { type: 'hasInformation', id: 'a' },
    { type: 'hasAllInformation', ids: ['a', 'b'] },
  ]) { assert.equal(matchesCondition(state, condition), true); assert.equal(matchesCondition(initial, condition), false) }
  assert.equal(matchesCondition(state, { type: 'hasAllInformation', ids: ['a', 'missing'] }), false)
  assert.equal(matchesCondition(initial, { type: 'flag', id: 'ready', value: false }), true)
  assert.equal(choose(choose(initial, 'look'), 'return').nodeId, 'menu')
})

test('自由行動の追加状態を LocalStorage 保存・復元後も保持する', () => {
  let state = advance(choose(choose(menuState(), 'talk'), 'brother'))
  state = advance(choose(choose(state, 'look'), 'photo'))
  const data = new Map()
  const storage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) }
  assert.equal(saveGame(state, storage).ok, true)
  const result = loadGame([scenario], storage)
  assert.deepEqual(result, { ok: true, state })
  assert.deepEqual(reduceGameState(scenario, menuState(), { type: 'restore', state: result.state }), state)
  assert.ok(visibleChoices(scenario.nodes.topics, result.state).some((x) => x.id === 'recent-brother'))
})

test('version 1 を空の追加状態で移行し、不正 version 2 を拒否する', () => {
  const initial = menuState()
  assert.deepEqual(restoreSaveData({ version: 1, scenarioId: scenario.id, nodeId: 'menu' }, [scenario]), { ok: true, state: initial })
  const valid = createSaveData(initial)
  assert.equal(valid.version, 2)
  for (const invalid of [
    { ...valid, flags: [] }, { ...valid, flags: { bad: 'true' } },
    { ...valid, heardTopics: [1] }, { ...valid, inspectedTargets: null },
    { ...valid, acquiredInformation: [''] }, { version: 2, scenarioId: scenario.id, nodeId: 'menu' },
  ]) assert.deepEqual(restoreSaveData(invalid, [scenario]), { ok: false, reason: 'invalid-format' })
  const duplicate = { ...valid, heardTopics: ['brother', 'brother'] }
  assert.deepEqual(restoreSaveData(duplicate, [scenario]).state.heardTopics, ['brother'])
})

test('考えるは情報なしで材料不足を表示し、メニューへ戻る', async () => {
  const { resolveThinking } = await import('../src/features/story/thinking.ts')
  const state = choose(menuState(), 'think')
  assert.equal(state.nodeId, 'think')
  const node = resolveThinking(scenario.nodes.think, state)
  assert.equal(node.speakerId, 'minato')
  assert.match(node.text, /まだ材料が足りない/)
  assert.equal(advance(state).nodeId, 'menu')
})

test('一部取得は確認済みと不足情報を整理し、無関係・重複情報でも受諾へ進まない', async () => {
  const { resolveThinking } = await import('../src/features/story/thinking.ts')
  const initial = menuState()
  const required = scenario.nodes.think.requiredInformation.map((info) => info.id)
  // 必須情報のすべての組合せで、欠けている場合の遷移を確認する。
  for (let mask = 1; mask < 15; mask++) {
    const state = { ...initial, nodeId: 'think', acquiredInformation: required.filter((_, i) => mask & (1 << i)) }
    const node = resolveThinking(scenario.nodes.think, state)
    assert.match(node.text, /分かっていること/)
    assert.match(node.text, /不足していること/)
    assert.equal(advance(state).nodeId, 'menu')
  }
  const partial = { ...initial, nodeId: 'think', acquiredInformation: ['brother_profile'] }
  const text = resolveThinking(scenario.nodes.think, partial).text
  assert.match(text, /分かっていること：兄は連絡を絶やさない/)
  assert.match(text, /不足していること：連絡が途絶えた時期/)
  const unrelated = { ...initial, nodeId: 'think', acquiredInformation: ['photo_date', 'photo_date', 'a', 'b', 'c'] }
  assert.equal(advance(unrelated).nodeId, 'menu')
})

test('聞くループで全必須情報を取得し、思考イベントから依頼受諾へ進める', async () => {
  const { resolveThinking } = await import('../src/features/story/thinking.ts')
  let state = menuState()
  for (const topic of ['brother', 'missing', 'recent-brother', 'accident']) {
    state = advance(choose(choose(state, 'talk'), topic))
    assert.equal(state.nodeId, 'menu')
  }
  state = choose(state, 'think')
  assert.match(resolveThinking(scenario.nodes.think, state).text, /単なる失踪ではない/)
  const saved = restoreSaveData(JSON.parse(JSON.stringify(createSaveData(state))), [scenario])
  assert.equal(saved.ok, true)
  assert.equal(advance(saved.state).nodeId, 'accept-request')
  const accepted = advance(advance(state))
  assert.equal(accepted.nodeId, 'accepted')
  assert.equal(accepted.flags.request_accepted, true)
})

test('思考は進捗を変更せず、全情報に余分な情報があっても受諾できる', () => {
  const initial = menuState()
  const state = { ...initial, nodeId: 'think', acquiredInformation: [
    ...scenario.nodes.think.requiredInformation.map((info) => info.id), 'photo_date',
  ] }
  const next = advance(state)
  assert.equal(next.nodeId, 'accept-request')
  assert.deepEqual(next.acquiredInformation, state.acquiredInformation)
  assert.deepEqual(next.flags, {})
  for (const node of Object.values(scenario.nodes)) {
    if (node.type === 'think') {
      for (const reaction of [node.insufficient, node.partial, node.complete]) assert.ok(scenario.nodes[reaction.next])
    } else if ('next' in node) assert.ok(scenario.nodes[node.next])
    else if ('options' in node) for (const option of node.options) assert.ok(scenario.nodes[option.next])
  }
})

test('新規開始から導入を読み、情報を集めて第1部完了・第2部の仮ノードまで通せる', () => {
  let state = createInitialState(scenario)
  assert.equal(state.nodeId, 'office-daily')
  assert.deepEqual(state.acquiredInformation, [])
  const intro = ['office-daily', 'visitor', 'welcome', 'request-intro', 'begin-inquiry']
  for (const nodeId of intro) {
    assert.equal(state.nodeId, nodeId)
    state = advance(state)
  }
  assert.equal(state.nodeId, 'menu')
  state = advance(choose(state, 'think'))
  assert.equal(state.nodeId, 'menu')
  // 任意の調査も混ぜて進行を確認する。
  state = advance(choose(choose(state, 'look'), 'client'))
  state = advance(choose(choose(state, 'look'), 'photo'))
  for (const topic of ['brother', 'missing', 'recent-brother', 'accident']) {
    state = advance(choose(choose(state, 'talk'), topic))
    const thought = choose(state, 'think')
    const next = advance(thought)
    assert.equal(next.nodeId, topic === 'accident' ? 'accept-request' : 'menu')
    if (topic === 'accident') state = next
  }
  state = advance(state)
  assert.equal(state.nodeId, 'accepted')
  assert.equal(state.flags.request_accepted, true)
  assert.match(scenario.nodes.accepted.text, /第1部「依頼」完了/)
  state = advance(state)
  assert.equal(state.nodeId, 'part2-placeholder')
  assert.equal(state.flags.part1_completed, true)
  assert.equal(scenario.nodes[state.nodeId].type, 'end')
})

test('途中セーブをロードし、取得済み情報を維持して最後まで継続できる', () => {
  const data = new Map()
  const storage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) }
  let state = menuState()
  state = advance(choose(choose(state, 'talk'), 'brother'))
  state = choose(choose(state, 'talk'), 'missing')
  assert.equal(saveGame(state, storage).ok, true)
  const loaded = loadGame([scenario], storage)
  assert.equal(loaded.ok, true)
  state = reduceGameState(scenario, createInitialState(scenario), { type: 'restore', state: loaded.state })
  assert.equal(state.nodeId, 'missing')
  assert.deepEqual(state.acquiredInformation, ['brother_profile'])
  state = advance(state)
  for (const topic of ['recent-brother', 'accident']) state = advance(choose(choose(state, 'talk'), topic))
  state = advance(choose(state, 'think'))
  state = advance(advance(state))
  assert.equal(state.nodeId, 'part2-placeholder')
  assert.equal(state.flags.part1_completed, true)
  assert.equal(createSaveData(state).version, 2)
})
