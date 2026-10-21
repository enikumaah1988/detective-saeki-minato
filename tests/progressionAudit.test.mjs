import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'
import { auditReferences, finishFrom } from './progressionAudit.mjs'

let api, baseline, alternate
before(async () => {
  api = await loadRevision()
  baseline = buildPlaythrough(api, true)
  alternate = buildPlaythrough(api, false, { reverse: true, returns: true })
})

test('本編の全参照先が存在し、全ノードに構造上の終了経路がある', () => {
  const audit = auditReferences(api.scenario)
  assert.deepEqual(audit.missing, [])
  assert.deepEqual(Object.keys(api.scenario.nodes).filter(id => !audit.canReachEnd.has(id)), [])
  const currentEntries = api.revisionData.scenes.flatMap(phase => [
    `${phase.id}-intro`, `${phase.id}-menu`,
    ...[...phase.ask, ...phase.speak, ...phase.inspect, ...phase.think, ...(phase.organize ?? [])]
      .filter(action => !action.legacyOnly).map(action => action.id),
  ])
  assert.deepEqual(currentEntries.filter(id => !audit.reachableFromStart.has(id)), [])
  // Do not assert every node is reachable from a new game: old saves, legacyOnly,
  // repeat dialogue and item-use clones have legitimate alternate entry points.
})

test('終了先があっても本編開始から切り離されたノードは到達不能と区別する', () => {
  const scenario = structuredClone(api.scenario)
  scenario.nodes['audit-disconnected'] = { type: 'dialogue', next: 'episode-complete' }
  const audit = auditReferences(scenario)
  assert.equal(audit.canReachEnd.has('audit-disconnected'), true)
  assert.equal(audit.reachableFromStart.has('audit-disconnected'), false)
})

test('隠れた条件分岐・自動遷移・再実行・復帰・互換の参照切れも出所を示す', () => {
  const scenario = structuredClone(api.scenario)
  const node = scenario.nodes[scenario.start]
  const fields = {
    nextWhen: { condition: { type: 'flag', id: 'never' }, next: 'missing-nextWhen' },
    conditionalNext: [{ condition: { type: 'flag', id: 'never' }, next: 'missing-conditional' }],
    automaticNext: [{ condition: { type: 'flag', id: 'never' }, next: 'missing-automatic' }],
  }
  Object.assign(node, fields)
  scenario.nodes['audit-menu'] = {
    type: 'inspect', parent: { nodeId: 'missing-parent' },
    options: [{ id: 'audit', next: 'missing-choice', repeatNext: 'missing-repeat' }],
  }
  scenario.nodes['audit-free'] = { type: 'choice', options: [], empty: { next: 'missing-empty' }, map: { back: 'missing-map' } }
  scenario.nodes['audit-think'] = { type: 'think', insufficient: { next: 'missing-insufficient' }, partial: { next: 'missing-partial' }, complete: { next: 'missing-complete' } }
  scenario.itemUses = [{ nodeIds: ['missing-item-source'], next: 'missing-item' }, { nodeIds: [], next: 'missing-unused-item' }]
  scenario.arrivalEvents = [{ arrivalNodeId: 'missing-arrival', eventNodeId: 'missing-event' }]
  scenario.saveNodeAliases = { 'missing-save-source': 'missing-save-target' }
  const missing = auditReferences(scenario).missing
  for (const target of ['nextWhen', 'conditional', 'automatic', 'parent', 'choice', 'repeat', 'empty', 'map', 'insufficient', 'partial', 'complete', 'item-source', 'item', 'unused-item', 'arrival', 'event', 'save-target']) {
    assert.ok(missing.some(message => message.endsWith(`-> missing-${target}`)), target)
  }
  assert.equal(missing.some(message => message.endsWith('-> missing-save-source')), false)
})

test('選べる経路に閉じた循環を混入すると構造検査が検出する', () => {
  const scenario = structuredClone(api.scenario)
  scenario.nodes['audit-trap'] = { ...scenario.nodes[scenario.start], type: 'dialogue', next: 'audit-trap' }
  delete scenario.nodes['audit-trap'].conditionalNext
  delete scenario.nodes['audit-trap'].nextWhen
  delete scenario.nodes['audit-trap'].automaticNext
  scenario.nodes[scenario.start].next = 'audit-trap'
  assert.equal(auditReferences(scenario).canReachEnd.has('audit-trap'), false)
  assert.throws(() => finishFrom({ ...api, scenario }, { ...api.createInitialState(api.scenario), nodeId: 'audit-trap' }), /進行検証 audit-trap.*拒否された操作/)
})

test('構造上の経路があっても取得不能な必須条件で完走が止まることを検出する', () => {
  const scenario = structuredClone(api.scenario)
  const state = baseline.states.find(value => scenario.nodes[value.nodeId].mode === 'free-action')
  const node = scenario.nodes[state.nodeId]
  // A visible inspection/talk cycle still exists; only the exit/required action
  // is gated off. Structural reachability alone must not count as a proof.
  node.options = node.options.map(option => ({ ...option, condition: { type: 'hasInformation', id: 'audit-unobtainable' } }))
  assert.ok(auditReferences(scenario).canReachEnd.has(state.nodeId))
  assert.throws(() => finishFrom({ ...api, scenario }, state), new RegExp(`進行検証 ${state.nodeId}.*未解決の進行`))
})

test('逆順の必須経路と任意込み経路は全場面を完走し、一覧・マップから戻って再選択できる', () => {
  const required = buildPlaythrough(api, true, { reverse: true, returns: true })
  for (const run of [required, alternate]) {
    assert.equal(run.state.nodeId, 'episode-complete')
    assert.equal(run.checkpoints.length, api.revisionData.scenes.length)
    for (let part = 1; part <= 4; part++) assert.equal(run.state.flags[`part${part}_completed`], true)
    for (const point of run.checkpoints) {
      const phase = api.revisionData.scenes.find(scene => scene.id === point.phase)
      assert.deepEqual(phase.exit.requires.filter(id => !point.state.acquiredInformation.includes(id)), [], phase.id)
    }
    assert.ok(run.operations.some(operation => operation.map && operation.action.choiceId === 'return'))
  }
  assert.notDeepEqual(alternate.operations.map(operation => operation.action), baseline.operations.map(operation => operation.action))
})

test('全場面の実際に通った保存位置と会話・調査一覧・移動マップは復元後も最後まで進める', t => {
  // checkpoint.state rewrites nodeId to a menu for old assertion callers. It is
  // not necessarily a playable save position after an automatic phase exit.
  const samples = new Map()
  for (const state of baseline.states) {
    const phase = api.scenario.nodes[state.nodeId].savePhaseId
    if (phase) samples.set(phase, state)
  }
  assert.equal(samples.size, api.revisionData.scenes.length)
  for (const kind of ['dialogue', 'inspect', 'topic', 'map']) {
    const state = alternate.states.find(value => kind === 'map' ? api.scenario.nodes[value.nodeId].map : api.scenario.nodes[value.nodeId].type === kind)
    assert.ok(state, kind)
    samples.set(kind, state)
  }
  for (const [origin, state] of samples) {
    const data = JSON.parse(JSON.stringify(api.createSaveData(state)))
    assert.equal(data.version, 2)
    const restored = api.restoreSaveData(data, [api.scenario])
    assert.equal(restored.ok, true, origin)
    const current = api.reduceGameState(api.scenario, api.createInitialState(api.scenario), { type: 'restore', state: restored.state })
    assert.equal(finishFrom(api, current, { reverse: true, origin }).state.nodeId, 'episode-complete')
  }
  t.diagnostic(`${samples.size} actual save positions resumed to completion`)
})

test('各場面の代表的な一覧・マップ・通常選択で各表示項目を選んでも完走経路が残る', t => {
  // One actual state per phase/menu kind, all its visible choices, then a bounded
  // reverse required-action witness (6000 actions per run in revisionHarness).
  // This covers wrong answers/returns as well as forward choices, not every
  // combination of earlier optional actions or arbitrary edited save states.
  const representatives = new Map()
  for (const state of alternate.states) {
    const node = api.scenario.nodes[state.nodeId]
    if (!['choice', 'topic', 'inspect'].includes(node.type) || node.mode === 'free-action') continue
    const key = `${node.savePhaseId ?? node.sceneId}:${node.map ? 'map' : node.type === 'topic' ? `topic-${node.selection ?? 'topics'}` : node.type}`
    if (!representatives.has(key)) representatives.set(key, state)
  }
  let branches = 0
  for (const state of representatives.values()) {
    for (const choice of api.visibleChoices(api.scenario.nodes[state.nodeId], state)) {
      const next = api.reduceGameState(api.scenario, state, { type: 'choose', choiceId: choice.id })
      assert.equal(finishFrom(api, next, { reverse: true, origin: `${state.nodeId}/${choice.id}` }).state.nodeId, 'episode-complete')
      branches++
    }
  }
  assert.ok(representatives.size > 50)
  t.diagnostic(`${representatives.size} representative states; ${branches} single-choice deviations`)
})
