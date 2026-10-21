import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadRevision } from './revisionHarness.mjs'

const api = await loadRevision()

test('会社背景5枚は独立した1920×1080 PNGで、既存の会社場面から使われる', () => {
  const ids = ['company-exterior', 'company-lobby', 'company-reception', 'company-lounge', 'company-office']
  const images = ids.map(id => readFileSync(new URL(`../src/assets/images/backgrounds/${id}.png`, import.meta.url)))
  for (const [index, image] of images.entries()) {
    assert.equal(image.subarray(1, 4).toString(), 'PNG')
    assert.equal(image.readUInt32BE(16), 1920)
    assert.equal(image.readUInt32BE(20), 1080)
    assert.ok(Object.values(api.scenario.nodes).some(node => node.stage.backgroundId === ids[index]), ids[index])
  }
  assert.equal(new Set(images.map(image => image.toString('base64'))).size, 5)
})

test('ロビー・執務室の演出をセーブ復元しても受付へ戻り、受付認識を取得する', () => {
  const { scenario, createInitialState, createSaveData, restoreSaveData, reduceGameState } = api
  assert.equal(scenario.nodes['P2-02-arrival'].stage.backgroundId, 'company-lobby')
  for (const [start, background, end] of [['P2-02-intro', 'company-lobby', 'P2-02-menu'], ['p2-reception-exists-2', 'company-office', 'P2-02-targets']]) {
    let state = { ...createInitialState(scenario), nodeId: start }
    assert.equal(scenario.nodes[start].stage.backgroundId, background)
    const save = createSaveData(state)
    assert.equal(save.version, 2)
    const restored = restoreSaveData(JSON.parse(JSON.stringify(save)), [scenario])
    assert.equal(restored.ok, true)
    state = restored.state
    while (scenario.nodes[state.nodeId].type === 'dialogue') state = reduceGameState(scenario, state, { type: 'advance' })
    assert.equal(state.nodeId, end)
    assert.equal(scenario.nodes[state.nodeId].stage.backgroundId, 'company-reception')
    if (background === 'company-office') {
      assert.ok(state.acquiredInformation.includes('recognized-company-reception'))
      assert.ok(state.acquiredInformation.includes('met-company-reception'))
    }
  }
})

test('会社の移動先は既存の外観・受付・応接室に留まる', () => {
  assert.deepEqual([...new Set(api.revisionData.scenes.filter(phase => phase.locationId === 'company').map(phase => phase.roomId))].sort(), ['company-exterior', 'company-lounge', 'company-reception'])
})
