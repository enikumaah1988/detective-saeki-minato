import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from './viteServer.mjs'
let scenario, createInitialState, reduceGameState, selectCurrentNode, visibleChoices, createSaveData, restoreSaveData, selectInvestigationRecords
before(async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    ({ episode1Part1: scenario } = await server.ssrLoadModule('/src/data/scenario/episode1Part1.ts'));
    ({ createInitialState, reduceGameState, selectCurrentNode } = await server.ssrLoadModule('/src/features/story/state.ts'));
    ({ visibleChoices } = await server.ssrLoadModule('/src/features/story/freeAction.ts'));
    ({ createSaveData, restoreSaveData } = await server.ssrLoadModule('/src/features/story/saveData.ts'));
    ({ selectInvestigationRecords } = await server.ssrLoadModule('/src/features/story/investigation.ts'));
  } finally { await server.close() }
})
const advance = state => reduceGameState(scenario, state, { type: 'advance' })
const choose = (state, choiceId) => reduceGameState(scenario, state, { type: 'choose', choiceId })
function read(state) {
  let count = 0
  while (selectCurrentNode(scenario, state).type === 'dialogue') {
    assert.ok(count++ < 100, '会話ループなし')
    state = advance(state)
  }
  return state
}
const menu = () => read(createInitialState(scenario))
const inquire = state => read(choose(choose(state, 'talk'), 'morning-contact-work'))
const departure = state => read(choose(state, 'think'))
const company = state => read(choose(choose(state, 'move'), 'company'))
const finish = state => read(choose(choose(state, 'talk'), 'leave-and-appointment'))
test('任意項目を読まずI01・I02を取得して第2部境界へ到達', () => {
  const first = inquire(menu())
  assert.deepEqual(first.acquiredInformation, ['I01'])
  const accepted = departure(first)
  assert.equal(accepted.flags.request_accepted, true)
  const arrived = company(accepted)
  assert.equal(arrived.nodeId, 'company-menu')
  const end = finish(arrived)
  assert.equal(end.nodeId, 'part2-boundary')
  assert.equal(end.flags.part1_completed, true)
  assert.deepEqual(end.heardTopics, ['morning-contact-work', 'leave-and-appointment'])
  assert.deepEqual(end.inspectedTargets, [])
  assert.ok(end.acquiredInformation.includes('I01') && end.acquiredInformation.includes('I02'))
})
test('I01未取得では考える・移動を拒否、I01/I02片方不足の復元でも出口を防止', () => {
  const empty = menu()
  assert.strictEqual(choose(empty, 'think'), empty)
  assert.strictEqual(choose(empty, 'move'), empty)
  for (const acquiredInformation of [[], ['I01'], ['I02'], ['unrelated','unrelated']]) {
    const state = { ...empty, nodeId: 'part1-exit', acquiredInformation }
    const next = advance(state)
    assert.notEqual(next.nodeId, 'part1-complete')
    assert.notEqual(next.flags.part1_completed, true)
  }
  const locked = { ...empty, nodeId: 'destinations' }
  assert.strictEqual(choose(locked, 'company'), locked)
})
test('会話途中・サブメニュー・移動先・取得後のversion2セーブ復帰', () => {
  const first = inquire(menu())
  const accepted = departure(first)
  const snapshots = [choose(menu(), 'talk'), choose(choose(menu(), 'talk'), 'morning-contact-work'), first, choose(accepted, 'move'), company(accepted)]
  for (const state of snapshots) {
    const saved = createSaveData(state)
    assert.equal(saved.version, 2)
    const loaded = restoreSaveData(JSON.parse(JSON.stringify(saved)), [scenario])
    assert.equal(loaded.ok, true)
    assert.deepEqual(loaded.state, state)
    assert.deepEqual(advance(loaded.state), advance(state))
  }
})
test('読了時だけ取得、再聴取・調査で重複なし、戻るは未取得', () => {
  const start = menu()
  const topic = choose(start, 'talk')
  assert.deepEqual(choose(topic, 'return').acquiredInformation, [])
  let speaking = choose(topic, 'morning-contact-work')
  while (!scenario.nodes[speaking.nodeId].updates?.some(u => u.id === 'I01')) {
    assert.deepEqual(speaking.acquiredInformation, [])
    speaking = advance(speaking)
  }
  assert.deepEqual(speaking.acquiredInformation, [])
  const obtained = advance(speaking)
  // 復元したサブメニューからの再聴取も同じ更新を再適用できる。
  const repeated = read(choose({ ...obtained, nodeId: 'office-topics' }, 'morning-contact-work'))
  assert.deepEqual(repeated.acquiredInformation, ['I01'])
  assert.deepEqual(repeated.heardTopics, ['morning-contact-work'])
  let inspected = read(choose(choose(start, 'look'), 'cup'))
  inspected = read(choose(choose(inspected, 'look'), 'cup'))
  assert.deepEqual(inspected.inspectedTargets, ['cup'])
  assert.deepEqual(inspected.acquiredInformation, [])
  assert.deepEqual(visibleChoices(scenario.nodes['office-menu'], obtained).map(o => o.id), ['think'])
})
test('本編記録は取得済みだけを導出し、デモ事実と混同しない', () => {
  const records = state => selectInvestigationRecords(state, scenario.records)
  assert.equal(records(menu()).filter(r => r.category !== 'belongings').length, 0)
  const first = inquire(menu())
  assert.equal(records(first).some(r => r.id === 'I02'), false)
  const end = finish(company(departure(first)))
  const titles = records(end).map(r => r.title).join('\n')
  assert.match(titles, /高瀬あかり/)
  assert.match(titles, /I01/)
  assert.match(titles, /I02/)
  assert.doesNotMatch(titles, /澪の兄|写真の裏/)
  assert.equal(new Set(records(end).map(r => r.id)).size, records(end).length)
})

test('人物IDに依存せず配置し、作品データで指定した移動だけを有効化', () => {
  const custom = { ...scenario, scenes: { ...scenario.scenes, request: { ...scenario.scenes.request, characters: [{ characterId: 'another-detective', expression: 'neutral', position: 'left' }, { characterId: 'another-client', expression: 'neutral', position: 'right' }] } } }
  assert.equal(createInitialState(custom).nodeId, custom.start)
  const first = menu()
  const moveMenu = { ...scenario.nodes.departure, options: [{ id: 'move', label: '移動', next: 'destinations' }, { id: 'organize', label: '整理する', next: 'organize' }] }
  assert.deepEqual(visibleChoices(moveMenu, first).map(o => o.id), ['move'])
  assert.deepEqual(visibleChoices({ ...moveMenu, implementedCommands: undefined }, first), [])
})


test('任意会話は補助記録になるがI01の必須条件を代替しない', () => {
  let state = read(choose(choose(menu(), 'talk'), 'daily'))
  state = read(choose(choose(state, 'talk'), 'family'))
  assert.deepEqual(state.acquiredInformation, ['naoto-daily', 'akari-family'])
  assert.strictEqual(choose(state, 'think'), state)
  const acquired = inquire(state)
  const details = selectInvestigationRecords(acquired, scenario.records).flatMap(r => r.details).join('\n')
  assert.match(details, /両親はもうおらず/)
  assert.match(details, /遅くなる時/)
})
