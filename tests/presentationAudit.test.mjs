import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision } from './revisionHarness.mjs'
import { auditPresentation, auditRevisionPresentation } from './presentationAudit.mjs'
let api
before(async () => { api = await loadRevision() })
test('本編・互換ノードと原稿の演出指定が登録定義と一致する', () => {
  assert.deepEqual(auditRevisionPresentation(api.revisionData), [])
  assert.deepEqual(auditPresentation(api.scenario), [])
})

// Mutate copies: fallback rendering must not make invalid authored IDs pass CI.
test('背景・人物・表情・場面参照の誤記は出所付きで検出する', () => {
  const cases = [
    ['backgroundId', scenario => { scenario.nodes['p1-coffee'].stage.backgroundId = 'missing-background' }, /nodes\.p1-coffee\.stage\.backgroundId: unregistered missing-background/],
    ['characterId', scenario => { scenario.scenes[scenario.nodes['p1-coffee'].sceneId].characters[0].characterId = 'toString' }, /characterId: unregistered toString/],
    ['expression', scenario => { scenario.scenes[scenario.nodes['p1-coffee'].sceneId].characters[0].expression = '__proto__' }, /expression: unregistered __proto__/],
    ['speakerId', scenario => { scenario.nodes['p1-coffee'].speakerId = 'missing-speaker' }, /nodes\.p1-coffee\.speakerId: unregistered missing-speaker/],
    ['sceneId', scenario => { scenario.nodes['p1-coffee'].sceneId = 'missing-scene' }, /nodes\.p1-coffee\.sceneId: unregistered missing-scene/],
  ]
  for (const [field, mutate, expected] of cases) {
    const scenario = structuredClone(api.scenario)
    mutate(scenario)
    assert.ok(auditPresentation(scenario).some(error => expected.test(error)), field)
  }
})

test('登録済み表情でも場面に不在の人物への指定を検出する', () => {
  for (const empty of [false, true]) {
    const scenario = structuredClone(api.scenario)
    const node = scenario.nodes['p1-coffee']
    node.expressions = { naoto: 'normal' }
    if (empty) scenario.scenes[node.sceneId].characters = []
    assert.ok(auditPresentation(scenario).includes('nodes.p1-coffee.expressions.naoto: absent from scene cast'))
  }
})

test('未対面条件付きの人物と旧単体Stage・画像なし背景は互換として許容する', () => {
  const stage = { backgroundId: 'prologue', characterId: 'mio' }
  assert.deepEqual(auditPresentation({ nodes: { legacy: { type: 'dialogue', stage, speakerId: 'narrator', expressions: { mio: 'smile' } } } }), [])
  const conditional = { backgroundId: 'office-afternoon', characters: [{ characterId: 'akari', expression: 'worried', condition: { type: 'hasInformation', id: 'met-akari' } }] }
  assert.deepEqual(auditPresentation({ scenes: { conditional }, nodes: { line: { type: 'dialogue', stage: conditional, sceneId: 'conditional', speakerId: 'minato', expressions: { akari: 'sad' } } } }), [])
})

test('生成前の原稿の誤記もintro・ending・各行動・成功・移行行で検出する', () => {
  const line = { speakerId: 'narrator', text: '', backgroundId: 'missing-background', expressions: { mio: 'missing-expression', 'missing-person': 'normal' } }
  const phase = { id: 'audit', people: ['missing-person'], intro: [line], ending: [line] }
  for (const field of ['ask', 'speak', 'inspect', 'think', 'organize', 'topicTransitions']) phase[field] = [{ id: field, personId: 'missing-person', lines: [line], successLines: [line] }]
  const errors = auditRevisionPresentation({ scenes: [phase] })
  for (const path of ['audit.intro[0]', 'audit.ending[0]', ...['ask', 'speak', 'inspect', 'think', 'organize', 'topicTransitions'].flatMap(field => [`audit.${field}.lines[0]`, `audit.${field}.successLines[0]`])]) {
    assert.ok(errors.includes(`${path}.backgroundId: unregistered missing-background`), path)
    assert.ok(errors.includes(`${path}.expressions.mio: unregistered missing-expression`), path)
    assert.ok(errors.includes(`${path}.expressions.missing-person: unregistered normal`), path)
  }
  const copy = structuredClone(api.revisionData)
  copy.scenes[0].intro[0].speakerId = '__proto__'
  assert.ok(auditRevisionPresentation(copy).some(error => error.includes('.speakerId: unregistered __proto__')))
})
