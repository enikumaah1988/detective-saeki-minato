import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'
let api, full, mandatory
before(async () => { api = await loadRevision(); full = buildPlaythrough(api); mandatory = buildPlaythrough(api, true) })
test('必須項目のみ・任意項目込みの両経路で4部を完走する', () => {
  for (const run of [full, mandatory]) {
    assert.equal(run.state.nodeId, 'episode-complete')
    assert.equal(run.checkpoints.length, api.revisionData.scenes.length)
    for (let part = 1; part <= 4; part++) assert.equal(run.state.flags[`part${part}_completed`], true)
    for (const id of ['I01', 'I02', 'I03', 'I04', 'E01', 'E02', 'E03', 'W01', 'E04', 'W02', 'I05', 'W03']) assert.ok(run.state.acquiredInformation.includes(id), id)
  }
  assert.ok(full.operations.length > mandatory.operations.length)
})
test('場面の時刻は順行し、戻る/再訪で表示日時が逆戻りせず、年を省く', () => {
  const times = api.revisionData.scenes.map(scene => scene.sceneTime)
  assert.deepEqual(times, [...times].sort())
  const latest = full.checkpoints.at(-1).state
  assert.match(api.selectDateLabel(api.scenario, { ...latest, nodeId: 'P1-03-menu' }), /10月12日/)
  assert.doesNotMatch(api.selectDateLabel(api.scenario, latest), /年/)
})
test('澪は外出に同行しない。相手の切替でも同じ部屋の背景を保持する', () => {
  for (const phase of api.revisionData.scenes) {
    for (const action of [...phase.ask, ...phase.speak]) {
      const node = api.scenario.nodes[action.id]
      if (phase.locationId !== 'office') assert.equal(node.stage.characters.some(person => person.characterId === 'mio'), false, action.id)
      assert.equal(node.stage.backgroundId, api.scenario.nodes[`${phase.id}-menu`].stage.backgroundId, action.id)
    }
  }
})
test('調べる前は会社受付と宮原を選べず、認識してから会話対象になる', () => {
  const record = phase => mandatory.checkpoints.find(point => point.phase === phase).state
  const company = { ...record('P2-02-EXT'), nodeId: 'P2-02-menu' }
  assert.equal(api.visibleChoices(api.scenario.nodes['P2-02-menu'], company).some(option => option.id === 'talk' || option.id === 'speak'), false)
  const recognized = { ...company, acquiredInformation: [...company.acquiredInformation, 'recognized-company-reception'] }
  assert.ok(api.visibleChoices(api.scenario.nodes['P2-02-menu'], recognized).some(option => option.id === 'speak'))
  const manager = { ...record('P2-03-EXIT'), nodeId: 'P2-04-menu' }
  assert.equal(api.visibleChoices(api.scenario.nodes['P2-04-menu'], manager).some(option => option.id === 'speak'), false)
})
test('人物記録は話題登場で未知顔、対面で顔、新しい情報だけ追記する', () => {
  const state = mandatory.checkpoints.find(point => point.phase === 'P1-03').state
  const records = api.selectInvestigationRecords(state, api.scenario.records)
  const brother = records.find(record => record.id === 'naoto')
  assert.equal(brother.imageSrc, undefined); assert.equal(brother.details.some(text => /29歳|休暇|脅し/.test(text)), false)
  const met = mandatory.checkpoints.find(point => point.phase === 'P3-02').state
  assert.ok(api.selectInvestigationRecords(met, api.scenario.records).find(record => record.id === 'naoto').imageSrc)
  const final = api.selectInvestigationRecords(full.state, api.scenario.records)
  assert.ok(final.find(record => record.id === 'naoto').details.some(text => /脅し/.test(text)))
  assert.equal(final.find(record => record.id === 'narumi').imageSrc, undefined)
})
test('旧稿の集約条件で、考える前の聞き取りや証言意思の未読情報を先取りしない', () => {
  const hearing = mandatory.checkpoints.find(point => point.phase === 'P1-03').state
  assert.equal(hearing.acquiredInformation.includes('I01'),false)
  const witness = mandatory.checkpoints.find(point => point.phase === 'P3-04').state
  assert.ok(witness.acquiredInformation.includes('naoto-witness'))
  assert.ok(witness.acquiredInformation.includes('naoto-threat'))
  assert.equal(witness.acquiredInformation.includes('W01'),false)
  assert.equal(api.selectInvestigationRecords(witness,api.scenario.records).some(record=>record.id==='W01'),false)
  assert.ok(mandatory.checkpoints.find(point=>point.phase==='P3-05').state.acquiredInformation.includes('W01'))
})
test('考えると整理するは必要場面だけ、情報不足時には解放しない', () => {
  const initial = { ...api.createInitialState(api.scenario), nodeId: 'P1-03-menu' }
  assert.equal(api.visibleChoices(api.scenario.nodes[initial.nodeId], initial).some(option => ['think', 'organize'].includes(option.id)), false)
  for (const phase of api.revisionData.scenes) {
    const hasOrganize = phase.organize?.length || phase.think.some(action => action.interaction === 'organize')
    if (hasOrganize) assert.ok([2, 4].includes(phase.part))
  }
})
test('4部の始まり・終わりの8接続点は推理と独立して必ず通る', () => {
  assert.deepEqual(mandatory.boundaries, ['C1-IN', 'C1-OUT', 'C2-IN', 'C2-OUT', 'C3-IN', 'C3-OUT', 'C4-IN', 'C4-OUT'])
})
test('新セーブは取得内容を増やさず完全復元、旧v2は進捗を維持して改稿へ移行', () => {
  for (const { state } of mandatory.checkpoints) assert.deepEqual(api.restoreSaveData(api.createSaveData(state), [api.scenario]).state, state)
  const old = { version: 2, scenarioId: api.scenario.id, nodeId: 'departure', flags: { request_accepted: true }, heardTopics: ['morning-contact-work'], inspectedTargets: [], acquiredInformation: ['I01', 'search-photo'] }
  const restored = api.restoreSaveData(old, [api.scenario]); assert.equal(restored.ok, true); assert.equal(restored.state.nodeId, 'P1-06-menu')
  for (const id of ['I01', 'IT01', 'F09', 'akari-contact']) assert.ok(restored.state.acquiredInformation.includes(id))
})
test('移動は室内→外→マップ→目的地外観。マップ取消は進捗・時刻を変更しない', () => {
  const state = mandatory.checkpoints.find(point => point.phase === 'P2-01').state
  const exit = api.reduceGameState(api.scenario, state, { type: 'choose', choiceId: 'move' })
  assert.equal(api.scenario.nodes[exit.nodeId].options[0].label, '外に出る')
  const outside = { ...state, nodeId: 'P2-01-outside' }, map = api.reduceGameState(api.scenario, outside, { type: 'choose', choiceId: 'map' })
  const canceled = api.reduceGameState(api.scenario, map, { type: 'choose', choiceId: 'return' }); assert.deepEqual(canceled, outside)
  const moved = api.reduceGameState(api.scenario, map, { type: 'choose', choiceId: 'company' })
  assert.equal(api.scenario.nodes[moved.nodeId].stage.backgroundId, 'company-exterior')
  assert.deepEqual(api.scenario.arrivalEvents, [])
})
test('推理誤答で同じ問いに戻り、前問の正解と取得情報を維持する', () => {
  const phase = api.revisionData.scenes.find(phase => phase.organize?.some(action => action.questionSetId === 'Q1'))
  let state = { ...mandatory.checkpoints.find(point => point.phase === phase.id).state, nodeId: `${phase.id}-Q1-1` }
  state = api.reduceGameState(api.scenario, state, { type: 'choose', choiceId: 'b' }); assert.equal(state.flags['Q1-1-solved'], true)
  state = api.reduceGameState(api.scenario, state, { type: 'choose', choiceId: 'a' })
  while (api.selectCurrentNode(api.scenario, state).type === 'dialogue') state = api.reduceGameState(api.scenario, state, { type: 'advance' })
  assert.equal(state.nodeId, `${phase.id}-Q1-2`); assert.equal(state.flags['Q1-1-solved'], true)
})
