import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { demoScenario as scenario } from '../src/data/scenario/demo.ts'

let createInitialState, reduceGameState, selectCurrentNode
before(async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    ({ createInitialState, reduceGameState, selectCurrentNode } = await server.ssrLoadModule('/src/features/story/state.ts'))
  } finally {
    await server.close()
  }
})
const advance = (state) => reduceGameState(scenario, state, { type: 'advance' })
const choose = (state, choiceId) => reduceGameState(scenario, state, { type: 'choose', choiceId })
const initial = () => createInitialState(scenario)
const decision = () => advance(advance(initial()))

test('初期状態は ID のみを持ち、表示情報を現在ノードから導出する', () => {
  const state = initial()
  assert.deepEqual(state, { scenarioId: 'demo-request', nodeId: 'request' })
  const node = selectCurrentNode(scenario, state)
  assert.equal(node.type, 'dialogue')
  assert.equal(node.speakerId, 'minato')
  assert.deepEqual(node.stage, { backgroundId: 'office-afternoon', characterId: 'minato', expression: 'normal' })
})

test('次へで正しい会話・選択肢へ進み、元の状態は変更しない', () => {
  const start = initial()
  const reply = advance(start)
  assert.equal(reply.nodeId, 'reply')
  assert.equal(start.nodeId, 'request')
  assert.equal(selectCurrentNode(scenario, reply).speakerId, 'mio')
  assert.equal(selectCurrentNode(scenario, advance(reply)).type, 'choice')
})

test('各選択肢で異なる分岐・表情へ進み、その後終了する', () => {
  const state = decision()
  for (const id of ['listen', 'coffee']) {
    const branch = choose(state, id)
    assert.equal(branch.nodeId, id)
    assert.equal(selectCurrentNode(scenario, branch).stage.expression, id === 'listen' ? 'serious' : 'normal')
    const end = advance(advance(branch))
    assert.equal(selectCurrentNode(scenario, end).type, 'end')
    assert.strictEqual(advance(end), end)
  }
})

test('無効操作や選択肢の次へは状態を変えない', () => {
  const state = decision()
  assert.strictEqual(advance(state), state)
  assert.strictEqual(choose(state, 'unknown'), state)
  const start = initial()
  assert.strictEqual(choose(start, 'coffee'), start)
})

test('会話・選択肢・終了のどこからでも最初から戻れる', () => {
  for (const state of [advance(initial()), decision(), advance(advance(choose(decision(), 'listen')))]) {
    const reset = reduceGameState(scenario, state, { type: 'reset' })
    assert.deepEqual(reset, initial())
    assert.equal(selectCurrentNode(scenario, reset).stage.expression, 'normal')
  }
})

test('JSON 化した状態から各画面を導出し、同じ進行を再現できる', () => {
  for (const state of [initial(), decision(), choose(decision(), 'listen'), advance(advance(choose(decision(), 'coffee')))]) {
    const restored = JSON.parse(JSON.stringify(state))
    assert.deepEqual(restored, state)
    assert.deepEqual(selectCurrentNode(scenario, restored), selectCurrentNode(scenario, state))
    assert.deepEqual(advance(restored), advance(state))
  }
})

test('別シナリオや存在しない現在ノードを検出する', () => {
  assert.throws(() => selectCurrentNode(scenario, { ...initial(), scenarioId: 'other' }), /ID/)
  assert.throws(() => selectCurrentNode(scenario, { ...initial(), nodeId: 'missing' }), /ノード/)
})
