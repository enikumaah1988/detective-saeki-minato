import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
let selectSmokingPresentation, scenario, createSaveData, restoreSaveData
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
try {
  ({ selectSmokingPresentation } = await server.ssrLoadModule('/src/features/story/smoking.ts'))
  ;({ freeActionDemo: scenario } = await server.ssrLoadModule('/src/data/scenario/freeActionDemo.ts'))
  ;({ createSaveData, restoreSaveData } = await server.ssrLoadModule('/src/features/story/saveData.ts'))
} finally { await server.close() }
const state = (information = [], nodeId = 'menu') => ({ scenarioId: scenario.id, nodeId, flags: {}, heardTopics: [], inspectedTargets: [], acquiredInformation: information })
const required = ['brother_profile', 'disappearance_timing', 'last_known_activity', 'past_accident']

test('不足情報の優先順と全取得後・会話中・受諾後のヒントを取得状態から導出する', () => {
  for (const [count, id] of [[0,'brother'],[1,'missing'],[2,'recent'],[3,'accident'],[4,'ready']]) {
    assert.equal(selectSmokingPresentation(scenario, state(required.slice(0,count))).hintId,id)
  }
  assert.equal(selectSmokingPresentation(scenario,state(['extra','extra','brother_profile'])).hintId,'missing')
  assert.equal(selectSmokingPresentation(scenario,state(required,'accident')).hintId,'listen-first')
  assert.equal(selectSmokingPresentation(scenario,state(required,'accepted')).hintId,'accepted')
  assert.equal(selectSmokingPresentation(scenario,state(required,'part2-placeholder')).hintId,'finished')
})

test('場所の喫煙可否はシーンから復元し、未設定・旧Stageでは吸わずにヒントを使える', () => {
  assert.equal(selectSmokingPresentation(scenario,state()).allowed,true)
  const forbidden = { ...scenario, scenes: { ...scenario.scenes, request: { ...scenario.scenes.request, smokingAllowed:false } } }
  const unspecified = { ...scenario, scenes: { ...scenario.scenes, request: { backgroundId:'office-afternoon' } } }
  const legacy = { ...scenario, nodes: { ...scenario.nodes, menu: { ...scenario.nodes.menu, sceneId:undefined } } }
  for (const definition of [forbidden, unspecified, legacy]) {
    const result = selectSmokingPresentation(definition,state())
    assert.equal(result.allowed,false)
    assert.equal(result.hintId,'brother')
  }
})

test('ヒント導出は凍結状態を変更せず、version 2復元後も不足情報を再計算する', () => {
  const current = state(required.slice(0,2))
  Object.freeze(current.flags)
  for (const key of ['heardTopics','inspectedTargets','acquiredInformation']) Object.freeze(current[key])
  Object.freeze(current)
  const before = JSON.stringify(createSaveData(current))
  selectSmokingPresentation(scenario,current)
  assert.equal(JSON.stringify(createSaveData(current)),before)
  const restored = restoreSaveData(JSON.parse(before),[scenario])
  assert.equal(restored.ok,true)
  assert.equal(selectSmokingPresentation(scenario,restored.state).hintId,'recent')
})

test('ヒント定義のない旧シナリオは一般的な案内へ戻る', () => {
  assert.match(selectSmokingPresentation({ ...scenario, smokingHints:undefined },state()).hint,/調査記録/)
})
