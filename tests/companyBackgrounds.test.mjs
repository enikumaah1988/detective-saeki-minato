import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadRevision } from './revisionHarness.mjs'
import { resolveBackground } from '../src/data/presentation.ts'

const api = await loadRevision()

test('保存済みの会社場面IDから外観の建物名と各屋内の場所名を復元する', () => {
  const { scenario, createInitialState, createSaveData, restoreSaveData } = api
  for (const [nodeId, backgroundId, name] of [
    ['P2-02-EXT-intro', 'company-exterior', '西新宿セントラルタワー前'],
    ['P2-02-LOBBY-intro', 'company-lobby', '西新宿セントラルタワー・共用ロビー'],
    ['P2-02-intro-2', 'company-reception', '東成ビルサービス・12階受付'],
    ['P2-03-intro', 'company-lounge', '東成ビルサービス・応接室'],
    ['p2-reception-exists-2', 'company-office', '東成ビルサービス・執務室'],
  ]) {
    const save = createSaveData({ ...createInitialState(scenario), nodeId })
    assert.equal(save.version, 2)
    const restored = restoreSaveData(JSON.parse(JSON.stringify(save)), [scenario])
    assert.equal(restored.ok, true)
    assert.equal(restored.state.nodeId, nodeId)
    assert.equal(scenario.nodes[restored.state.nodeId].stage.backgroundId, backgroundId)
    assert.equal(resolveBackground(backgroundId).name, name)
  }
})

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
  assert.equal(scenario.nodes['P2-02-arrival'].stage.backgroundId, 'company-reception')
  for (const [start, background, end] of [['P2-02-intro', 'company-reception', 'P2-02-menu'], ['p2-reception-exists-2', 'company-office', 'P2-02-targets']]) {
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
  assert.deepEqual([...new Set(api.revisionData.scenes.filter(phase => phase.locationId === 'company').map(phase => phase.roomId))].sort(), ['company-exterior', 'company-lobby', 'company-lounge', 'company-reception'])
})
