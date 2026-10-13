import test, { before } from 'node:test'
import { createServer } from './viteServer.mjs'
import assert from 'node:assert/strict'
import { freeActionDemo as scenario } from '../src/data/scenario/freeActionDemo.ts'
let createPlayback, reducePlayback, createInitialState, reduceGameState
before(async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    ({ createPlayback, reducePlayback } = await server.ssrLoadModule('/src/features/story/playback.ts'));
    ({ createInitialState, reduceGameState } = await server.ssrLoadModule('/src/features/story/state.ts'))
  } finally { await server.close() }
})
import { choiceStatus, emptyContinuation, menuTitle, visibleChoices } from '../src/features/story/freeAction.ts'
import { selectSceneStage, stageCharacters } from '../src/features/story/scene.ts'
import { createSaveData, restoreSaveData } from '../src/features/story/saveData.ts'
const at = nodeId => ({ ...createPlayback(scenario), game: { ...createInitialState(scenario), nodeId } })
const input = (current, action) => ({ type: 'input', origin: { nodeId: current.game.nodeId, generation: current.generation }, action })

test('0件時は明示された会話へ復帰し、候補がある間は続行を拒否する', () => {
  const fixture = { ...scenario, nodes: { ...scenario.nodes, menu: { ...scenario.nodes.menu, options: [{ id: 'move', label: '移動', next: 'photo' }] } } }
  const state = { ...createInitialState(fixture), nodeId: 'menu' }
  assert.deepEqual(visibleChoices(fixture.nodes.menu, state), [])
  assert.deepEqual(emptyContinuation(fixture.nodes.menu, state), { label: '会話に戻る', next: 'begin-inquiry' })
  const next = reduceGameState(fixture, state, { type: 'continue' })
  assert.equal(next.nodeId, 'begin-inquiry')
  assert.deepEqual(next.acquiredInformation, [])
  assert.strictEqual(reduceGameState(scenario, state, { type: 'continue' }), state)
  const bad = { ...fixture, nodes: { ...fixture.nodes, menu: { ...fixture.nodes.menu, empty: undefined } } }
  assert.throws(() => createInitialState(bad), /0件時/)
})

test('親タイトル・復帰先と実行済みIDをシステムで解決し、戻るは更新を無視する', () => {
  const state = at('topics').game
  const node = { ...scenario.nodes.topics, options: [
    { id: 'question-1', progressId: 'brother', label: '新しい表示名', next: 'brother' },
    { id: 'return', label: '改変', next: 'photo', updates: [{ type: 'setFlag', id: 'bad', value: true }, { type: 'addInformation', id: 'bad' }] },
  ] }
  const fixture = { ...scenario, nodes: { ...scenario.nodes, topics: node } }
  assert.equal(menuTitle(node), '聞く')
  assert.equal(choiceStatus(node, node.options[0], { ...state, heardTopics: ['brother'] }), '既読')
  assert.deepEqual(visibleChoices(node, state).at(-1), { id: 'return', label: '戻る', next: 'menu' })
  const next = reduceGameState(fixture, state, { type: 'choose', choiceId: 'return' })
  assert.deepEqual(next, { ...state, nodeId: 'menu' })
  const dialogue = reduceGameState(fixture, state, { type: 'choose', choiceId: 'question-1' })
  assert.equal(dialogue.nodeId, 'brother')
  assert.equal(reduceGameState(fixture, dialogue, { type: 'advance' }).nodeId, 'menu')
})

test('遅延中の条件変更・遷移済みの入力・同じノードへ再訪した古い世代を拒否する', () => {
  const fixture = { ...scenario, nodes: { ...scenario.nodes, menu: { ...scenario.nodes.menu, options: [{ id: 'talk', label: '聞く', next: 'topics', condition: { type: 'flag', id: 'ready' } }] } } }
  const shown = at('menu'); shown.game.flags.ready = true
  const event = input(shown, { type: 'choose', choiceId: 'talk' })
  const changed = { ...shown, game: { ...shown.game, flags: {} } }
  assert.strictEqual(reducePlayback(fixture, changed, event), changed)
  const next = reducePlayback(scenario, shown, event)
  assert.equal(next.game.nodeId, 'topics')
  assert.strictEqual(reducePlayback(scenario, next, event), next)
  const returned = reducePlayback(scenario, next, input(next, { type: 'choose', choiceId: 'return' }))
  assert.equal(returned.game.nodeId, 'menu')
  assert.strictEqual(reducePlayback(scenario, returned, event), returned)
})

test('聞く話題の選択演出中に条件を失ったら、結果会話・進捗更新を実行しない', () => {
  const topicNode = {
    ...scenario.nodes.topics,
    options: [{ id: 'delayed-topic', progressId: 'brother', label: '兄について', next: 'brother',
      condition: { type: 'flag', id: 'topic-ready' },
      updates: [{ type: 'setFlag', id: 'must-not-run', value: true }, { type: 'addInformation', id: 'must-not-run' }] }],
  }
  const fixture = { ...scenario, nodes: { ...scenario.nodes, topics: topicNode } }
  const shown = at('topics')
  shown.game.flags['topic-ready'] = true
  assert.deepEqual(visibleChoices(topicNode, shown.game).map(option => option.id), ['delayed-topic', 'return'])
  const delayedInput = input(shown, { type: 'choose', choiceId: 'delayed-topic' })

  // 150msの選択演出が終わる前に同じノードの可否条件だけが変化した状態を再現する。
  const changed = { ...shown, game: { ...shown.game, flags: {} } }
  const rejected = reducePlayback(fixture, changed, delayedInput)
  assert.strictEqual(rejected, changed)
  assert.equal(rejected.game.nodeId, 'topics')
  assert.deepEqual(rejected.game.flags, {})
  assert.deepEqual(rejected.game.heardTopics, [])
  assert.deepEqual(rejected.game.acquiredInformation, [])
})

test('考えるの選択演出中に必須情報を失ったら選択を拒否する', () => {
  const ready = at('menu')
  ready.game.acquiredInformation = scenario.nodes.think.requiredInformation.map(info => info.id)
  assert.ok(visibleChoices(scenario.nodes.menu, ready.game).some(option => option.id === 'think'))
  const delayedInput = input(ready, { type: 'choose', choiceId: 'think' })
  const changed = { ...ready, game: { ...ready.game, acquiredInformation: ready.game.acquiredInformation.slice(1) } }

  const rejected = reducePlayback(scenario, changed, delayedInput)
  assert.strictEqual(rejected, changed)
  assert.equal(rejected.game.nodeId, 'menu')
  assert.equal(visibleChoices(scenario.nodes.menu, rejected.game).some(option => option.id === 'think'), false)
})

test('最終会話の重複入力は1回のみ処理し、MENU中・MENU前の世代も拒否する', () => {
  const current = at('photo'), event = input(current, { type: 'advance' })
  const next = reducePlayback(scenario, current, event)
  assert.equal(next.game.flags.photo_examined, true)
  assert.deepEqual(next.game.inspectedTargets, ['photo'])
  assert.strictEqual(reducePlayback(scenario, next, event), next)
  const paused = reducePlayback(scenario, current, { type: 'menu', open: true })
  assert.strictEqual(reducePlayback(scenario, paused, input(paused, { type: 'advance' })), paused)
  const resumed = reducePlayback(scenario, paused, { type: 'menu', open: false })
  assert.strictEqual(reducePlayback(scenario, resumed, event), resumed)
  assert.equal(resumed.game.nodeId, 'photo')
})

test('シーンは話者・会話/思考/自由行動から独立し、明示的な人物配置を保持する', () => {
  const expected = stageCharacters(selectSceneStage(scenario, 'visitor'))
  assert.deepEqual(expected.map(c => [c.characterId, c.position]), [['minato', 'left'], ['mio', 'right']])
  for (const id of ['welcome', 'menu', 'topics', 'targets', 'photo', 'think', 'accept-request']) {
    assert.deepEqual(stageCharacters(selectSceneStage(scenario, id)), expected)
  }
  assert.equal(stageCharacters(selectSceneStage(scenario, 'office-daily'))[0].position, 'left')
  for (const position of ['left', 'right']) assert.equal(stageCharacters({ backgroundId: 'x', characters: [{ characterId: 'minato', expression: 'normal', position }] })[0].position, position)
  for (const position of ['center', 'right']) assert.equal(stageCharacters({ backgroundId: 'x', characters: [{ characterId: 'mio', expression: 'normal', position }] })[0].position, position)
})

test('version2でサブメニューを復元し、進捗・人物・候補・入力世代を整合させる', () => {
  const current = at('topics')
  current.game.heardTopics = ['brother']; current.game.acquiredInformation = ['brother_profile']
  const saved = JSON.parse(JSON.stringify(createSaveData(current.game)))
  assert.equal(saved.version, 2)
  const loaded = restoreSaveData(saved, [scenario])
  assert.equal(loaded.ok, true)
  const restored = reducePlayback(scenario, at('photo'), { type: 'restore', state: loaded.state })
  assert.deepEqual(restored.game, current.game)
  assert.equal(restored.generation, 1)
  assert.deepEqual(stageCharacters(selectSceneStage(scenario, restored.game.nodeId)), stageCharacters(selectSceneStage(scenario, 'topics')))
  assert.deepEqual(visibleChoices(scenario.nodes.topics, restored.game).map(item => item.id), ['brother', 'missing', 'recent-brother', 'return'])
  assert.strictEqual(reducePlayback(scenario, restored, input(at('topics'), { type: 'choose', choiceId: 'brother' })), restored)
})
