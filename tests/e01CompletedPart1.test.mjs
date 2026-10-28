import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { e01CompletedPart1Lines as lines } from '../src/data/scenario/e01CompletedPart1Lines.ts'
import { auditReferences } from './progressionAudit.mjs'
import { auditPresentation } from './presentationAudit.mjs'
import { loadCompleted, playCompleted } from './e01CompletedHarness.mjs'

const api = await loadCompleted()
const { scenario, reduceGameState, visibleChoices, createSaveData, restoreSaveData, scenarioCatalog } = api

test('完成稿の転記を固定し、全台詞・ト書きが新シナリオ内に存在する', () => {
  // Transcribed from b36e278d / part-01 main body and interactions S01–S06.
  assert.equal(createHash('sha256').update(JSON.stringify(lines)).digest('hex'), '0e415c292c9bb726995a7c96c64a04ea375599889203599ea8932248f89821b1')
  for (const [key, values] of Object.entries(lines)) for (const line of values) {
    assert.ok(Object.values(scenario.nodes).some(node => node.type === 'dialogue' && node.text === line.text && node.speakerId === line.speakerId), key + ': ' + line.text)
  }
})

test('新稿の遷移・演出参照が有効で、第2部を含まず全ノードが開始・終了につながる', () => {
  const audit = auditReferences(scenario)
  assert.deepEqual(audit.missing, [])
  assert.deepEqual(auditPresentation(scenario), [])
  assert.deepEqual(Object.keys(scenario.scenes), ['S01', 'S02', 'S03', 'S04', 'S05', 'S06'])
  for (const id of Object.keys(scenario.nodes)) {
    assert.ok(audit.reachableFromStart.has(id), `未接続 ${id}`)
    assert.ok(audit.canReachEnd.has(id), `終了不能 ${id}`)
  }
})

for (const optional of [false, true]) for (const reverse of [false, true]) {
  test(`S01〜S06完走・任意=${optional}・逆順=${reverse}、全途中状態のv2復元後も完走`, () => {
    const run = playCompleted(api, { optional, reverse })
    assert.equal(run.state.nodeId, 'S06-end')
    assert.equal(run.state.flags.F_SEARCH_REQUEST, true)
    assert.equal(run.state.acquiredInformation.includes('O_LIGHT_RECORD'), optional)
    assert.equal(run.state.acquiredInformation.includes('O_FUJII'), optional)
    assert.deepEqual([...new Set(run.states.map(state => scenario.nodes[state.nodeId].sceneId))], Object.keys(scenario.scenes))
    for (const state of run.states) {
      const restored = restoreSaveData(JSON.parse(JSON.stringify(createSaveData(state))), scenarioCatalog)
      assert.deepEqual(restored, { ok: true, state })
      assert.deepEqual(playCompleted(api, { state: restored.state, optional, reverse }).state, run.state)
    }
  })
}

test('必須条件の欠落で移動できず、任意質問の順序・藤井未聴取には依存しない', () => {
  const run = playCompleted(api)
  for (const [nodeId, required] of [
    ['S01-menu', ['F_LAST_SEEN', 'F_WORK_SITE']], ['S03-menu', ['F_WORK_END', 'F_SEARCH_SCOPE']],
    ['S04-menu', ['F_UNCHECKED_AREA']], ['S05-menu', ['F_PART_CHECK', 'F_OLD_ROOM', 'F_SIMPLE_MAP', 'F_MAP_COMPARED']],
  ]) {
    const state = run.states.find(state => state.nodeId === nodeId && required.every(id => state.acquiredInformation.includes(id)))
    assert.ok(state, nodeId)
    for (const missing of required) {
      const incomplete = { ...state, acquiredInformation: state.acquiredInformation.filter(id => id !== missing) }
      const command = nodeId === 'S01-menu' ? 'proceed' : 'move'
      assert.equal(visibleChoices(scenario.nodes[nodeId], incomplete).some(option => option.id === command), false)
      assert.deepEqual(reduceGameState(scenario, incomplete, { type: 'choose', choiceId: command }), incomplete)
    }
  }
  const company = run.states.find(state => state.nodeId === 'S03-topic')
  assert.equal(company.acquiredInformation.includes('O_FUJII'), false)
  assert.ok(visibleChoices(scenario.nodes[company.nodeId], company).some(option => option.id === 'S03-fujii'))
})

test('S06の全誤答は手掛かり・助言から同じ設問へ戻り、保存復帰・反復後も日時と情報を失わない', () => {
  const run = playCompleted(api)
  for (const [id, wrong] of [['S06-question1', ['A', 'C']], ['S06-question2', ['A', 'B']]]) {
    for (const choiceId of wrong) {
      let state = run.states.find(state => state.nodeId === id)
      const original = state
      for (let repeat = 0; repeat < 3; repeat++) {
        state = reduceGameState(scenario, state, { type: 'choose', choiceId })
        let count = 0
        const texts = []
        while (state.nodeId !== id) {
          assert.ok(count++ < 15)
          const node = scenario.nodes[state.nodeId]
          texts.push(node.text)
          const restored = restoreSaveData(createSaveData(state), scenarioCatalog)
          assert.deepEqual(restored, { ok: true, state })
          assert.equal(playCompleted(api, { state: restored.state }).state.nodeId, 'S06-end')
          state = reduceGameState(scenario, restored.state, { type: 'advance' })
        }
        assert.deepEqual(state, original)
        if (id === 'S06-question1') assert.ok(texts.includes(lines['S05-必須：調べる「予備品の型番」'][0].text))
        assert.match(api.selectDateLabel(scenario, state), /10月7日.*夜/)
      }
    }
  }
})

test('到達状態の各選択肢・考える・再質問・戻る・図面照合の取消後も完走する', t => {
  let branches = 0
  for (const optional of [false, true]) {
    const run = playCompleted(api, { optional })
    for (const state of run.states) for (const option of visibleChoices(scenario.nodes[state.nodeId], state)) {
      const after = reduceGameState(scenario, state, { type: 'choose', choiceId: option.id })
      const restored = restoreSaveData(createSaveData(after), scenarioCatalog)
      assert.deepEqual(restored, { ok: true, state: after })
      assert.equal(playCompleted(api, { state: restored.state }).state.nodeId, 'S06-end', `${state.nodeId}/${option.id}`)
      branches++
    }
  }
  t.diagnostic(`${branches} branches completed after v2 restore`)
})

test('調査記録は取得した新稿情報だけを表示し、心の声は名前欄を表示しない', () => {
  const run = playCompleted(api)
  const initial = api.selectInvestigationRecords(run.states[0], scenario.records)
  assert.equal(initial.some(record => record.id === 'F_OLD_ROOM'), false)
  const records = api.selectInvestigationRecords(run.state, scenario.records)
  assert.ok(records.some(record => record.id === 'F_LAST_SEEN' && record.description.includes('7:30')))
  assert.equal(records.some(record => /三崎|黒田|損傷|供述/.test(record.description)), false)
  for (const node of Object.values(scenario.nodes).filter(node => node.type === 'dialogue' && node.speakerId === 'narrator')) {
    assert.equal(api.dialogueSpeaker(node, run.state), '')
  }
  const manager = Object.values(scenario.nodes).find(node => node.type === 'dialogue' && node.speakerId === 'building-manager')
  assert.equal(api.dialogueSpeaker(manager, run.state), '管理担当者')
})

test('NEW GAMEは完成稿、旧part3-organize保存と既存全ノードのv2復元結果はカタログ追加前後で同一', () => {
  assert.equal(api.defaultScenario.id, 'erased-records-30-scenes')
  const legacy = scenarioCatalog.find(item => item.id === 'gray-testimony-ver001-part1')
  assert.ok(Object.hasOwn(legacy.nodes, 'part3-organize'))
  for (const nodeId of Object.keys(legacy.nodes)) {
    const saved = { version: 2, scenarioId: legacy.id, nodeId, flags: { custom: true }, heardTopics: [], inspectedTargets: [], acquiredInformation: [] }
    const before = restoreSaveData(saved, [legacy])
    assert.equal(before.ok, true, nodeId)
    assert.deepEqual(restoreSaveData(saved, scenarioCatalog), before)
    assert.equal(before.state.scenarioId, legacy.id)
  }
  assert.equal(restoreSaveData({ version: 1, scenarioId: legacy.id, nodeId: 'part3-organize' }, scenarioCatalog).state.scenarioId, legacy.id)
})
