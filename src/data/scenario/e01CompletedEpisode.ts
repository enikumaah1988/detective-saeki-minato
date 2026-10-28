import type { Choice, Condition, Scenario, Stage, StateUpdate } from '../../types/scenario'
import type { InvestigationEntry } from '../../types/investigation'
import { e01CompletedPart1 } from './e01CompletedPart1'
import { completedContinuationSource, type CompletedLine, type CompletedScene } from './e01CompletedContinuationSource'

const nodes: Scenario['nodes'] = { ...e01CompletedPart1.nodes }
const scenes = { ...e01CompletedPart1.scenes }
const records: InvestigationEntry[] = [...(e01CompletedPart1.records ?? [])]
const times = { ...e01CompletedPart1.nodeTimes }
const police = new Set(['S22', 'S24', 'S25', 'S28'])
const sources = new Map(completedContinuationSource.map(scene => [scene.id, scene]))
const all = (ids: string[]): Condition => ({ type: 'hasAllInformation', ids })
const info = (id: string): StateUpdate[] => [{ type: 'addInformation', id }, { type: 'setFlag', id, value: true }]
const cast = (ids: string[]): NonNullable<Stage['characters']> => ids.map((characterId, index) => ({ characterId, expression: 'normal',
  position: ids.length === 1 ? 'left' : ids.length === 2 ? index === 0 ? 'left' : 'right' : index === 0 ? 'left' : index === 1 ? 'center' : 'right' }))
const sceneDates: Record<string, string> = {
  S07: '2026年10月7日（水）夜', S08: '2026年10月7日（水）深夜〜10月8日（木）朝', S09: '2026年10月8日（木）午前', S10: '2026年10月8日（木）午前', S11: '2026年10月8日（木）夕方',
  S12: '2026年10月9日（金）', S13: '2026年10月9日（金）', S14: '2026年10月12日（月）', S15: '2026年10月12日（月）', S16: '2026年10月13日（火）',
  S17: '2026年10月14日（水）', 'BAR-A': '2026年10月14日（水）夜', S18: '2026年10月15日（木）', S29: '後日', S30: '後日・夕方', 'BAR-B': '後日・夜',
}
function setup(id: string) {
  const office = ['S11', 'S14', 'S17', 'S19', 'S23', 'S26', 'S27', 'S29', 'S30'].includes(id)
  const backgroundId = id.startsWith('BAR') ? 'bar-amayadori' : police.has(id) || id === 'S21' ? 'police-meeting' : id === 'S20' ? 'building-stairs'
    : id === 'S07' ? 'building-equipment' : id === 'S09' ? 'building-storage-door' : id === 'S10' ? 'building-storage-open'
      : ['S08', 'S15'].includes(id) ? 'building-room' : office ? id === 'S11' || id === 'S30' ? 'office-evening' : 'office-afternoon' : 'company-lounge'
  const people = police.has(id) ? ['segawa', 'kuroda', 'okumura'] : id === 'S21' ? ['segawa', 'minato', 'okumura']
    : id === 'S11' ? ['mio', 'minato', 'akari'] : id === 'S29' ? ['mio', 'minato', 'okumura'] : id === 'S12' ? ['miyahara', 'minato', 'kuroda']
    : id === 'S16' || id === 'S18' ? ['miyahara', 'minato', 'company-reviewer'] : id === 'S13' ? ['minato', 'miyahara']
    : id === 'S15' ? ['building-manager', 'minato', 'technician'] : id === 'S20' ? ['minato', 'building-manager']
    : ['S07', 'S08', 'S09'].includes(id) ? ['mio', 'minato', 'night-manager'] : id === 'S10' ? ['mio', 'minato', 'rescue-worker'] : ['minato', 'mio']
  scenes[id] = { backgroundId, characters: cast(id.startsWith('BAR') ? ['reiko', 'minato'] : people) }
  for (const person of scenes[id].characters ?? []) {
    if (id === 'S11' && person.characterId === 'akari') person.condition = { type: 'flag', id: 'F_AKARI_LEFT', value: false }
    if (id === 'S29' && person.characterId === 'okumura') person.condition = { type: 'flag', id: 'F_OKUMURA_LEFT', value: false }
  }
}
function meta(id: string) {
  return { stage: scenes[id], sceneId: id, historyScope: police.has(id) ? `police-${id}` : id, savePhaseId: id }
}
function add(id: string, name: string, node: Scenario['nodes'][string]) {
  nodes[name] = node
  times[name] = sceneDates[id] ?? '10月15日以降'
  if (id === 'S08' && (name.startsWith('S08-discovery') || name.startsWith('S08-finish'))) times[name] = '2026年10月8日（木）朝'
}
function dialogue(id: string, name: string, lines: CompletedLine[], next: string, updates: StateUpdate[] = []) {
  if (!lines.length) throw new Error(`会話が空です: ${name}`)
  lines.forEach((line, index) => add(id, index ? `${name}-${index}` : name, { ...meta(id), type: 'dialogue', ...line,
    next: index === lines.length - 1 ? next : `${name}-${index + 1}`, ...(index === lines.length - 1 ? { updates } : {}) }))
  return name
}
function record(id: string, title: string, lines: CompletedLine[]) {
  if (!lines.length) return
  records.push({ id, title, category: 'evidence', source: { type: 'information', ids: [id] }, description: lines.map(line => line.text).join('\n') })
}
function event(scene: CompletedScene, label: string) { return scene.actions.find(action => action.id === label)?.lines ?? [] }
function chainedEvents(scene: CompletedScene, labels: string[]) { return labels.flatMap(label => event(scene, label)) }

for (const source of completedContinuationSource) setup(source.id)
// Presentation variants derive from existing node IDs, without adding save state or progress flags.
scenes['S08-underground'] = { ...scenes.S08, backgroundId: 'building-storage-door' }
scenes['S10-transported'] = { ...scenes.S10, characters: cast(['minato', 'mio']) }
scenes['S10-outside'] = { backgroundId: 'building-exterior', characters: cast(['minato', 'mio']) }
scenes['S16-kuroda'] = { ...scenes.S16, characters: cast(['miyahara', 'minato', 'kuroda']) }
for (const id of ['BAR-A', 'BAR-B']) scenes[`${id}-anna`] = { ...scenes[id], characters: cast(['reiko', 'minato', 'anna']) }
// Keep the first-stage scenario and its saved ending intact; only the full scenario continues.
nodes['S06-end'] = { stage: e01CompletedPart1.nodes['S06-end'].stage,
  sceneId: 'S06', historyScope: 'S06', savePhaseId: 'S06', type: 'dialogue', speakerId: 'narrator', text: '第1部「消えた男」終了。', next: 'S07-intro' }

const completionFlags: Record<string, string[]> = {
  S10: ['F_NAOTO_RESCUED'], S11: ['F_AKARI_REUNION'], S17: ['F_AUDIT_QUESTIONS'], S18: ['F_POLICE_HANDOFF'],
  S23: ['F_EVIDENCE_BOUNDARY'], S27: ['F_FINAL_HANDOFF'],
}
for (let number = 7; number <= 30; number++) {
  const id = `S${String(number).padStart(2, '0')}`
  const source = sources.get(id)
  if (!source) throw new Error(`原稿がありません: ${id}`)
  const next = number === 30 ? 'episode-complete-menu' : `S${String(number + 1).padStart(2, '0')}-intro`
  const required: string[] = []
  let body = source.body, tail: CompletedLine[] = []
  const tailIndex = id === 'S11' ? body.findIndex(line => line.text === '（あかりが帰る）') : id === 'S29' ? body.findIndex(line => line.text === '（奥村退出）')
    : id === 'S30' ? body.findIndex(line => line.text === 'コーヒー、冷めますよ') : id === 'S18' ? body.findIndex(line => line.text.startsWith('（会社側が奥村に'))
    : id === 'S08' ? 7 : id === 'S17' ? 6 : id === 'S23' ? 3 : id === 'S27' ? 3 : -1
  if (tailIndex >= 0) { tail = body.slice(tailIndex); body = body.slice(0, tailIndex) }
  const visitConversation = id === 'S11' ? body.slice(1) : []
  if (id === 'S11') body = body.slice(0, 1)
  // The player-facing operation implements this direction rather than displaying production text.
  tail = tail.filter(line => !line.text.startsWith('（プレイヤーの整理：'))
  if (police.has(id)) {
    const extras = source.actions.filter(action => action.lines.length).flatMap(action => action.lines)
    dialogue(id, `${id}-intro`, [{ speakerId: 'narrator', text: source.heading }, ...body, ...extras], next)
    continue
  }
  const options: Choice[] = []
  const groups: Record<string, Choice[]> = { talk: [], look: [] }
  const repeat = event(source, '再訪')
  for (const [index, action] of source.actions.entries()) {
    if (!['talk', 'look', 'think'].includes(action.kind)) continue
    const name = `${id}-action-${index}`
    let text = action.lines
    if (action.kind === 'think') text = text.map(line => ({ ...line, speakerId: 'narrator' }))
    // S11's required visit is the opening conversation, replayable before her departure.
    if (!text.length && id === 'S11' && action.required) text = visitConversation
    if (!text.length) continue
    const information = action.flag ?? (action.required ? `${id}_REQUIRED_${index}` : undefined)
    if (information) { record(information, action.label, text); if (action.required) required.push(information) }
    const progress: StateUpdate[] = [{ type: action.kind === 'look' ? 'addInspectedTarget' : 'addHeardTopic', id: name }, ...(information ? info(information) : [])]
    dialogue(id, name, text, `${id}-menu`, progress)
    if (repeat.length && action.kind !== 'think') dialogue(id, `${name}-repeat`, repeat, `${id}-menu`)
    if (action.kind === 'think') {
      options.push({ id: 'think', label: '考える', next: name, required: action.required,
        condition: action.required ? { type: 'not', condition: all([information ?? name]) } : undefined })
    } else groups[action.kind].push({ id: name, label: action.label, next: name, required: action.required,
      ...(repeat.length ? { repeatNext: `${name}-repeat` } : {}) })
  }
  for (const kind of ['talk', 'look'] as const) if (groups[kind].length) {
    add(id, `${id}-${kind}`, { ...meta(id), type: kind === 'talk' ? 'topic' : 'inspect',
      parent: { commandId: kind, nodeId: `${id}-menu` }, prompt: kind === 'talk' ? '何について聞きますか？' : 'どこを調べますか？', options: groups[kind] })
    options.unshift({ id: kind, label: kind === 'talk' ? '聞く' : '調べる', next: `${id}-${kind}` })
  }
  let exit = `${id}-finish`
  const ending = [...chainedEvents(source, ['移動', '正答後', '全正答後']), ...tail]
  const flags = completionFlags[id] ?? []
  const updates = flags.flatMap(info)
  // Even when there is no extra speech, use an explicit scene-boundary dialogue.
  dialogue(id, exit, ending.length ? ending : [{ speakerId: 'narrator', text: source.heading }], id === 'S17' ? 'S17-after-menu' : next, updates)
  if (id === 'S11' || id === 'S29') nodes[exit].entryUpdates = [{ type: 'setFlag', id: id === 'S11' ? 'F_AKARI_LEFT' : 'F_OKUMURA_LEFT', value: true }]
  if (id === 'S09') {
    dialogue(id, 'S09-wait', event(source, '移動不可'), 'S09-menu')
    options.push({ id: 'move', label: '移動', next: 'S09-wait' })
  }
  if (id === 'S08') {
    // Preserve the existing dialogue IDs while securing the route before the guide announces it.
    dialogue(id, 'S08-discovery', event(source, '発見演出'), 'S08-finish-1', info('F_ROUTE_SELECTED'))
    const secure = nodes['S08-finish-1'], guide = nodes['S08-finish']
    if (secure.type !== 'dialogue' || guide.type !== 'dialogue') throw new Error('S08の経路案内がありません')
    secure.next = 'S08-finish'
    guide.next = 'S08-finish-2'
    add(id, 'S08-route', { ...meta(id), type: 'choice', prompt: '詳細図の折れ曲がる通路の先を選ぶ', options: [
      { id: 'route', label: '棚の裏で折れ曲がる通路の先', next: 'S08-discovery' }, { id: 'return', label: '戻る', next: 'S08-menu' },
    ] })
    times['S08-route'] = '2026年10月8日（木）朝'
    exit = 'S08-route'
  }
  if (source.questions.length) {
    for (const [index, question] of source.questions.entries()) {
      const qid = `${id}-question${index + 1}`
      const answer = `${qid}-answer`, wrong = `${qid}-wrong`
      add(id, qid, { ...meta(id), type: 'choice', prompt: question.prompt, options: question.choices.map(choice => ({ ...choice, next: choice.id === question.correct ? answer : wrong })) })
      dialogue(id, answer, question.answer, index === source.questions.length - 1 ? exit : `${id}-question${index + 2}`, info(`${id}_ANSWER_${index + 1}`))
      const clues = id === 'S17' ? sources.get('S16')!.actions.filter(action => action.required).flatMap(action => action.lines)
        : sources.get('S18')!.actions.filter(action => action.required).flatMap(action => action.lines)
      dialogue(id, wrong, [...question.wrong, ...clues, ...event(source, '再挑戦')], qid)
    }
    exit = `${id}-question1`
    if (id === 'S27') {
      const labels = ['差し戻し', '面談予定', '死後の処理済み']
      labels.forEach((label, index) => add(id, `S27-card-${index}`, { ...meta(id), type: 'choice', prompt: '警察へ渡す照会メモを整理する', options: [
        { id: 'card', label, next: index === 2 ? exit : `S27-card-${index + 1}` },
      ] }))
      exit = 'S27-card-0'
    }
  }
  const moveId = source.questions.length ? 'organize' : id === 'S09' || id === 'S10' || id === 'S11' || id === 'S30' ? 'proceed' : 'move'
  options.push({ id: moveId, label: source.questions.length ? '整理する' : moveId === 'move' ? '移動' : '続ける', next: exit, condition: all(required) })
  add(id, `${id}-menu`, { ...meta(id), type: 'choice', mode: 'free-action', keepQuestions: true, prompt: '何をしますか？', options,
    implementedCommands: options.map(option => option.id), empty: { label: '会話に戻る', next: `${id}-intro` } })
  dialogue(id, `${id}-intro`, body, `${id}-menu`)
  // Named supplemental event dialogue that belongs before the next scene.
  if (id === 'S10') {
    const contact = event(source, '澪への会話')
    if (contact.length) dialogue(id, 'S10-finish', contact, next, updates)
  }
}

function bar(id: 'BAR-A' | 'BAR-B', back: string) {
  const source = sources.get(id)!
  const once = `${id}_VISITED`
  dialogue(id, `${id}-intro`, [...source.body, ...event(source, '初回')], `${id}-menu`, info(once))
  dialogue(id, `${id}-repeat`, event(source, '再訪'), `${id}-menu`)
  add(id, `${id}-entry`, { ...meta(id), type: 'dialogue', speakerId: 'narrator', text: 'BAR「雨宿り」', next: `${id}-intro`,
    automaticNext: [{ condition: all([once]), next: `${id}-repeat` }] })
  const options: Choice[] = []
  for (const [index, action] of source.actions.entries()) if (['talk', 'look'].includes(action.kind)) {
    const name = `${id}-action-${index}`
    dialogue(id, name, action.lines, `${id}-menu`)
    options.push({ id: action.kind, label: action.kind === 'talk' ? '聞く' : '調べる', next: name })
  }
  dialogue(id, `${id}-leave`, event(source, '終了'), back)
  options.push({ id: 'move', label: '移動', next: `${id}-leave` })
  add(id, `${id}-menu`, { ...meta(id), type: 'choice', mode: 'free-action', keepQuestions: true, implementedCommands: options.map(option => option.id),
    prompt: '何をしますか？', options, empty: { label: '会話に戻る', next: `${id}-intro` } })
}
bar('BAR-A', 'S17-after-menu')
bar('BAR-B', 'episode-complete-menu')
add('S17', 'S17-after-menu', { ...meta('S17'), type: 'choice', prompt: '次へ進みますか？', options: [
  { id: 'proceed', label: '会社へ確認する', next: 'S18-intro' }, { id: 'bar', label: 'BAR「雨宿り」に立ち寄る（任意）', next: 'BAR-A-entry' },
] })
add('S30', 'episode-complete-menu', { ...meta('S30'), type: 'choice', prompt: 'Episode 01「消された記録」完', options: [
  { id: 'proceed', label: 'エピソードを終了する', next: 'episode-complete' }, { id: 'bar', label: 'BAR「雨宿り」エピローグ（任意）', next: 'BAR-B-entry' },
] })
add('S30', 'episode-complete', { ...meta('S30'), type: 'end', text: 'Episode 01「消された記録」完' })

// Keep historyScope/savePhaseId and every dialogue/progression ID unchanged.
// Variants use the existing scene selector, so loading any old v2 node restores its presentation.
for (const [name, node] of Object.entries(nodes)) {
  if (node.sceneId === 'S08' && ['S08-finish-2', 'S08-finish-3'].includes(name)) node.sceneId = 'S08-underground'
  if (node.sceneId === 'S16' && node.type === 'dialogue' && node.speakerId === 'kuroda') node.sceneId = 'S16-kuroda'
  if (node.sceneId?.startsWith('BAR') && node.type === 'dialogue' && node.speakerId === 'anna') node.sceneId = `${node.sceneId}-anna`
}
function stageAfter(start: string, sceneId: string) {
  let name = start
  while (nodes[name]?.type === 'dialogue') {
    const node = nodes[name]
    if (node.type !== 'dialogue') break
    node.sceneId = sceneId
    name = node.next
  }
}
const rescue = Object.entries(nodes).filter(([, node]) => node.sceneId === 'S10' && node.type === 'dialogue')
const transported = rescue.find(([, node]) => node.type === 'dialogue' && node.text === '（隊員が直人を搬送）')
const outside = rescue.find(([, node]) => node.type === 'dialogue' && node.text.startsWith('（救急車の扉が閉まる。'))
if (transported) stageAfter(transported[0], 'S10-transported')
if (outside) stageAfter(outside[0], 'S10-outside')
for (const [name, node] of Object.entries(nodes)) {
  if (node.sceneId === 'S10' && !name.startsWith('S10-intro')) node.sceneId = 'S10-outside'
}
// Anna is present during the opening service, then leaves; optional talk can show her again.
for (const id of ['BAR-A', 'BAR-B']) {
  let name = `${id}-intro`
  while (nodes[name]?.type === 'dialogue') {
    const node = nodes[name]
    if (node.type !== 'dialogue' || node.text === '（杏奈は静かに席を離れる）') break
    node.sceneId = `${id}-anna`
    name = node.next
  }
  for (const [index, action] of sources.get(id)!.actions.entries()) {
    if (['talk', 'look'].includes(action.kind) && action.lines.some(line => line.speakerId === 'anna')) {
      stageAfter(`${id}-action-${index}`, `${id}-anna`)
    }
  }
}

export const e01CompletedEpisode: Scenario = { ...e01CompletedPart1, id: 'erased-records-30-scenes', title: 'Episode 01「消された記録」', nodes, scenes, records, nodeTimes: times }
