import test from 'node:test'
import assert from 'node:assert/strict'
import { selectVisibleHistory } from '../src/features/story/history.ts'
import { loadRevision } from './revisionHarness.mjs'

test('本編全ノードを現在部・プロローグ・旧保存の移行先へ分類する', async () => {
  const { scenario, revisionData } = await loadRevision()
  for (const [id, node] of Object.entries(scenario.nodes)) assert.ok(node.historyScope, id)
  for (const phase of revisionData.scenes) {
    for (const node of Object.values(scenario.nodes).filter(node => node.savePhaseId === phase.id)) assert.equal(node.historyScope, `part-${phase.part}`)
  }
  for (const part of [1, 2, 3, 4]) {
    const boundaries = Object.values(scenario.nodes).filter(node => node.illustration?.id.startsWith(`C${part}-`))
    assert.equal(boundaries.length, 2)
    for (const node of boundaries) assert.equal(node.historyScope, `part-${part}`)
  }
  assert.equal(scenario.nodes['episode-prologue-1'].historyScope, 'prologue')
  assert.equal(scenario.nodes['episode-complete'].historyScope, 'part-4')
  for (const [id, target] of Object.entries(scenario.saveNodeAliases)) if (!scenario.nodes[id]?.savePhaseId && scenario.nodes[id]) assert.equal(scenario.nodes[id].historyScope, scenario.nodes[target].historyScope, id)
})

test('表示だけを現在部に制限し、他部・旧ID・不明IDの保存配列を変更しない', async () => {
  const { scenario } = await loadRevision()
  const history = Object.freeze([
    { speaker: '', text: '導入', nodeId: 'episode-prologue-1' },
    { speaker: '湊', text: '第1部', nodeId: 'P1-01-intro' },
    { speaker: '湊', text: '第1部別場面', nodeId: 'P1-02-intro' },
    { speaker: '湊', text: '旧第1部', nodeId: 'opening-1' },
    { speaker: '湊', text: '第2部', nodeId: 'P2-07-intro' },
    { speaker: '湊', text: '不明', nodeId: 'missing-old-node' },
    { speaker: '湊', text: 'IDなし' },
  ])
  const copy = structuredClone(history)
  assert.deepEqual(selectVisibleHistory(scenario, 'P1-02-intro', history).map(entry => entry.text), ['第1部', '第1部別場面', '旧第1部'])
  assert.deepEqual(selectVisibleHistory(scenario, 'P2-07-intro', history).map(entry => entry.text), ['第2部'])
  assert.deepEqual(selectVisibleHistory(scenario, 'episode-prologue-1', history).map(entry => entry.text), ['導入'])
  assert.deepEqual(selectVisibleHistory(scenario, 'P3-01-intro', history), [])
  assert.deepEqual(history, copy)
  assert.equal(selectVisibleHistory({ nodes: { old: {} } }, 'old', history), history, '範囲指定のないシナリオは従来どおり')
})
