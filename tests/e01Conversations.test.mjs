import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { loadEpisode, playEpisode } from './e01EpisodeHarness.mjs'

const api = await loadEpisode(), { scenario } = api
const before = JSON.parse(readFileSync(new URL('./fixtures/save-v2-before-conversations.json', import.meta.url), 'utf8'))
// Acceptance table from the manuscript's addressees, independent of generated menus.
const people = {
  S01: ['akari'], S02: ['mio'], S03: ['miyahara'], S04: ['building-manager'],
  S07: ['night-manager'], S08: ['night-manager'], S10: ['mio'], S11: ['akari'],
  S12: ['miyahara', 'kuroda'], S13: ['miyahara'], S14: ['mio'], S15: ['technician'],
  S16: ['company-reviewer'], S18: ['company-reviewer'], S19: ['mio'], S20: ['building-manager'],
  S21: ['okumura', 'segawa'], S26: ['mio'], S29: ['okumura'], S30: ['mio'],
}
const run = playEpisode(api, { optional: true, bar: true })
const choose = (state, choiceId) => api.reduceGameState(scenario, state, { type: 'choose', choiceId })
const visible = state => api.visibleChoices(scenario.nodes[state.nodeId], state)
const advance = (state, target) => {
  for (let i = 0; state.nodeId !== target; i++) {
    assert.ok(i < 40, state.nodeId)
    assert.equal(scenario.nodes[state.nodeId].type, 'dialogue')
    state = api.reduceGameState(scenario, state, { type: 'advance' })
  }
  return state
}

test('全対象場面は話す→人物→同じ場面の話題。単独の相手も省略しない', () => {
  for (const [scene, expected] of Object.entries(people)) {
    const menu = run.states.find(s => s.nodeId === `${scene}-menu`)
    assert.ok(menu, scene)
    assert.ok(visible(menu).some(o => o.id === 'speak' && o.label === '話す'), scene)
    assert.ok(!visible(menu).some(o => o.id === 'talk' || o.label === '聞く'), scene)
    assert.deepEqual(choose(menu, 'talk'), menu)
    const selecting = choose(menu, 'speak')
    assert.equal(scenario.nodes[selecting.nodeId].selection, 'person')
    assert.deepEqual(visible(selecting).filter(o => o.id !== 'return').map(o => o.id), expected)
    assert.deepEqual(choose(selecting, 'return'), menu)
    for (const person of expected) {
      const topics = choose(selecting, person)
      assert.equal(scenario.nodes[topics.nodeId].heading, '話す')
      assert.deepEqual(choose(topics, 'return'), selecting)
      for (const topic of visible(topics).filter(o => o.id !== 'return')) {
        assert.ok(topic.id.startsWith(scene + '-'), topic.id)
        const after = advance(choose(topics, topic.id), topics.nodeId)
        assert.ok(after.heardTopics.includes(topic.id))
        // Re-selection keeps the existing repeat response, with the same return.
        const repeated = advance(choose(after, topic.id), topics.nodeId)
        assert.deepEqual(repeated, after)
      }
      for (const invalid of ['mio', 'akari', 'S02-company', 'S03-work', 'S12-action-1', 'S21-action-0'].filter(id => !visible(topics).some(o => o.id === id))) {
        assert.deepEqual(choose(topics, invalid), topics)
      }
    }
    // Present companions without scripted topics are not fabricated as targets.
    for (const person of ['minato', 'fujii', 'saori', 'reiko'].filter(id => !expected.includes(id))) assert.deepEqual(choose(selecting, person), selecting)
  }
})

test('複数人物の話題を混ぜず、事務所の会社窓口は澪への会話として扱う', () => {
  for (const [scene, expected] of Object.entries({
    S02: { mio: ['会社の窓口'] },
    S12: { miyahara: ['会社の確認手続き'], kuroda: ['黒田の担当'] },
    S21: { okumura: ['新しい資料の扱い'], segawa: ['当時の調査'] },
  })) {
    const menu = run.states.find(s => s.nodeId === `${scene}-menu`)
    const selecting = choose(menu, 'speak')
    for (const [person, labels] of Object.entries(expected)) {
      const state = choose(selecting, person)
      assert.deepEqual(visible(state).filter(o => o.id !== 'return').map(o => o.label), labels)
    }
  }
  // Existing scene-presence flags also protect stale saved menus after departure.
  for (const [scene, flag] of [['S01', 'akari_present'], ['S11', 'F_AKARI_LEFT'], ['S29', 'F_OKUMURA_LEFT']]) {
    const menu = run.states.find(s => s.nodeId === `${scene}-menu`)
    const absent = { ...menu, flags: { ...menu.flags, [flag]: scene !== 'S01' } }
    assert.ok(!visible(absent).some(o => o.id === 'speak'))
    assert.deepEqual(choose(absent, 'speak'), absent)
  }
})

test('既存原稿・更新・演出・記録・元の時刻を維持し、必須／任意の完走結果を変えない', () => {
  const hash = x => createHash('sha256').update(JSON.stringify(x)).digest('hex')
  assert.equal(hash(Object.entries(scenario.nodes).filter(([,n]) => n.type === 'dialogue').map(([id, { next: _next, ...rest }]) => [id, rest])), before.dialogueHash)
  const originalTimes = Object.fromEntries(Object.entries(scenario.nodeTimes).filter(([id]) => !/^S\d\d-(?:topic|talk)-.+$/.test(id)))
  assert.equal(hash([scenario.scenes, scenario.records, originalTimes]), before.presentationHash)
  const normalized = state => ({ ...state, heardTopics: [...state.heardTopics].sort(), inspectedTargets: [...state.inspectedTargets].sort(), acquiredInformation: [...state.acquiredInformation].sort() })
  for (const { optional, reverse, state } of before.endStates) {
    assert.deepEqual(normalized(playEpisode(api, { optional, reverse, bar: true, wrong: true }).state), normalized(state))
  }
  const early = run.states.find(s => s.nodeId === 'S01-menu')
  assert.ok(!visible(early).some(o => o.id === 'proceed'))
  const after = advance(choose(choose(choose(early, 'speak'), 'akari'), 'S01-last-seen'), 'S01-topic-akari')
  assert.equal(api.choiceStatus(scenario.nodes[after.nodeId], visible(after).find(o => o.id === 'S01-last-seen'), after), '既読')
  assert.ok(!after.acquiredInformation.includes('F_WORK_SITE'))
})

test('main由来の旧会話メニュー・会話途中24保存を無変更で復元し、人物一覧／元会話から完走できる', () => {
  assert.equal(before.sourceCommit, 'b281d0d7442d557936e82470c867d99f2b1dec5b')
  assert.equal(before.saves.length, 24)
  for (const saved of before.saves) {
    const original = JSON.stringify(saved)
    const restored = api.restoreSaveData(saved, api.scenarioCatalog)
    const { version: _version, ...expected } = saved
    assert.deepEqual(restored, { ok: true, state: expected })
    assert.equal(JSON.stringify(saved), original)
    assert.equal(playEpisode(api, { state: restored.state }).state.nodeId, 'episode-complete')
    if (scenario.nodes[saved.nodeId].type === 'topic' && !saved.nodeId.startsWith('S01-opening-')) assert.equal(scenario.nodes[saved.nodeId].selection, 'person', saved.nodeId)
  }
})
