import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'
import { selectSceneStage, stageCharacters } from '../src/features/story/scene.ts'
import { resolveExpression } from '../src/data/presentation.ts'

let api, run
before(async () => { api = await loadRevision(); run = buildPlaythrough(api, true) })
const stateAt = id => ({ ...run.checkpoints.find(point => point.phase === api.scenario.nodes[id].savePhaseId)?.state ?? api.createInitialState(api.scenario), nodeId: id })
const castAt = id => api.selectCurrentNode(api.scenario, stateAt(id)).stage.characters
const expressionAt = (id, character) => castAt(id).find(person => person.characterId === character)?.expression

test('会話の感情指定が画像へ接続され、聞き手の反応を同じ会話内で維持する', () => {
  assert.equal(expressionAt('p1-coffee', 'minato'), 'surprised')
  assert.equal(expressionAt('p1-coffee-2', 'mio'), 'amused')
  assert.equal(expressionAt('p1-coffee-3', 'minato'), 'smile')
  assert.equal(expressionAt('p1-coffee-3', 'mio'), 'amused')
  assert.notEqual(resolveExpression('minato', 'surprised').imageSrc, resolveExpression('minato', 'smile').imageSrc)
  assert.equal(expressionAt('p1-missing-4', 'akari'), 'sad')
  assert.equal(expressionAt('p1-accept-9', 'akari'), 'determined')
  assert.equal(expressionAt('p3-silence-7', 'naoto'), 'remorseful')
  assert.equal(expressionAt('p3-testify-3', 'naoto'), 'serious')
  assert.equal(expressionAt('p4-siblings-talk-19', 'naoto'), 'relieved')
})

test('話題を戻した後・別会話・逆順表示では表情を持ち越さない', () => {
  const before = structuredClone(api.scenario.scenes)
  assert.equal(expressionAt('p1-coffee-4', 'mio'), 'amused')
  assert.equal(expressionAt('P1-01-menu', 'mio'), 'smile')
  assert.equal(expressionAt('p1-coffee', 'minato'), 'surprised')
  assert.deepEqual(api.scenario.scenes, before)
  assert.equal(api.scenario.nodes['p1-coffee'].sceneId, api.scenario.nodes['p1-coffee-4'].sceneId)
})

test('新旧version2保存をノード位置から復元し、保存形式に表情状態を増やさない', () => {
  for (const id of ['p1-coffee-3', 'p1-accept-9', 'p3-silence-7', 'p4-siblings-talk-19']) {
    const state = stateAt(id), saved = JSON.parse(JSON.stringify(api.createSaveData(state)))
    assert.equal(saved.version, 2)
    assert.equal(Object.hasOwn(saved, 'expressions'), false)
    const restored = api.restoreSaveData(saved, [api.scenario])
    assert.equal(restored.ok, true)
    assert.deepEqual(api.selectCurrentNode(api.scenario, restored.state).stage, api.selectCurrentNode(api.scenario, state).stage)
  }
})

test('全感情指定に既存画像があり、三人表示の配置・向き・表示条件を維持する', () => {
  for (const node of Object.values(api.scenario.nodes)) {
    if (node.type !== 'dialogue') continue
    for (const [character, expression] of Object.entries(node.expressions ?? {})) assert.ok(resolveExpression(character, expression).imageSrc, `${character}:${expression}`)
  }
  const police = castAt('p2-segawa-boundary-3')
  assert.deepEqual(police.map(person => [person.characterId, person.position]), [['segawa', 'left'], ['minato', 'center'], ['okumura', 'right']])
  assert.equal(police[0].expression, 'serious')
  assert.equal(police[1].expression, 'front-normal')
  const siblings = castAt('p4-siblings-talk-19')
  assert.deepEqual(siblings.map(person => [person.characterId, person.position]), [['akari', 'left'], ['minato', 'center'], ['naoto', 'right']])
  assert.equal(siblings[0].expression, 'right-sad')
  assert.equal(siblings[1].expression, 'front-normal')
})

test('表情指定は不在人物を追加せず、旧単体Stageにも適用できる', () => {
  const stage = { backgroundId: 'office', characters: [{ characterId: 'mio', expression: 'normal', position: 'right', condition: { type: 'flag', id: 'met' } }] }
  const node = { type: 'dialogue', stage, sceneId: 'office', expressions: { mio: 'smile', absent: 'worried' } }
  const scenario = { scenes: { office: stage }, nodes: { line: node } }
  assert.deepEqual(selectSceneStage(scenario, 'line').characters, [{ ...stage.characters[0], expression: 'smile' }])
  assert.equal(stage.characters[0].expression, 'normal')
  const legacy = { nodes: { line: { ...node, sceneId: undefined, stage: { backgroundId: 'office', characterId: 'mio', expression: 'normal', characterPosition: 'left' } } } }
  assert.deepEqual(stageCharacters(selectSceneStage(legacy, 'line')).map(person => [person.characterId, person.expression, person.position]), [['mio', 'smile', 'left']])
})
