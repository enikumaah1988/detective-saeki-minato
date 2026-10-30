import type { Choice, Condition, Scenario, Stage } from '../../types/scenario'

// 2026-10-30 user-approved S01 additions. No new case facts or evidence grants.
const mioTopics = [
  { id: 'S01-mio-interview', label: '聞き取りについて', requires: [] as string[], lines: [
    { speakerId: 'minato', text: 'まずは、あかりさんが覚えていることからだな。' },
    { speakerId: 'mio', text: 'ええ。確かなことと、まだ分からないことを分けて聞きましょう。' },
  ] },
  { id: 'S01-mio-work', label: '勤務先について', requires: ['F_WORK_SITE'], lines: [
    { speakerId: 'minato', text: '勤務先でのことも、確かめたい。' },
    { speakerId: 'mio', text: '予定の作業と、その後の足取りですね。あかりさんのお話と分けて確認していきましょう。' },
  ] },
  { id: 'S01-mio-next', label: 'これからのこと', requires: ['F_LAST_SEEN', 'F_WORK_SITE'], lines: [
    { speakerId: 'minato', text: '澪、ここまでで気になることは？' },
    { speakerId: 'mio', text: '仕事が終わったことと、無事に帰ったことは別です。そこは確かめたいですね。' },
    { speakerId: 'minato', text: 'そうだな。まだ決めつけずにいこう。' },
  ] },
]

export function withEpisode01S01S03(scenario: Scenario): Scenario {
  const nodes = { ...scenario.nodes }, scenes = { ...scenario.scenes }, nodeTimes = { ...scenario.nodeTimes }
  const present: Condition = { type: 'flag', id: 'akari_present' }
  const has = (...ids: string[]): Condition => ({ type: 'hasAllInformation', ids })
  const akari = nodes['S01-topic-akari']
  if (akari.type !== 'topic') throw new Error('S01のあかり話題がありません')
  const dialogueMeta = { stage: akari.stage, sceneId: akari.sceneId, historyScope: akari.historyScope, savePhaseId: akari.savePhaseId }
  const gates: Record<string, Condition> = {
    'S01-last-seen': has(), 'S01-work': has('F_LAST_SEEN'), 'S01-recent': has('F_LAST_SEEN'),
    'S01-friends': has('F_WORK_SITE'), 'S01-family': has('O_OLD_BUILDING'),
  }
  nodes['S01-topic-akari'] = { ...akari, appendUnlockedTopics: true,
    options: akari.options.map(option => ({ ...option, condition: { type: 'all', conditions: [present, gates[option.id]] } })) }
  const people = nodes['S01-topic']
  if (people.type !== 'topic') throw new Error('S01の人物一覧がありません')
  nodes['S01-topic'] = { ...people, options: [...people.options,
    { id: 'mio', label: '相澤　澪', next: 'S01-topic-mio', condition: present }] }
  nodes['S01-topic-mio'] = { ...akari, appendUnlockedTopics: true,
    parent: { commandId: 'speak', nodeId: 'S01-topic' }, options: mioTopics.map(topic => ({
      id: topic.id, label: topic.label, next: topic.id, required: false,
      condition: { type: 'all', conditions: [present, has(...topic.requires)] },
    })) }
  for (const topic of mioTopics) topic.lines.forEach((line, index) => {
    const id = index ? `${topic.id}-${index}` : topic.id
    nodes[id] = { ...dialogueMeta, type: 'dialogue', ...line,
      next: index === topic.lines.length - 1 ? 'S01-topic-mio' : `${topic.id}-${index + 1}`,
      ...(index === topic.lines.length - 1 ? { updates: [{ type: 'addHeardTopic', id: topic.id }] } : {}),
    }
  })

  // First-person staging is data-local. One counterpart remains at center even
  // when Minato narrates/replies; a change of speaker alone does not move them.
  const counterpart = (backgroundId: string, person: string): Stage => ({ backgroundId,
    characters: [{ characterId: person, expression: 'normal', position: 'center' }] })
  scenes.S01 = counterpart('office-before-noon', 'akari')
  scenes.S01.characters = scenes.S01.characters?.map(person => ({ ...person, condition: present }))
  scenes.S02 = counterpart('office-before-noon', 'mio')
  scenes.S03 = counterpart('company-lounge', 'miyahara')
  scenes['S01-opening-office'] = counterpart('office-before-noon', 'mio')
  scenes['S01-with-mio'] = counterpart('office-before-noon', 'mio')
  for (const [id, node] of Object.entries(nodes)) {
    if (!/^S0[123](?:-|$)/.test(id)) continue
    let sceneId = node.sceneId
    if (/^S01-intro(?:-(\d+))?$/.test(id) && Number(id.split('-')[2] ?? 0) < 8) sceneId = 'S01-with-mio'
    if (id === 'S01-topic-mio' || id.startsWith('S01-mio-') || /^S01-accept-[4-9]$/.test(id)) sceneId = 'S01-with-mio'
    if (sceneId && scenes[sceneId]) nodes[id] = { ...node, sceneId, stage: scenes[sceneId] }
  }

  // Reuse TravelMap and ordinary indoor choices. No receptionist speech,
  // permission event, or new introduction is invented at the handoff to S03.
  const add = (id: string, backgroundId: string, prompt: string, options: Choice[], map?: { current: string; back: string }) => {
    const stage: Stage = { backgroundId, characters: [] }
    scenes[id] = stage
    nodes[id] = { type: 'choice', stage, sceneId: id, historyScope: 'S02', savePhaseId: 'S02', prompt, options, ...(map ? { map } : {}) }
    nodeTimes[id] = scenario.nodeTimes?.['S02-menu'] ?? '2026年10月7日（水）午前'
  }
  const move = nodes['S02-move']
  // Find the last node of the existing S02 departure dialogue.
  let last = 'S02-move'
  while (nodes[last].type === 'dialogue') {
    const node = nodes[last]
    if (node.type !== 'dialogue') break
    if (node.next === 'S03-intro') { nodes[last] = { ...node, next: 'S02-travel-map' }; break }
    last = node.next
  }
  if (move.type !== 'dialogue') throw new Error('S02の出発会話がありません')
  add('S02-travel-map', 'office-exterior', '移動先', [
    { id: 'company', label: '東成ビルサービス', next: 'S02-company-exterior' },
    { id: 'return', label: '戻る', next: 'S02-menu' },
  ], { current: 'office', back: 'S02-menu' })
  add('S02-company-exterior', 'company-exterior', '東成ビルサービス前', [
    { id: 'enter', label: 'ロビー', next: 'S02-company-lobby' },
    { id: 'map', label: '他に移動する', next: 'S02-company-map' },
  ])
  add('S02-company-map', 'company-exterior', '移動先', [
    { id: 'office', label: '佐伯探偵事務所', next: 'S02-menu' },
    { id: 'return', label: '戻る', next: 'S02-company-exterior' },
  ], { current: 'company', back: 'S02-company-exterior' })
  add('S02-company-lobby', 'company-lobby', '西新宿セントラルタワー・ロビー', [
    { id: 'look', label: '調べる', next: 'S02-lobby-targets' },
    { id: 'move', label: '移動', next: 'S02-lobby-rooms' },
  ])
  const lobby = nodes['S02-company-lobby']
  if (lobby.type !== 'choice') throw new Error('会社ロビーがありません')
  nodes['S02-company-lobby'] = { ...lobby, mode: 'free-action', keepQuestions: true,
    implementedCommands: ['look', 'move'], empty: { label: '確認に戻る', next: 'S02-tenant-list' } }
  nodes['S02-lobby-targets'] = { type: 'inspect', stage: scenes['S02-company-lobby'], sceneId: 'S02-company-lobby',
    historyScope: 'S02', savePhaseId: 'S02', heading: '調べる', prompt: '対象を選ぶ',
    parent: { commandId: 'look', nodeId: 'S02-company-lobby' },
    options: [{ id: 'S02-tenant-list', label: 'テナント一覧', next: 'S02-tenant-list', required: true }] }
  nodeTimes['S02-lobby-targets'] = nodeTimes['S02-company-lobby']
  add('S02-lobby-rooms', 'company-lobby', '移動先', [
    { id: 'reception', label: '12Fに移動', next: 'S02-company-reception', condition: { type: 'inspectedTarget', id: 'S02-tenant-list' } },
    { id: 'return', label: '外に出る', next: 'S02-company-exterior' },
  ])
  nodes['S02-tenant-list'] = { stage: scenes['S02-company-lobby'], sceneId: 'S02-company-lobby', historyScope: 'S02', savePhaseId: 'S02', type: 'dialogue', speakerId: 'narrator',
    text: '東成ビルサービス株式会社 — 12階', next: 'S02-lobby-targets',
    updates: [{ type: 'addInspectedTarget', id: 'S02-tenant-list' }] }
  nodeTimes['S02-tenant-list'] = nodeTimes['S02-company-lobby']
  add('S02-company-reception', 'company-reception', '東成ビルサービス・12階受付', [
    { id: 'lounge', label: '応接室', next: 'S03-intro' },
    { id: 'return', label: '1Fに移動', next: 'S02-company-lobby' },
  ])
  for (const id of Object.keys(nodes).filter(id => id.startsWith('S01-mio-') || id === 'S01-topic-mio')) nodeTimes[id] = scenario.nodeTimes?.['S01-menu'] ?? ''
  return { ...scenario, nodes, scenes, nodeTimes }
}
