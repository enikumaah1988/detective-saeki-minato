import type { Choice, Condition, Scenario, Stage, StateUpdate } from '../../types/scenario'
import type { InvestigationEntry } from '../../types/investigation'
import { e01CompletedPart1Lines as lines } from './e01CompletedPart1Lines'

type SceneId = 'S01' | 'S02' | 'S03' | 'S04' | 'S05' | 'S06'
type Line = { speakerId: string; text: string }
const nodes: Scenario['nodes'] = {}
const scenes: NonNullable<Scenario['scenes']> = {
  S01: { backgroundId: 'office-before-noon', characters: [
    { characterId: 'mio', expression: 'normal', position: 'left' },
    { characterId: 'minato', expression: 'normal', position: 'center' },
    { characterId: 'akari', expression: 'worried', position: 'right', condition: { type: 'flag', id: 'akari_present' } },
  ] },
  S02: { backgroundId: 'office-before-noon', characters: [
    { characterId: 'minato', expression: 'normal', position: 'left' },
    { characterId: 'mio', expression: 'normal', position: 'right' },
  ] },
  S03: { backgroundId: 'company-lounge', characters: [
    { characterId: 'minato', expression: 'normal', position: 'left' },
    { characterId: 'miyahara', expression: 'normal', position: 'right' },
  ] },
  S04: { backgroundId: 'building-room', characters: [
    { characterId: 'minato', expression: 'normal', position: 'left' },
    { characterId: 'building-manager', expression: 'normal', position: 'right' },
  ] },
  S05: { backgroundId: 'building-room', characters: [
    { characterId: 'minato', expression: 'normal', position: 'left' },
    { characterId: 'mio', expression: 'normal', position: 'center' },
    { characterId: 'building-manager', expression: 'normal', position: 'right' },
  ] },
  S06: { backgroundId: 'building-room-evening', characters: [
    { characterId: 'minato', expression: 'serious', position: 'left' },
    { characterId: 'mio', expression: 'serious', position: 'center' },
    { characterId: 'building-manager', expression: 'normal', position: 'right' },
  ] },
}
const records: InvestigationEntry[] = []
const all = (...ids: string[]): Condition => ({ type: 'hasAllInformation', ids })
const has = (id: string): Condition => ({ type: 'hasInformation', id })
const missing = (id: string): Condition => ({ type: 'not', condition: has(id) })
const info = (id: string): StateUpdate[] => [{ type: 'addInformation', id }, { type: 'setFlag', id, value: true }]
const stage = (scene: SceneId): Stage => scenes[scene]
const meta = (scene: SceneId) => ({ stage: stage(scene), sceneId: scene, historyScope: scene, savePhaseId: scene })

// Only this new scenario is assembled here. Legacy nodes and save aliases remain untouched.
function dialogue(scene: SceneId, id: string, text: readonly Line[], next: string, updates: StateUpdate[] = []) {
  text.forEach((line, index) => {
    nodes[index ? `${id}-${index}` : id] = {
      ...meta(scene), type: 'dialogue', ...line,
      next: index === text.length - 1 ? next : `${id}-${index + 1}`,
      ...(index === text.length - 1 ? { updates } : {}),
    }
  })
  return id
}
function record(id: string, title: string, description: string) {
  records.push({ id, category: id === 'F_LAST_SEEN' ? 'events' : 'evidence', title,
    source: { type: 'information', ids: [id] }, description,
    ...(id === 'F_LAST_SEEN' ? { timeLabel: '2026年10月5日 7:30頃', chronologicalOrder: 1 } : {}),
  })
}
function action(scene: SceneId, kind: 'topic' | 'inspect', id: string, label: string, text: readonly Line[], information?: string, required = false, repeat?: readonly Line[]): Choice {
  const updates: StateUpdate[] = [{ type: kind === 'topic' ? 'addHeardTopic' : 'addInspectedTarget', id }, ...(information ? info(information) : [])]
  dialogue(scene, id, text, `${scene}-menu`, updates)
  if (repeat) dialogue(scene, `${id}-repeat`, repeat, `${scene}-menu`)
  return { id, label, next: id, required, ...(repeat ? { repeatNext: `${id}-repeat` } : {}) }
}
function submenu(scene: SceneId, kind: 'topic' | 'inspect', options: Choice[]) {
  nodes[`${scene}-${kind}`] = { ...meta(scene), type: kind,
    parent: { commandId: kind === 'topic' ? 'talk' : 'look', nodeId: `${scene}-menu` },
    prompt: kind === 'topic' ? '何について聞きますか？' : 'どこを調べますか？', options }
}
function menu(scene: SceneId, options: Choice[]) {
  nodes[`${scene}-menu`] = { ...meta(scene), type: 'choice', mode: 'free-action', keepQuestions: true,
    implementedCommands: options.map(option => option.id), prompt: '何をしますか？', options,
    empty: { label: '会話に戻る', next: `${scene}-intro` } }
}
const talk = (scene: SceneId): Choice => ({ id: 'talk', label: '聞く', next: `${scene}-topic` })
const look = (scene: SceneId): Choice => ({ id: 'look', label: '調べる', next: `${scene}-inspect` })
const think = (scene: SceneId, key: keyof typeof lines): Choice => ({ id: 'think', label: '考える', next: dialogue(scene, `${scene}-think`, lines[key], `${scene}-menu`) })
const move = (next: string, condition?: Condition): Choice => ({ id: 'move', label: '移動', next, condition })

dialogue('S01', 'S01-intro', lines['S01-intro'], 'S01-menu')
nodes['S01-intro-8'].entryUpdates = [{ type: 'setFlag', id: 'akari_present', value: true }]
const s01Questions = [
  ['last-seen', '最後に会ったとき', 'F_LAST_SEEN', true],
  ['work', '直人の仕事', 'F_WORK_SITE', true],
  ['recent', '最近の様子', 'O_OLD_BUILDING', false],
  ['friends', '連絡先・交友関係', 'O_FUJII', false],
  ['family', '家族について', 'O_FAMILY', false],
] as const
submenu('S01', 'topic', s01Questions.map(([id, label, information, required]) =>
  action('S01', 'topic', `S01-${id}`, label, lines[`S01-${label}`], information, required, lines['S01-再質問'])))
submenu('S01', 'inspect', ['机', '窓', 'コーヒーカップ'].map((label, index) =>
  action('S01', 'inspect', `S01-look-${index}`, label, lines[`S01-調べる：${label}` as keyof typeof lines])))
const s01Ready = all('F_LAST_SEEN', 'F_WORK_SITE')
dialogue('S01', 'S01-think-before', lines['S01-考える：必須2項目前'], 'S01-menu')
dialogue('S01', 'S01-think-after', lines['S01-考える：必須2項目後'], 'S01-menu')
menu('S01', [talk('S01'), look('S01'), { id: 'think', label: '考える', next: 'S01-think-before' },
  { id: 'proceed', label: '依頼を受ける', next: 'S01-accept-pre', condition: s01Ready }])
nodes['S01-think-before'].automaticNext = [{ condition: s01Ready, next: 'S01-think-after' }]
dialogue('S01', 'S01-accept-pre', lines['S01-受諾条件'], 'S01-accept')
dialogue('S01', 'S01-accept', lines['S01-accept'], 'S02-intro')
nodes['S01-accept-4'].entryUpdates = [{ type: 'setFlag', id: 'akari_present', value: false }]
record('F_LAST_SEEN', '最後に会ったとき', '10/5 7:30頃、自宅を出発。あかりが確認した最後の姿。')
record('F_WORK_SITE', '直人の仕事', '成子坂共同ビルで予定作業完了と会社から伝達。退館の確認とは別。10/5昼の連絡『今日は遅くなるかも』は居場所を特定しない。')
record('O_OLD_BUILDING', '最近の様子', '古い建物の片づけがあるって。疲れてはいましたけど、仕事の愚痴はあまり言わないんです')
record('O_FUJII', '藤井拓海', '藤井さん……藤井拓海さん。後輩だって言っていました')
record('O_FAMILY', '家族について', '両親は何年か前に亡くなって……今は兄と2人です')

dialogue('S02', 'S02-intro', lines['S02-intro'], 'S02-menu')
submenu('S02', 'topic', [action('S02', 'topic', 'S02-company', '会社の窓口', lines['S02-聞く：会社の窓口'], undefined, false, lines['S02-再訪'])])
submenu('S02', 'inspect', [action('S02', 'inspect', 'S02-memo', 'メモ', lines['S02-調べる：メモ'])])
dialogue('S02', 'S02-move', lines['S02-移動：東成ビルサービス'], 'S03-intro')
menu('S02', [talk('S02'), look('S02'), think('S02', 'S02-考える'), move('S02-move')])

dialogue('S03', 'S03-intro', lines['S03-intro'], 'S03-menu')
submenu('S03', 'topic', [
  action('S03', 'topic', 'S03-work', '月曜の作業', lines['S03-必須：聞く「月曜の作業」'], 'F_WORK_END', true),
  action('S03', 'topic', 'S03-search', '捜索範囲', lines['S03-必須：聞く「捜索範囲」'], 'F_SEARCH_SCOPE', true),
  action('S03', 'topic', 'S03-personality', '直人の性格', lines['S03-任意：聞く「直人の性格」']),
  action('S03', 'topic', 'S03-fujii', '藤井', lines['S03-任意：聞く「藤井」'], 'O_FUJII_COMPANY'),
])
submenu('S03', 'inspect', [action('S03', 'inspect', 'S03-report', '作業日報（許可済み抜粋）', lines['S03-調べる：作業日報（許可済み抜粋）'])])
dialogue('S03', 'S03-move', lines['S03-移動'], 'S04-intro')
menu('S03', [talk('S03'), look('S03'), think('S03', 'S03-考える'), move('S03-move', all('F_WORK_END', 'F_SEARCH_SCOPE'))])
record('F_WORK_END', '月曜の作業', lines['S03-必須：聞く「月曜の作業」'][0].text)
record('F_SEARCH_SCOPE', '捜索範囲', lines['S03-必須：聞く「捜索範囲」'][0].text)
record('O_FUJII_COMPANY', '藤井', lines['S03-任意：聞く「藤井」'][0].text)

// Show the remaining conversation after the player has pointed out the unchecked area.
dialogue('S04', 'S04-intro', lines['S04-intro'].slice(0, 3), 'S04-menu')
submenu('S04', 'topic', [action('S04', 'topic', 'S04-route', '巡回経路', lines['S04-任意：聞く「巡回経路」'], undefined, false, lines['S04-再訪'])])
submenu('S04', 'inspect', [
  action('S04', 'inspect', 'S04-search-map', '捜索範囲図', lines['S04-必須：調べる「捜索範囲図」'], 'F_SEARCH_MAP', true),
  action('S04', 'inspect', 'S04-entrance', '地下入口', lines['S04-調べる：地下入口'], 'F_BASEMENT_MARK', true),
])
dialogue('S04', 'S04-discovery', lines['S04-発見演出'], 'S04-followup', info('F_UNCHECKED_AREA'))
dialogue('S04', 'S04-followup', lines['S04-intro'].slice(3), 'S04-menu')
menu('S04', [talk('S04'), look('S04'), think('S04', 'S04-考える'),
  { id: 'organize', label: '未確認区域を指摘する', next: 'S04-discovery', condition: { type: 'all', conditions: [all('F_SEARCH_MAP', 'F_BASEMENT_MARK'), missing('F_UNCHECKED_AREA')] } },
  move('S05-intro', has('F_UNCHECKED_AREA')),
])
record('F_SEARCH_MAP', '捜索範囲図', lines['S04-必須：調べる「捜索範囲図」'][0].text)
record('F_UNCHECKED_AREA', '未確認区域', lines['S04-発見演出'].map(line => line.text).join('\n'))

// The old-room identification in the master follows the two diagram selections.
dialogue('S05', 'S05-intro', lines['S05-intro'].slice(0, 5), 'S05-menu')
submenu('S05', 'inspect', [
  action('S05', 'inspect', 'S05-part', '予備品の型番', lines['S05-必須：調べる「予備品の型番」'], 'F_PART_CHECK', true),
  action('S05', 'inspect', 'S05-old-map', '旧図面', lines['S05-必須：調べる「旧図面」'], 'F_OLD_ROOM', true),
  action('S05', 'inspect', 'S05-current-map', '現行案内図', lines['S05-必須：調べる「現行案内図」'], 'F_SIMPLE_MAP', true),
  action('S05', 'inspect', 'S05-light', '非常照明の記載', lines['S05-任意：調べる「非常照明の記載」'], 'O_LIGHT_RECORD'),
])
dialogue('S05', 'S05-compare', lines['S05-照合演出'], 'S05-confirm')
nodes['S05-select-old'] = { ...meta('S05'), type: 'choice', prompt: '旧図面の照合する区画を選ぶ', options: [
  { id: 'basement', label: '旧図面：地下区画', next: 'S05-select-current' },
  { id: 'return', label: '戻る', next: 'S05-menu' },
] }
nodes['S05-select-current'] = { ...meta('S05'), type: 'choice', prompt: '現行案内図の同じ区画を選ぶ', options: [
  { id: 'basement', label: '現行案内図：地下区画', next: 'S05-compare' },
  { id: 'return', label: '戻る', next: 'S05-select-old' },
] }
dialogue('S05', 'S05-confirm', lines['S05-intro'].slice(5), 'S05-menu', info('F_MAP_COMPARED'))
dialogue('S05', 'S05-move', lines['S05-移動'], 'S06-menu')
menu('S05', [look('S05'), think('S05', 'S05-考える'),
  { id: 'organize', label: '地下区画を照合する', next: 'S05-select-old', condition: { type: 'all', conditions: [all('F_OLD_ROOM', 'F_SIMPLE_MAP'), missing('F_MAP_COMPARED')] } },
  move('S05-move', all('F_PART_CHECK', 'F_OLD_ROOM', 'F_SIMPLE_MAP', 'F_MAP_COMPARED')),
])
record('F_PART_CHECK', '予備品の型番', lines['S05-必須：調べる「予備品の型番」'][0].text)
record('F_OLD_ROOM', '旧図面', lines['S05-必須：調べる「旧図面」'][0].text)
record('F_SIMPLE_MAP', '現行案内図', lines['S05-必須：調べる「現行案内図」'][0].text)
record('F_MAP_COMPARED', '図面の照合', lines['S05-照合演出'].map(line => line.text).join('\n'))
record('O_LIGHT_RECORD', '非常照明の記載', lines['S05-任意：調べる「非常照明の記載」'][0].text)

menu('S06', [{ id: 'organize', label: '整理する', next: 'S06-question1' }])
// A dialogue fallback is required by the shared Free Action contract.
dialogue('S06', 'S06-intro', lines['S06-再挑戦'], 'S06-menu')
nodes['S06-question1'] = { ...meta('S06'), type: 'choice', prompt: '予定作業完了のあと、優先して確認すべき場所は？', options: [
  { id: 'A', label: '建物の外', next: 'S06-wrong1' }, { id: 'B', label: '旧保管室', next: 'S06-answer1' }, { id: 'C', label: '会社の本社', next: 'S06-wrong1' },
] }
dialogue('S06', 'S06-answer1', lines['S06-answer1'], 'S06-question2', info('F_DEDUCTION_PLACE'))
dialogue('S06', 'S06-wrong1', lines['S06-wrong1'], 'S06-clues')
dialogue('S06', 'S06-clues', [...lines['S05-必須：調べる「予備品の型番」'], ...lines['S05-必須：調べる「旧図面」'], ...lines['S05-必須：調べる「現行案内図」']], 'S06-retry1')
dialogue('S06', 'S06-retry1', lines['S06-再挑戦'], 'S06-question1')
nodes['S06-question2'] = { ...meta('S06'), type: 'choice', prompt: '旧保管室が最初の捜索で見落とされた理由として言えるのは？', options: [
  { id: 'A', label: '建物から部屋が消えた', next: 'S06-wrong2' }, { id: 'B', label: '誰かが隠した', next: 'S06-wrong2' }, { id: 'C', label: '簡略図では独立した部屋として見えない', next: 'S06-answer2' },
] }
dialogue('S06', 'S06-wrong2', lines['S06-wrong2'], 'S06-retry2')
dialogue('S06', 'S06-retry2', lines['S06-再挑戦'], 'S06-question2')
dialogue('S06', 'S06-answer2', lines['S06-answer2'], 'S06-correct', info('F_SEARCH_REQUEST'))
dialogue('S06', 'S06-correct', lines['S06-正答後'], 'S06-contact')
dialogue('S06', 'S06-contact', lines['S06-intro'], 'S06-end')
nodes['S06-end'] = { ...meta('S06'), type: 'end', text: '第1部「消えた男」終了。第2部は未実装です。' }
record('F_SEARCH_REQUEST', '夜間緊急確認', lines['S06-正答後'].map(line => line.text).join('\n'))

export const e01CompletedPart1: Scenario = {
  id: 'erased-records-30-scenes-part1', title: 'Episode 01「消された記録」第1部 S01〜S06（段階導入）',
  start: 'S01-intro', dateLabel: '2026年10月7日（水）午前', scenes, nodes, records,
  nodeTimes: Object.fromEntries(Object.entries(nodes).map(([id, node]) => [id,
    node.sceneId === 'S06' ? '2026年10月7日（水）夜' : node.sceneId === 'S01' || node.sceneId === 'S02' ? '2026年10月7日（水）午前' : '2026年10月7日（水）',
  ])),
}
