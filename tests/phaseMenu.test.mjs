import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'

test('話題段階の切替会話の読了時だけメイン一覧へ戻り、旧保存位置も復元する', async () => {
  const api = await loadRevision(), run = buildPlaythrough(api)
  const states = new Map()
  let current = api.createInitialState(api.scenario)
  for (const operation of run.operations) {
    states.set(operation.before, current)
    current = api.reduceGameState(api.scenario, current, operation.action)
  }
  const bridges = api.revisionData.scenes.flatMap(phase => (phase.topicTransitions ?? []).map(bridge => ({phase, bridge})))
  assert.equal(bridges.length, 4)
  for (const {phase, bridge} of bridges) {
    const last = bridge.lines.length > 1 ? `${bridge.id}-${bridge.lines.length}` : bridge.id
    assert.ok(run.operations.some(op => op.before === last && op.after === `${phase.id}-menu`), bridge.id)
    const state = states.get(last)
    const restored = api.restoreSaveData(api.createSaveData(state), [api.scenario])
    assert.equal(restored.ok, true)
    const after = api.reduceGameState(api.scenario, restored.state, {type:'advance'})
    assert.equal(after.nodeId, `${phase.id}-menu`)
    for (const id of bridge.grants) assert.ok(after.acquiredInformation.includes(id))
  }
  assert.ok(run.operations.some(op => op.before === 'p1-schedule-3' && op.after === 'P1-01-speak-mio')
    || run.operations.some(op => op.after === 'P1-01-speak-mio' && op.before.startsWith('p1-schedule')))
})
