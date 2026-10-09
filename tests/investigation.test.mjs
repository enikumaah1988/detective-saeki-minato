import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
const initial = { scenarioId: 'gray-testimony-part1-demo', nodeId: 'menu', flags: {}, heardTopics: [], inspectedTargets: [], acquiredInformation: [] }
let selectInvestigationRecords, RECORD_CATEGORIES, InvestigationRecords
let part1Records, basicBelongings
let freeActionDemo, createInitialState, reduceGameState, createSaveData, parseSaveData
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
try {
  ({ part1Records, basicBelongings } = await server.ssrLoadModule('/src/data/investigation.ts'));
  ({ selectInvestigationRecords, RECORD_CATEGORIES } = await server.ssrLoadModule('/src/features/story/investigation.ts'));
  ({ InvestigationRecords } = await server.ssrLoadModule('/src/features/story/InvestigationRecords.tsx'))
  ;({ freeActionDemo } = await server.ssrLoadModule('/src/data/scenario/freeActionDemo.ts'))
  ;({ createInitialState, reduceGameState } = await server.ssrLoadModule('/src/features/story/state.ts'))
  ;({ createSaveData, parseSaveData } = await server.ssrLoadModule('/src/features/story/saveData.ts'))
} finally { await server.close() }

test('取得前の人物・証拠・出来事は表示せず、基本の持ち物のみ表示する', () => {
  assert.deepEqual(RECORD_CATEGORIES.map(category => category.label), ['人物', '証拠', '出来事', '持ち物'])
  const records = selectInvestigationRecords(initial)
  assert.deepEqual(records.map(record => record.title), ['スマホ', '電子タバコ', '名刺'])
  assert.ok(records.every(record => record.category === 'belongings'))
  const html = renderToStaticMarkup(createElement(InvestigationRecords, { state: initial, onClose() {} }))
  assert.match(html, /記録はありません/)
  assert.equal(html.match(/記録はありません/g).length, 1)
  assert.doesNotMatch(html, /澪の兄|兄の写真|連絡が途絶える/)
  for (const title of ['人物', '証拠', '出来事', '持ち物']) assert.ok(html.includes(title))
})

test('澪との既存会話の完了で人物・出来事を更新し、再聴取・JSON保存復元でも重複しない', () => {
  let state = createInitialState(freeActionDemo)
  const act = action => { state = reduceGameState(freeActionDemo, state, action) }
  const records = () => selectInvestigationRecords(state)
  while (state.nodeId !== 'menu') act({ type: 'advance' })
  assert.ok(!records().some(entry => entry.category === 'people' || entry.category === 'events'))
  act({ type: 'choose', choiceId: 'talk' }); act({ type: 'choose', choiceId: 'missing' })
  assert.equal(state.nodeId, 'missing')
  assert.ok(!records().some(entry => entry.id === 'client-observation' || entry.id === 'disappearance'))
  act({ type: 'advance' })
  const mio = records().find(entry => entry.id === 'client-observation')
  assert.ok(mio.imageSrc)
  assert.ok(mio.details.some(text => text.includes('三日前')))
  assert.ok(!mio.details.some(text => /几帳面|事故|緊張/.test(text)))
  assert.deepEqual(records().filter(entry => entry.category === 'events').map(entry => entry.id), ['disappearance'])
  const first = JSON.stringify(state)
  act({ type: 'choose', choiceId: 'talk' }); act({ type: 'choose', choiceId: 'missing' }); act({ type: 'advance' })
  assert.equal(JSON.stringify(state), first)
  for (const choiceId of ['brother', 'recent-brother', 'accident']) {
    act({ type: 'choose', choiceId: 'talk' }); act({ type: 'choose', choiceId }); act({ type: 'advance' })
  }
  assert.deepEqual(records().filter(entry => entry.category === 'events').map(entry => entry.id), ['past-accident', 'last-activity', 'disappearance'])
  assert.equal(records().filter(entry => entry.id === 'client-observation').length, 1)
  assert.equal(records().find(entry => entry.id === 'client-observation').details.length, 5)
  act({ type: 'choose', choiceId: 'look' }); act({ type: 'choose', choiceId: 'client' }); act({ type: 'advance' })
  assert.equal(records().filter(entry => entry.title === '相澤澪').length, 1)
  assert.ok(records().find(entry => entry.id === 'client-observation').details.some(text => text.includes('緊張')))
  const saved = JSON.stringify(createSaveData(state))
  const restored = parseSaveData(saved, [freeActionDemo])
  assert.equal(restored.ok, true)
  assert.deepEqual(selectInvestigationRecords(restored.state), records())
  assert.ok(!saved.includes('dev-'))
  assert.equal(JSON.parse(saved).version, 2)
})

test('既存の取得情報・調査結果だけを記録へ反映し、未取得の詳細を漏らさない', () => {
  const state = { ...initial, acquiredInformation: ['brother_profile'], inspectedTargets: ['client'] }
  const snapshot = JSON.stringify(state)
  const records = selectInvestigationRecords(state)
  const brother = records.find(record => record.id === 'brother')
  assert.ok(brother.details[0].includes('几帳面'))
  assert.equal(brother.details.length, 1)
  assert.ok(records.some(record => record.id === 'client-observation'))
  assert.ok(!records.some(record => record.category === 'events' || record.category === 'evidence'))
  assert.equal(JSON.stringify(state), snapshot)
  const updated = selectInvestigationRecords({ ...state, acquiredInformation: ['brother_profile', 'missing_date'] })
  assert.ok(updated.find(record => record.id === 'brother').details.some(detail => detail.includes('三日前')))
})

test('出来事は情報取得順から独立した時系列順で、旧・新情報IDも重複しない', () => {
  const state = { ...initial, acquiredInformation: ['disappearance_timing', 'missing_date', 'last_known_activity', 'brother_recent', 'past_accident'] }
  const entries = selectInvestigationRecords(state).filter(record => record.category === 'events')
  assert.deepEqual(entries.map(record => record.id), ['past-accident', 'last-activity', 'disappearance'])
  const reverse = selectInvestigationRecords({ ...state, acquiredInformation: [...state.acquiredInformation].reverse() })
  assert.deepEqual(reverse.filter(record => record.category === 'events'), entries)
  assert.equal(new Set(entries.map(entry => entry.id)).size, 3)
})

test('スマホ本体は持ち物、証拠写真は証拠で、同じ項目を両分類に複製しない', () => {
  const photo = { id: 'phone-photo', category: 'evidence', title: 'スマホで撮った証拠写真', source: { type: 'information', ids: ['phone-photo'] }, description: '検証用の証拠。' }
  const duplicate = { ...photo, category: 'belongings' }
  const records = selectInvestigationRecords({ ...initial, acquiredInformation: ['photo_date', 'phone-photo'] }, [...part1Records, photo, duplicate])
  assert.equal(records.filter(record => record.id === 'phone-photo').length, 1)
  assert.equal(records.find(record => record.id === 'phone-photo').category, 'evidence')
  assert.equal(records.find(record => record.id === 'smartphone').category, 'belongings')
  assert.equal(records.find(record => record.id === 'brother-photo').imageSrc, undefined)
  assert.ok(basicBelongings.every(item => item.category === 'belongings'))
})

test('旧セーブの取得IDを参照でき、未知の情報名や他シナリオの記録を表示しない', () => {
  assert.ok(selectInvestigationRecords({ ...initial, acquiredInformation: ['brother_recent', 'missing_date'] }).some(record => record.id === 'last-activity'))
  assert.deepEqual(selectInvestigationRecords({ ...initial, scenarioId: 'demo-request', acquiredInformation: part1Records.map(item => item.id) }), selectInvestigationRecords({ ...initial, scenarioId: 'demo-request' }))
  assert.equal(selectInvestigationRecords({ ...initial, acquiredInformation: ['unknown-secret'] }).length, 3)
})
