import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from './viteServer.mjs'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
let scenario, legacy, createInitialState, reduceGameState, selectCurrentNode, visibleChoices, createSaveData, restoreSaveData, selectInvestigationRecords, selectSceneStage, resolveExpression
before(async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    ({ episode1Part1: scenario } = await server.ssrLoadModule('/src/data/scenario/episode1Part1.ts'));
    ({ episode1Part1Legacy: legacy } = await server.ssrLoadModule('/src/data/scenario/episode1Part1Legacy.ts'));
    ({ createInitialState, reduceGameState, selectCurrentNode } = await server.ssrLoadModule('/src/features/story/state.ts'));
    ({ visibleChoices } = await server.ssrLoadModule('/src/features/story/freeAction.ts'));
    ({ createSaveData, restoreSaveData } = await server.ssrLoadModule('/src/features/story/saveData.ts'));
    ({ selectInvestigationRecords } = await server.ssrLoadModule('/src/features/story/investigation.ts'));
    ({ selectSceneStage } = await server.ssrLoadModule('/src/features/story/scene.ts'));
    ({ resolveExpression } = await server.ssrLoadModule('/src/data/presentation.ts'));
  } finally { await server.close() }
})
const advance = state => reduceGameState(scenario, state, { type: 'advance' })
const choose = (state, choiceId) => reduceGameState(scenario, state, { type: 'choose', choiceId })
function read(state) { let count = 0; while (selectCurrentNode(scenario, state).type === 'dialogue') { assert.ok(count++ < 150); state = advance(state) } return state }
const menu = () => read(createInitialState(scenario))
const ask = (state, id) => read(choose(choose(state, 'talk'), id))
const inspect = (state, id) => read(choose(choose(state, 'look'), id))
const travel = (state, id) => read(choose(choose(state, 'move'), id))
const inquire = (state = menu()) => ['morning', 'contact', 'workplace'].reduce(ask, state)
const accept = () => read(choose(choose(inquire(), 'talk'), 'request'))
const company = () => travel(read(choose(accept(), 'organize')), 'company')
function building() {
  let state = ask(company(), 'leave-and-appointment')
  state = read(choose(choose(state, 'talk'), 'meet-kuroda'))
  state = ask(state, 'meeting-purpose')
  return travel(state, 'building')
}
function part2Exit() {
  let state = ask(building(), 'naoto-sighting')
  state = inspect(state, 'journal'); state = inspect(state, 'stairs')
  state = ask(state, 'police-record'); state = inspect(state, 'envelope')
  state = travel(state, 'office')
  state = read(choose(state, 'organize'))
  state = choose(state, 'appointment'); state = choose(state, 'accident')
  return read(choose(state, 'contradiction'))
}
function part3Exit() {
  let state = travel(part2Exit(), 'building')
  state = ask(state, 'naoto-testimony'); state = ask(state, 'naoto-threat'); state = ask(state, 'witness-position')
  return read(choose(state, 'organize'))
}
test('日常会話→インターホン→来訪→要件。導入時にあかりは表示しない', () => {
  const initial = createInitialState(scenario)
  assert.deepEqual(selectSceneStage(scenario, initial.nodeId).characters.map(p => p.characterId), ['minato', 'mio'])
  let state = initial, texts = []
  while (selectCurrentNode(scenario, state).type === 'dialogue') { texts.push(selectCurrentNode(scenario, state).text); state = advance(state) }
  const joined = texts.join('\n')
  assert.ok(joined.indexOf('コーヒー') < joined.indexOf('インターホンが鳴った'))
  assert.ok(joined.indexOf('インターホンが鳴った') < joined.indexOf('どのようなご相談'))
  assert.ok(state.acquiredInformation.includes('met-akari'))
})
test('質問を分割し、読了後にだけ取得。聞いた内容により話題を解放し、任意項目を残す', () => {
  let state = menu()
  const options = () => visibleChoices(scenario.nodes['office-topics'], state).map(o => o.id)
  assert.deepEqual(options(), ['morning', 'contact', 'workplace', 'return'])
  const speaking = choose(choose(state, 'talk'), 'contact')
  assert.equal(speaking.acquiredInformation.includes('contact'), false)
  state = read(speaking)
  assert.ok(options().includes('daily') && options().includes('police-consultation'))
  assert.equal(options().includes('family'), false)
  state = ask(state, 'morning'); state = ask(state, 'workplace')
  assert.ok(state.acquiredInformation.includes('I01'))
  assert.ok(options().includes('family') && options().includes('request'))
  assert.deepEqual(visibleChoices(scenario.nodes['office-menu'], state).map(o => o.id), ['talk', 'look', 'think'])
  const repeated = ask(state, 'contact')
  assert.deepEqual(repeated.acquiredInformation, state.acquiredInformation)
  assert.equal(choose(choose(state, 'talk'), 'contact').nodeId, 'contact-summary')
})
test('写真は中央提示の確認後に取得。第1部は事務所で整理して完了、移動は第2部', () => {
  let state = choose(choose(inquire(), 'talk'), 'request')
  while (state.nodeId !== 'photo-received') state = advance(state)
  assert.equal(state.acquiredInformation.includes('search-photo'), false)
  assert.equal(selectCurrentNode(scenario, state).acquisition.itemId, 'naoto-photo')
  state = read(advance(state))
  assert.equal(state.nodeId, 'departure'); assert.equal(state.flags.part1_completed, undefined)
  assert.equal(choose(state, 'move'), state)
  const boundary = choose(state, 'organize')
  assert.equal(selectSceneStage(scenario, boundary.nodeId).backgroundId, 'office-before-noon')
  state = read(boundary)
  assert.equal(state.flags.part1_completed, true)
  assert.equal(state.nodeId, 'travel-ready')
  const mapState = choose(state, 'move')
  assert.equal(scenario.nodes[mapState.nodeId].map.current, 'office')
  assert.equal(choose(mapState, 'return').nodeId, 'travel-ready')
  assert.equal(travel(state, 'company').nodeId, 'company-menu')
})
test('必要情報が揃うまで依頼・整理・移動・追加質問を拒否し、考えるは進捗を変えない', () => {
  const state = menu()
  assert.equal(choose(choose(state, 'talk'), 'request').nodeId, 'office-topics')
  assert.strictEqual(choose(state, 'organize'), state)
  assert.strictEqual(choose(state, 'move'), state)
  const thought = read(choose(state, 'think'))
  assert.deepEqual(thought, state)
  const atBuilding = building()
  assert.strictEqual(choose(atBuilding, 'move'), atBuilding)
  const atPart4 = part3Exit()
  assert.strictEqual(choose(atPart4, 'organize'), atPart4)
})
test('4部を必須項目だけで完走。独立した証言・文書の照合前に結論へ進めない', () => {
  let state = part3Exit()
  assert.equal(state.flags.part1_completed, true); assert.equal(state.flags.part2_completed, true); assert.equal(state.flags.part3_completed, true)
  assert.equal(state.acquiredInformation.includes('safety-reported'), true)
  state = inspect(state, 'original')
  assert.equal(choose(choose(state, 'look'), 'positions').nodeId, 'part4-targets')
  state = ask(state, 'miyahara-testimony'); state = inspect(state, 'positions')
  state = read(choose(state, 'organize'))
  state = choose(state, 'combined'); state = choose(state, 'push'); state = read(choose(state, 'position'))
  assert.equal(state.nodeId, 'episode-complete')
  assert.equal(state.flags.part4_completed, true)
  for (const id of ['I01','I02','I03','I04','W01','E01','E02','E03','E04','W02','I05','W03']) assert.ok(state.acquiredInformation.includes(id), id)
})
test('推理の誤答はヒントを経て同じ問に戻り、正解済みの前問を保持する', () => {
  const state = { ...part2Exit(), nodeId: 'reason1-q1', flags: {} }
  const wrong = read(choose(state, 'work'))
  assert.equal(wrong.nodeId, 'reason1-q1')
  const correct = choose(wrong, 'appointment')
  const retry = read(choose(correct, 'money'))
  assert.equal(retry.nodeId, 'reason1-q2'); assert.equal(retry.flags['reason1-q1-solved'], true)
  assert.equal(retry.flags['reason1-q2-solved'], undefined)
})
test('対面済みの顔・未対面UNKNOWN・写真の所持を、取得状況から導出する', () => {
  const records = state => selectInvestigationRecords(state, scenario.records)
  let state = menu()
  assert.ok(records(state).find(r => r.id === 'akari').imageSrc)
  assert.equal(records(state).find(r => r.id === 'naoto').imageSrc, undefined)
  state = accept()
  assert.equal(records(state).find(r => r.id === 'naoto-photo').category, 'belongings')
  assert.equal(records(state).find(r => r.id === 'naoto').imageSrc, undefined)
  state = travel(part2Exit(), 'building')
  assert.ok(records(state).find(r => r.id === 'naoto').imageSrc)
  assert.equal(records(state).some(r => r.id === 'W01'), false)
  assert.doesNotMatch(records(state).flatMap(r => r.details).join('\n'), /今回は.*できない|今回は閲覧のみ/)
})
test('持ち物の使用は所持・場面条件を満たす時だけ。写真提示で未確認事実を取得しない', () => {
  const initial = menu()
  assert.strictEqual(reduceGameState(scenario, initial, { type: 'use-item', itemId: 'naoto-photo' }), initial)
  const state = company()
  const used = reduceGameState(scenario, state, { type: 'use-item', itemId: 'naoto-photo' })
  assert.equal(used.nodeId, 'photo-company')
  const returned = read(used)
  assert.equal(returned.nodeId, 'company-menu')
  assert.deepEqual(returned.acquiredInformation, state.acquiredInformation)
  assert.strictEqual(reduceGameState(scenario, state, { type: 'use-item', itemId: 'smartphone' }), state)
})
test('旧全ノードとversion2を維持。旧I01を分割情報に移行し、新セーブはそのまま復元', () => {
  for (const nodeId of Object.keys(legacy.nodes)) assert.ok(scenario.nodes[nodeId], nodeId)
  for (const state of [menu(), inquire(), accept(), company(), part2Exit(), part3Exit()]) {
    const save = createSaveData(state); assert.equal(save.version, 2)
    assert.deepEqual(restoreSaveData(JSON.parse(JSON.stringify(save)), [scenario]).state, state)
  }
  const old = { ...menu(), nodeId: 'departure', flags: { request_accepted: true }, heardTopics: ['morning-contact-work'], acquiredInformation: ['I01', 'search-photo'] }
  const loaded = restoreSaveData(createSaveData(old), [scenario])
  assert.equal(loaded.ok, true)
  for (const id of ['morning','contact','workplace','akari-contact']) assert.ok(loaded.state.acquiredInformation.includes(id))
  assert.ok(visibleChoices(scenario.nodes.departure, loaded.state).some(option => option.id === 'organize'))
})
test('全遷移先と表示IDが有効。新しい登場人物や証拠を先取りしない', () => {
  createInitialState(scenario)
  for (const [id, node] of Object.entries(scenario.nodes)) {
    const targets = node.type === 'dialogue' ? [node.next] : node.type === 'think' ? [node.complete.next,node.partial.next,node.insufficient.next] : 'options' in node ? node.options.flatMap(o => [o.next, ...(o.repeatNext ? [o.repeatNext] : [])]) : []
    for (const target of targets) assert.ok(scenario.nodes[target], `${id} → ${target}`)
    for (const person of selectSceneStage(scenario, id).characters ?? []) assert.notEqual(resolveExpression(person.characterId, person.expression).name, '未登録の表情', `${id}:${person.characterId}:${person.expression}`)
    if (node.type === 'dialogue') assert.match(node.text, /[。？！!?」]$/u)
  }
})
test('取り込んだ8人70素材のSHA256が制作元の取り込み記録に一致', async () => {
  const manifest = JSON.parse(await readFile(new URL('../docs/imported-character-assets.json', import.meta.url), 'utf8'))
  assert.equal(manifest.files.length, 70)
  for (const entry of manifest.files) {
    const buffer = await readFile(new URL(`../${entry.file}`, import.meta.url))
    assert.equal(createHash('sha256').update(buffer).digest('hex'), entry.sha256)
    assert.equal(buffer.subarray(0,8).toString('hex'), '89504e470d0a1a0a')
  }
})
