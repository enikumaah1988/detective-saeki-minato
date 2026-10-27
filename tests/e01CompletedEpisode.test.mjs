import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { loadEpisode, playEpisode } from './e01EpisodeHarness.mjs'
import { auditReferences } from './progressionAudit.mjs'
import { auditPresentation } from './presentationAudit.mjs'
const api = await loadEpisode()
const { scenario } = api

test('全30シーンと任意BARの遷移・演出参照・終了経路が有効', () => {
  assert.equal(Object.keys(scenario.scenes).filter(id => /^S\d\d$/.test(id)).length, 30)
  const audit = auditReferences(scenario)
  assert.deepEqual(audit.missing, [])
  assert.deepEqual(auditPresentation(scenario), [])
  for (const id of Object.keys(scenario.nodes)) {
    assert.ok(audit.reachableFromStart.has(id), id)
    assert.ok(audit.canReachEnd.has(id), id)
  }
})

test('追加人物の出番・救助後の退出・BAR離席をノードから復元する', () => {
  const at = id => api.selectCurrentNode(scenario, { ...api.createInitialState(scenario), nodeId: id })
  const cast = id => at(id).stage.characters.map(person => person.characterId)
  for (const [scene, people] of Object.entries({ S04: ['building-manager'], S05: ['building-manager'], S06: ['building-manager'],
    S07: ['night-manager'], S08: ['night-manager'], S09: ['night-manager'], S10: ['rescue-worker'], S15: ['building-manager', 'technician'],
    S16: ['company-reviewer'], S18: ['company-reviewer'], S20: ['building-manager'] })) {
    for (const person of people) assert.ok(cast(`${scene}-intro`).includes(person), scene + '/' + person)
  }
  assert.equal(at('S09-intro').stage.backgroundId, 'building-storage-door')
  assert.equal(at('S10-intro').stage.backgroundId, 'building-storage-open')
  const find = text => Object.entries(scenario.nodes).find(([,node]) => node.type === 'dialogue' && node.text.startsWith(text))[0]
  const transport = find('（隊員が直人を搬送）'), outside = find('（救急車の扉が閉まる。')
  assert.ok(!cast(transport).includes('rescue-worker'))
  assert.equal(at(outside).stage.backgroundId, 'building-exterior')
  assert.equal(at('S10-menu').stage.backgroundId, 'building-exterior')
  for (const id of ['BAR-A','BAR-B']) {
    assert.ok(cast(`${id}-intro`).includes('anna'))
    assert.ok(cast(`${id}-menu`).includes('reiko'))
    assert.ok(!cast(`${id}-menu`).includes('anna'))
  }
  assert.ok(!cast(find('（杏奈は静かに席を離れる）')).includes('anna'))
  for (const [id, node] of Object.entries(scenario.nodes)) {
    if (id.startsWith('BAR') && node.type === 'dialogue' && node.speakerId === 'anna' && id.includes('-action-')) {
      assert.ok(cast(node.next).includes('anna'), node.next)
    }
  }
  for (const [id,node] of Object.entries(scenario.nodes)) {
    const people = cast(id)
    assert.ok(people.length <= 3, id)
    assert.ok(!people.includes('fujii') && !people.includes('saori'), id)
    if (node.type === 'dialogue' && node.speakerId === 'anna') assert.ok(people.includes('anna'), id)
    if (['S10-transported','S10-outside','S16-kuroda','BAR-A-anna','BAR-B-anna'].includes(node.sceneId)) {
      const state = { ...api.createInitialState(scenario), nodeId: id }
      const restored = api.restoreSaveData(api.createSaveData(state), api.scenarioCatalog)
      assert.equal(restored.ok, true)
      assert.deepEqual(api.selectCurrentNode(scenario, restored.state).stage, at(id).stage, id)
    }
  }
})
test('原稿転記の全発言とト書きが実行データに保持される', () => {
  assert.equal(createHash('sha256').update(JSON.stringify(api.source)).digest('hex'), '3872a0c640af88cdd110127af239bd1cbaaf3e5e81377f7194b9ce20708d1faa')
  const values = Object.values(scenario.nodes).filter(node => node.type === 'dialogue')
  for (const scene of api.source) for (const line of [...scene.body, ...scene.actions.flatMap(action => action.lines.map(line => action.kind === 'think' ? { ...line, speakerId: 'narrator' } : line)), ...scene.questions.flatMap(q => [...q.answer, ...q.wrong])]) {
    if (line.text.startsWith('（プレイヤーの整理：')) continue
    assert.ok(values.some(node => node.text === line.text && node.speakerId === line.speakerId), scene.id + ': ' + line.text)
  }
})
for (const optional of [false, true]) for (const reverse of [false, true]) test(`全編完走、任意=${optional}、逆順=${reverse}、全場面で保存復帰`, () => {
  const run = playEpisode(api, { optional, reverse, bar: optional, wrong: true })
  assert.equal(run.state.nodeId, 'episode-complete')
  for (let n = 1; n <= 30; n++) assert.ok(run.states.some(state => scenario.nodes[state.nodeId].sceneId === `S${String(n).padStart(2, '0')}`))
  for (const flag of ['F_NAOTO_RESCUED', 'F_AKARI_REUNION', 'F_COMPANY_AUTH', 'F_AUDIT_QUESTIONS', 'F_POLICE_HANDOFF', 'F_FINAL_HANDOFF', 'F_NAOTO_RECOVERY']) assert.equal(run.state.flags[flag], true, flag)
  assert.equal(run.state.flags['BAR-A_VISITED'] === true, optional)
  assert.equal(run.state.flags['BAR-B_VISITED'] === true, optional)
  const seen = new Set()
  for (const state of run.states) {
    const restored = api.restoreSaveData(JSON.parse(JSON.stringify(api.createSaveData(state))), api.scenarioCatalog)
    assert.deepEqual(restored, { ok: true, state })
    const id = scenario.nodes[state.nodeId].sceneId
    if (seen.has(id)) continue
    seen.add(id)
    assert.equal(playEpisode(api, { state: restored.state }).state.nodeId, 'episode-complete')
  }
})
test('警察の非公開シーンでは取得情報・フラグ・記録を増やさず、佐伯側履歴に表示しない', () => {
  const run = playEpisode(api)
  for (const id of ['S22', 'S24', 'S25', 'S28']) {
    const states = run.states.filter(state => scenario.nodes[state.nodeId].sceneId === id)
    const last = run.states[run.states.indexOf(states.at(-1)) + 1]
    assert.ok(states.length)
    for (const state of [...states, last]) for (const key of ['flags', 'heardTopics', 'inspectedTargets', 'acquiredInformation']) assert.deepEqual(state[key], states[0][key], id + '/' + key)
    const history = states.map(state => ({ nodeId: state.nodeId, speaker: '', text: scenario.nodes[state.nodeId].text }))
    assert.deepEqual(api.selectVisibleHistory(scenario, 'S26-intro', history), [])
    assert.deepEqual(api.selectInvestigationRecords(last, scenario.records), api.selectInvestigationRecords(states[0], scenario.records))
  }
})
test('各選択枝・全誤答・戻る・再訪後のv2復元から終了できる', t => {
  let count = 0
  const run = playEpisode(api, { optional: true, bar: true })
  for (const state of run.states) {
    for (const choice of api.visibleChoices(scenario.nodes[state.nodeId], state)) {
      const after = api.reduceGameState(scenario, state, { type: 'choose', choiceId: choice.id })
      const restored = api.restoreSaveData(api.createSaveData(after), api.scenarioCatalog)
      assert.equal(restored.ok, true)
      assert.equal(playEpisode(api, { state: restored.state }).state.nodeId, 'episode-complete', `${state.nodeId}/${choice.id}`)
      count++
    }
  }
  t.diagnostic(`${count} branches`)
})
test('救助と会社調査の日付を維持し、必須の考える・聞く・調べるを省略できない', () => {
  const run = playEpisode(api)
  for (const [id, expression] of [['S07-intro', /10月7日.*夜/], ['S08-intro', /10月8日.*朝/], ['S10-intro', /10月8日.*午前/], ['S11-intro', /10月8日.*夕方/], ['S18-intro', /10月15日/]]) {
    assert.match(api.selectDateLabel(scenario, run.states.find(state => state.nodeId === id)), expression)
  }
  for (const id of ['S07', 'S08', 'S09', 'S12', 'S13', 'S14', 'S15', 'S16', 'S18', 'S19', 'S20', 'S21', 'S26', 'S29', 'S30']) {
    const menu = scenario.nodes[`${id}-menu`]
    const ready = run.states.filter(state => state.nodeId === `${id}-menu`).at(-1)
    const exit = menu.options.find(option => ['proceed', 'move', 'organize'].includes(option.id) && option.condition)
    assert.ok(exit?.condition?.ids.length, id)
    for (const missing of exit.condition.ids) {
      const incomplete = { ...ready, acquiredInformation: ready.acquiredInformation.filter(value => value !== missing) }
      assert.equal(api.visibleChoices(menu, incomplete).some(option => option.id === exit.id), false, `${id}/${missing}`)
    }
  }
})
test('旧稿と第1部限定版の保存・NEW GAME接続は保持', () => {
  assert.equal(api.defaultScenario.id, 'gray-testimony-ver001-part1')
  for (const legacy of [api.defaultScenario, api.firstPart]) for (const nodeId of Object.keys(legacy.nodes)) {
    const saved = api.createSaveData({ ...api.createInitialState(legacy), nodeId })
    assert.deepEqual(api.restoreSaveData(saved, api.scenarioCatalog), api.restoreSaveData(saved, [legacy]))
  }
  assert.equal(api.firstPart.nodes['S06-end'].type, 'end')
})
test('考えるは名前欄を隠し、あかりと奥村は退出後の人物表示から外れる', () => {
  const run = playEpisode(api, { optional: true })
  for (const state of run.states) {
    const node = scenario.nodes[state.nodeId]
    if (node.type === 'choice' && node.mode === 'free-action') {
      const think = node.options.find(option => option.id === 'think')
      if (think && !think.next.startsWith('S01-')) assert.equal(api.dialogueSpeaker(scenario.nodes[think.next], state), '')
    }
  }
  for (const [id, person] of [['S11-finish', 'akari'], ['S29-finish', 'okumura']]) {
    const state = run.states.find(state => state.nodeId === id)
    assert.equal(api.selectCurrentNode(scenario, state).stage.characters.some(value => value.characterId === person), false)
  }
})
