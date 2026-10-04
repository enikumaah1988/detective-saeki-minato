import test from 'node:test'
import assert from 'node:assert/strict'
import { createSaveData, restoreSaveData, parseSaveData } from '../src/features/story/saveData.ts'
import { demoScenario as scenario } from '../src/data/scenario/demo.ts'
import { getNode, transition } from '../src/features/story/progression.ts'

const scenarios = [scenario]
const state = { scenarioId: scenario.id, nodeId: scenario.start }
const valid = { version: 1, ...state }
const failure = (input, reason) => assert.deepEqual(restoreSaveData(input, scenarios), { ok: false, reason })

test('GameState から独立した version 1 の最小セーブを作り復元する', () => {
  const save = createSaveData(state)
  assert.deepEqual(save, valid)
  assert.notStrictEqual(save, state)
  assert.deepEqual(restoreSaveData(save, scenarios), { ok: true, state })
  const result = restoreSaveData({ ...valid, extra: 'ignored' }, scenarios)
  assert.deepEqual(result, { ok: true, state })
})

test('会話・選択肢・両分岐・終了を JSON 往復して同じ状態と進行を再現する', () => {
  for (const nodeId of Object.keys(scenario.nodes)) {
    const original = { scenarioId: scenario.id, nodeId }
    const json = JSON.stringify(createSaveData(original))
    const parsed = JSON.parse(json)
    const result = restoreSaveData(parsed, scenarios)
    assert.equal(result.ok, true)
    assert.deepEqual(result.state, original)
    assert.deepEqual(getNode(scenario, result.state.nodeId), getNode(scenario, nodeId))
    assert.equal(transition(scenario, result.state.nodeId, { type: 'advance' }), transition(scenario, nodeId, { type: 'advance' }))
    assert.deepEqual(parseSaveData(json, scenarios), result)
    const node = getNode(scenario, nodeId)
    if (node.type === 'choice') {
      for (const option of node.options) {
        assert.equal(transition(scenario, result.state.nodeId, { type: 'choose', choiceId: option.id }), option.next)
      }
    }
  }
})

test('不正な型・欠落・空 ID を拒否する', () => {
  for (const input of [null, undefined, [], true, 1, 'save', {},
    { ...valid, version: undefined }, { ...valid, version: '1' },
    { ...valid, version: NaN }, { ...valid, version: Infinity },
    { ...valid, version: 1.5 }, { ...valid, version: 0 },
    { ...valid, scenarioId: 1 }, { ...valid, scenarioId: '' }, { ...valid, scenarioId: ' ' },
    { ...valid, nodeId: null }, { ...valid, nodeId: '' }, { ...valid, nodeId: ' ' },
    { version: 1, nodeId: 'request' }, { version: 1, scenarioId: scenario.id }]) {
    failure(input, 'invalid-format')
  }
})

test('未対応 version は復元せず理由を返す', () => {
  failure({ ...valid, version: 2 }, 'unsupported-version')
  failure({ ...valid, version: 999 }, 'unsupported-version')
})

test('未知シナリオと削除されたノードを区別して拒否する', () => {
  failure({ ...valid, scenarioId: 'missing' }, 'unknown-scenario')
  failure({ ...valid, nodeId: 'deleted-node' }, 'unknown-node')
  for (const nodeId of ['toString', '__proto__', 'constructor']) failure({ ...valid, nodeId }, 'unknown-node')
  assert.deepEqual(restoreSaveData(valid, []), { ok: false, reason: 'unknown-scenario' })
  const revised = { ...scenario, nodes: { end: scenario.nodes.end } }
  assert.deepEqual(restoreSaveData(valid, [revised]), { ok: false, reason: 'unknown-node' })
})

test('壊れた JSON や継承・getter・Proxy 入力でも例外を漏らさない', () => {
  assert.deepEqual(parseSaveData('{broken', scenarios), { ok: false, reason: 'invalid-format' })
  failure(Object.create(valid), 'invalid-format')
  const getter = { ...valid }
  Object.defineProperty(getter, 'version', { get() { throw new Error('must not execute') } })
  failure(getter, 'invalid-format')
  failure(new Proxy({}, { getOwnPropertyDescriptor() { throw new Error('invalid input') } }), 'invalid-format')
})
