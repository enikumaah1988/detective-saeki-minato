import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadCompleted } from './e01CompletedHarness.mjs'
import { createServer } from './viteServer.mjs'

const fixture = JSON.parse(readFileSync(new URL('./fixtures/save-v2-before-30-scenes.json', import.meta.url), 'utf8'))

test('30シーン導入前のv2固定fixtureを元のシナリオ・選択肢・演出・記録で復元する', async () => {
  const api = await loadCompleted()
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { loadSlot, SLOT_STORAGE_KEY } = await server.ssrLoadModule('/src/features/story/saveSlots.ts')
    const raw = JSON.stringify({ version: 1, auto: fixture.slot, manual: [fixture.slot] })
    const storage = { getItem: key => key === SLOT_STORAGE_KEY ? raw : null, setItem: () => assert.fail('LOAD must not rewrite existing slots') }
    const result = loadSlot(0, api.scenarioCatalog, storage)
    assert.equal(result.ok, true)
    assert.deepEqual(api.createSaveData(result.state), fixture.slot.data)
    assert.deepEqual(result.history, fixture.slot.history)
    const scenario = api.scenarioCatalog.find(candidate => candidate.id === result.state.scenarioId)
    const node = api.selectCurrentNode(scenario, result.state)
    assert.deepEqual(node.stage, fixture.expectedStage)
    assert.deepEqual(api.visibleChoices(node, result.state).map(choice => choice.label), fixture.expectedChoices)
    assert.deepEqual(api.selectInvestigationRecords(result.state, scenario.records).map(record => record.id), fixture.expectedRecordIds)
  } finally { await server.close() }
})
