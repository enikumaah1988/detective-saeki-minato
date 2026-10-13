import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from './viteServer.mjs'
let createInitialState, reduceGameState, selectInvestigationRecords, createSaveData, restoreSaveData
before(async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    ({ createInitialState, reduceGameState } = await server.ssrLoadModule('/src/features/story/state.ts'));
    ({ selectInvestigationRecords } = await server.ssrLoadModule('/src/features/story/investigation.ts'));
    ({ createSaveData, restoreSaveData } = await server.ssrLoadModule('/src/features/story/saveData.ts'));
  } finally { await server.close() }
})
const stage = { backgroundId: 'office-before-noon', characters: [] }
const info = id => ({ type: 'addInformation', id })
test('相手選択→話題→戻るは二階層を維持し、相手選択だけでは既読にしない', () => {
  const scenario = { id: 'nested-test', title: '', start: 'menu', nodes: {
    menu: { type: 'choice', mode: 'free-action', stage, prompt: '', empty: { label: '続ける', next: 'line' }, options: [{ id: 'speak', label: '話す', next: 'people' }] },
    people: { type: 'topic', selection: 'person', stage, parent: { commandId: 'speak', nodeId: 'menu' }, prompt: '誰に話す？', options: [{ id: 'mio', label: '澪', next: 'topics' }] },
    topics: { type: 'topic', stage, parent: { commandId: 'speak', nodeId: 'people' }, prompt: '澪に話す', options: [{ id: 'report', label: '報告', next: 'line' }] },
    line: { type: 'dialogue', stage, speakerId: 'mio', text: 'はい。', next: 'menu', updates: [{ type: 'addHeardTopic', id: 'report' }] },
  } }
  let state = createInitialState(scenario)
  const choose = id => { state = reduceGameState(scenario, state, { type: 'choose', choiceId: id }) }
  choose('speak'); choose('mio'); assert.deepEqual(state.heardTopics, [])
  choose('return'); assert.equal(state.nodeId, 'people'); choose('return'); assert.equal(state.nodeId, 'menu')
  choose('speak'); choose('mio'); choose('report'); state = reduceGameState(scenario, state, { type: 'advance' })
  assert.deepEqual(state.heardTopics, ['report'])
})
test('移動後イベントは到着状態で条件評価し、一度だけ実行。今回の本編イベントは不要', () => {
  const scenario = { id: 'arrival-test', title: '', start: 'from', arrivalEvents: [{ arrivalNodeId: 'arrival', eventNodeId: 'event', onceFlag: 'arrival-done' }], nodes: {
    from: { type: 'dialogue', stage, speakerId: '', text: '', next: 'arrival' },
    arrival: { type: 'dialogue', stage, speakerId: '', text: '到着', next: 'from', entryUpdates: [info('arrived')] },
    event: { type: 'dialogue', stage, speakerId: '', text: '到着イベント', next: 'arrival' },
  } }
  let state = reduceGameState(scenario, createInitialState(scenario), { type: 'advance' })
  assert.equal(state.nodeId, 'event'); assert.ok(state.acquiredInformation.includes('arrived'))
  state = reduceGameState(scenario, state, { type: 'advance' }); assert.equal(state.nodeId, 'arrival')
  const restored = restoreSaveData(createSaveData(state), [scenario]); assert.deepEqual(restored.state, state)
  state = reduceGameState(scenario, state, { type: 'advance' }); state = reduceGameState(scenario, state, { type: 'advance' })
  assert.equal(state.nodeId, 'arrival')
})
test('話題登場→対面→名前・新情報の人物記録を、その時点のセーブから復元する', () => {
  const source = (...ids) => ({ type: 'information', ids })
  const definitions = [{ id: 'person', category: 'people', title: '管理人', source: source('mentioned'), portraitSource: source('met'), imageSrc: 'portrait.png', description: '建物の管理人。', titleUpdates: [{ source: source('named'), title: '宮原　文雄' }], facts: [{ source: source('testimony'), text: '動作を見ていた。' }] }]
  const base = { scenarioId: 'record-test', nodeId: 'node', flags: {}, heardTopics: [], inspectedTargets: [], acquiredInformation: [] }
  assert.equal(selectInvestigationRecords(base, definitions).some(record => record.id === 'person'), false)
  const mentioned = { ...base, acquiredInformation: ['mentioned'] }
  const record = state => selectInvestigationRecords(state, definitions).find(record => record.id === 'person')
  assert.equal(record(mentioned).imageSrc, undefined); assert.equal(record(mentioned).title, '管理人')
  const met = { ...mentioned, acquiredInformation: ['mentioned', 'met', 'named'] }
  assert.equal(record(met).imageSrc, 'portrait.png'); assert.equal(record(met).details.length, 1)
  assert.equal(record({ ...met, acquiredInformation: [...met.acquiredInformation, 'testimony'] }).details.length, 2)
  const scenario = { id: 'record-test', nodes: { node: { type: 'end', stage, text: '' } } }
  assert.deepEqual(record(restoreSaveData(createSaveData(mentioned), [scenario]).state), record(mentioned))
})
