import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { demoScenario as scenario } from '../src/data/scenario/demo.ts'

let saveGame, loadGame, deleteSave, SAVE_STORAGE_KEY, reduceGameState
before(async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    ({ saveGame, loadGame, deleteSave, SAVE_STORAGE_KEY } = await server.ssrLoadModule('/src/features/story/storage.ts'));
    ({ reduceGameState } = await server.ssrLoadModule('/src/features/story/state.ts'))
  } finally { await server.close() }
})
function fakeStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
}
const state = { scenarioId: scenario.id, nodeId: 'decision' }

test('最小情報を version 付き JSON として保存・取得・復元する', () => {
  const storage = fakeStorage()
  assert.deepEqual(saveGame(state, storage), { ok: true })
  assert.deepEqual(JSON.parse(storage.getItem(SAVE_STORAGE_KEY)), { version: 1, ...state })
  assert.deepEqual(loadGame([scenario], storage), { ok: true, state })
})

test('保存なしは正常な空状態として判定し、削除後も同じ状態になる', () => {
  const storage = fakeStorage()
  assert.deepEqual(loadGame([scenario], storage), { ok: false, reason: 'no-save' })
  saveGame(state, storage)
  storage.setItem('unrelated', 'keep')
  assert.deepEqual(deleteSave(storage), { ok: true })
  assert.deepEqual(loadGame([scenario], storage), { ok: false, reason: 'no-save' })
  assert.equal(storage.getItem('unrelated'), 'keep')
  assert.deepEqual(deleteSave(storage), { ok: true })
})

test('不正 JSON・形式・version・未知シナリオ・未知ノードを拒否する', () => {
  const storage = fakeStorage()
  for (const [json, reason] of [
    ['{broken', 'invalid-format'], ['', 'invalid-format'],
    [JSON.stringify({ version: 1 }), 'invalid-format'],
    [JSON.stringify({ version: 2, ...state }), 'unsupported-version'],
    [JSON.stringify({ version: 1, ...state, scenarioId: 'missing' }), 'unknown-scenario'],
    [JSON.stringify({ version: 1, ...state, nodeId: 'missing' }), 'unknown-node'],
  ]) {
    storage.setItem(SAVE_STORAGE_KEY, json)
    assert.deepEqual(loadGame([scenario], storage), { ok: false, reason })
    assert.equal(storage.getItem(SAVE_STORAGE_KEY), json)
  }
})

test('保存・進行・復元・新しいゲーム開始後の再ロードを再現する', () => {
  const storage = fakeStorage()
  saveGame(state, storage)
  const advanced = reduceGameState(scenario, state, { type: 'choose', choiceId: 'listen' })
  assert.equal(advanced.nodeId, 'listen')
  const result = loadGame([scenario], storage)
  assert.equal(result.ok, true)
  assert.deepEqual(reduceGameState(scenario, advanced, { type: 'restore', state: result.state }), state)
  const fresh = { scenarioId: scenario.id, nodeId: scenario.start }
  assert.deepEqual(reduceGameState(scenario, fresh, { type: 'restore', state: loadGame([scenario], storage).state }), state)
})

test('1 スロットを上書きする', () => {
  const storage = fakeStorage()
  saveGame(state, storage)
  const end = { ...state, nodeId: 'end' }
  saveGame(end, storage)
  assert.deepEqual(loadGame([scenario], storage), { ok: true, state: end })
})

test('Storage の例外や localStorage 取得失敗を結果として返す', () => {
  const fail = () => { throw new Error('blocked or full') }
  const storage = { getItem: fail, setItem: fail, removeItem: fail }
  for (const result of [saveGame(state, storage), loadGame([scenario], storage), deleteSave(storage)]) {
    assert.deepEqual(result, { ok: false, reason: 'storage-unavailable' })
  }
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { get localStorage() { return fail() } } })
  try {
    for (const result of [saveGame(state), loadGame([scenario]), deleteSave()]) {
      assert.deepEqual(result, { ok: false, reason: 'storage-unavailable' })
    }
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous)
    else delete globalThis.window
  }
})
