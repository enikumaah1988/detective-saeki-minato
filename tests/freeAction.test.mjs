import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { freeActionDemo as scenario } from '../src/data/scenario/freeActionDemo.ts'
import { matchesCondition, visibleChoices, choiceStatus, applyUpdates } from '../src/features/story/freeAction.ts'
import { createSaveData, restoreSaveData } from '../src/features/story/saveData.ts'
let createInitialState, reduceGameState, selectCurrentNode, saveGame, loadGame
before(async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const state = await server.ssrLoadModule('/src/features/story/state.ts')
    createInitialState = state.createInitialState
    reduceGameState = state.reduceGameState
    selectCurrentNode = state.selectCurrentNode
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

test('必須情報が揃うまで考えるを表示・実行できず、旧thinkノードの反応は維持する', async () => {
  const { resolveThinking } = await import('../src/features/story/thinking.ts')
  const initial = menuState()
  const required = scenario.nodes.think.requiredInformation.map(info => info.id)
  const thinkOption = scenario.nodes.menu.options.find(option => option.id === 'think')
  assert.deepEqual(thinkOption.condition, { type: 'hasAllInformation', ids: required })

  for (const ids of [[], required.slice(0, 2), required.slice(0, 3), [...required.slice(0, 3), 'photo_date', 'photo_date']]) {
    const state = { ...initial, acquiredInformation: ids }
    assert.equal(visibleChoices(scenario.nodes.menu, state).some(option => option.id === 'think'), false)
    assert.strictEqual(choose(state, 'think'), state)
  }

  const legacyState = { ...initial, nodeId: 'think' }
  const node = resolveThinking(scenario.nodes.think, legacyState)
  assert.equal(node.speakerId, 'minato')
  assert.match(node.text, /まだ材料が足りない/)
  assert.equal(advance(legacyState).nodeId, 'menu')
  const oldSave = restoreSaveData(createSaveData(legacyState), [scenario])
  assert.equal(oldSave.ok, true)
  assert.equal(oldSave.state.nodeId, 'think')
  assert.match(selectCurrentNode(scenario, oldSave.state).text, /まだ材料が足りない/)
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

test('全必須情報が揃った時だけ考えるが固定順で表示され、SaveData v2復元後も再導出する', () => {
  const initial = menuState()
  const required = scenario.nodes.think.requiredInformation.map(info => info.id)
  const extraAndDuplicate = { ...initial, acquiredInformation: [...required, 'photo_date', 'photo_date'] }
  assert.deepEqual(visibleChoices(scenario.nodes.menu, extraAndDuplicate).map(option => option.id), ['talk', 'look', 'think'])
  assert.equal(createSaveData(extraAndDuplicate).version, 2)
  const restored = restoreSaveData(JSON.parse(JSON.stringify(createSaveData(extraAndDuplicate))), [scenario])
  assert.equal(restored.ok, true)
  assert.deepEqual(visibleChoices(scenario.nodes.menu, restored.state).map(option => option.id), ['talk', 'look', 'think'])
  const missingOne = { ...restored.state, acquiredInformation: required.slice(1) }
  assert.strictEqual(choose(missingOne, 'think'), missingOne)
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
  assert.equal(visibleChoices(scenario.nodes.menu, state).some(option => option.id === 'think'), false)
  assert.strictEqual(choose(state, 'think'), state)
  // 任意の調査も混ぜて進行を確認する。
  state = advance(choose(choose(state, 'look'), 'client'))
  state = advance(choose(choose(state, 'look'), 'photo'))
  for (const topic of ['brother', 'missing', 'recent-brother', 'accident']) {
    state = advance(choose(choose(state, 'talk'), topic))
  }
  assert.ok(visibleChoices(scenario.nodes.menu, state).some(option => option.id === 'think'))
  state = advance(choose(state, 'think'))
  assert.equal(state.nodeId, 'accept-request')
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

test('自由行動は固定順で、未実装・未知・条件未達のコマンドを表示と実行の両方で拒否する', () => {
  const options = [
    { id: 'move', label: '移動', next: 'brother', implemented: true },
    { id: 'think', label: '考える', next: 'think' },
    { id: 'organize', label: '整理する', next: 'brother' },
    { id: 'look', label: '調べる', next: 'targets', condition: { type: 'flag', id: 'inspect-ready' } },
    { id: 'talk', label: '聞く', next: 'topics' },
    { id: 'unknown', label: '不明', next: 'brother' },
  ]
  const fixture = { ...scenario, nodes: { ...scenario.nodes, menu: { ...scenario.nodes.menu, options } } }
  const state = { ...createInitialState(fixture), nodeId: 'menu' }
  assert.deepEqual(visibleChoices(fixture.nodes.menu, state).map(x => x.id), ['talk', 'think'])
  for (const id of ['look', 'organize', 'move', 'unknown']) {
    assert.strictEqual(reduceGameState(fixture, state, { type: 'choose', choiceId: id }), state)
  }
  const ready = { ...state, flags: { 'inspect-ready': true } }
  assert.deepEqual(visibleChoices(fixture.nodes.menu, ready).map(x => x.id), ['talk', 'look', 'think'])
  // 表示時に選べても、実行時の状態では条件を満たさなければ拒否する。
  assert.strictEqual(reduceGameState(fixture, state, { type: 'choose', choiceId: 'look' }), state)
  const unimplemented = { ...fixture, nodes: { ...fixture.nodes, menu: { ...fixture.nodes.menu, options: [{ id: 'talk', label: '聞く', next: 'topics', implemented: false }] } } }
  assert.deepEqual(visibleChoices(unimplemented.nodes.menu, state), [])
  assert.strictEqual(reduceGameState(unimplemented, state, { type: 'choose', choiceId: 'talk' }), state)
})

test('通常の分岐はコマンドIDが同じでも自由行動として扱わず、配列順とラベルを維持する', () => {
  const node = { type: 'choice', stage: scenario.nodes.menu.stage, prompt: '分岐', options: [
    { id: 'think', label: '別の選択', next: 'brother' },
    { id: 'move', label: '移動する分岐', next: 'brother' },
    { id: 'talk', label: '会話を続ける', next: 'brother' },
  ] }
  const fixture = { ...scenario, nodes: { ...scenario.nodes, menu: node, 'free-menu': scenario.nodes.menu, topics: { ...scenario.nodes.topics, parent: { commandId: 'talk', nodeId: 'free-menu' } }, targets: { ...scenario.nodes.targets, parent: { commandId: 'look', nodeId: 'free-menu' } } } }
  const state = { ...createInitialState(fixture), nodeId: 'menu' }
  assert.deepEqual(visibleChoices(node, state).map(x => [x.id, x.label]), node.options.map(x => [x.id, x.label]))
  assert.equal(reduceGameState(fixture, state, { type: 'choose', choiceId: 'move' }).nodeId, 'brother')
})

test('既読話題と調査済み対象は表示を維持し、再選択でも情報を重複しない', () => {
  const state = { ...menuState(), heardTopics: ['brother'], inspectedTargets: ['photo'], acquiredInformation: ['brother_profile', 'photo_date'] }
  for (const [nodeId, choiceId, resultId] of [['topics', 'brother', 'brother'], ['targets', 'photo', 'photo']]) {
    const current = { ...state, nodeId }
    assert.ok(visibleChoices(scenario.nodes[nodeId], current).some(x => x.id === choiceId))
    const selected = choose(current, choiceId)
    assert.equal(selected.nodeId, resultId)
    const returned = advance(selected)
    assert.deepEqual(returned.acquiredInformation, state.acquiredInformation)
    assert.deepEqual(returned.heardTopics, state.heardTopics)
    assert.deepEqual(returned.inspectedTargets, state.inspectedTargets)
  }
})

test('聞く話題はID・表示名・progressIdを分け、既読でも選択可なら再実行、条件未達や未実装なら拒否する', () => {
  const initial = menuState()
  const topicNode = {
    ...scenario.nodes.topics,
    options: [
      { id: 'read-again-id', label: '別の表示名', progressId: 'already-heard', next: 'brother' },
      { id: 'new-topic-id', label: '条件付きの新しい話題', progressId: 'new-progress', next: 'missing', condition: { type: 'heardTopic', id: 'already-heard' } },
      { id: 'locked-but-read', label: '既読だが条件未達', progressId: 'locked-progress', next: 'brother', condition: { type: 'flag', id: 'unlock-locked' } },
      { id: 'unimplemented-but-read', label: '既読だが未実装', progressId: 'unimplemented-progress', next: 'brother', implemented: false },
    ],
  }
  const fixture = { ...scenario, nodes: { ...scenario.nodes, topics: topicNode } }
  const select = (current, choiceId) => reduceGameState(fixture, current, { type: 'choose', choiceId })
  const finish = current => reduceGameState(fixture, current, { type: 'advance' })
  const state = {
    ...initial,
    nodeId: 'topics',
    heardTopics: ['already-heard', 'locked-progress', 'unimplemented-progress'],
  }

  assert.deepEqual(visibleChoices(topicNode, state).map(option => option.id), ['read-again-id', 'new-topic-id', 'return'])
  assert.equal(choiceStatus(topicNode, topicNode.options[0], state), '既読')
  assert.equal(choiceStatus(topicNode, topicNode.options[1], state), 'NEW')
  assert.equal(choiceStatus(topicNode, topicNode.options[2], state), '既読')
  assert.equal(choiceStatus(topicNode, topicNode.options[3], state), '既読')

  const selected = select(state, 'read-again-id')
  assert.equal(selected.nodeId, 'brother')
  const repeated = finish(selected)
  assert.deepEqual(repeated.heardTopics, [...state.heardTopics, 'brother'])
  assert.deepEqual(repeated.acquiredInformation, ['brother_profile'])

  for (const choiceId of ['locked-but-read', 'unimplemented-but-read', 'unknown-topic-id']) {
    assert.strictEqual(select(state, choiceId), state)
  }
})
