// 原稿のIDと進捗は維持し、画面の分類・話題の有効範囲を管理する。
const detailedInspections = new Set(['p2-journal', 'p2-envelope', 'p4-shelf'])
export function revisionCommand(kind: 'ask' | 'speak' | 'inspect', id: string) {
  return kind === 'inspect' ? detailedInspections.has(id) ? 'investigate' : 'look' : 'speak'
}
export function canCarryTopic(id: string, phaseId: string) {
  if (['p1-schedule', 'p1-coffee'].includes(id)) return phaseId === 'P1-01'
  return true
}
export const revisionLabels: Record<string, string> = {
  'p1-ledger': '帳簿', 'p1-visitor': '相談の用件', 'p4-siblings-talk': 'これまでのこと',
  'P1-05-farewell': 'お見送り', 'P4-10-farewell': 'お見送り',
}
export const sceneClosings: Record<string, { personId: string; label: string; text: string }> = {
  'P1-03': { personId: 'akari', label: '相談内容の確認', text: '伺ったことを、いったん確かめさせてください。' },
  'P3-04': { personId: 'naoto', label: '証言の確認', text: '今の話を確認したい。見たことと、そのあとに起きたことを分けて考えよう。' },
  'P3-06': { personId: 'naoto', label: '書類についての確認', text: '書類について聞いたことを、ここで確かめておこう。' },
  'P4-07': { personId: 'kuroda', label: '説明の確認', text: '今の説明は、伺ったとおりに記録します。' },
}
export function conversationLabel(action: { id: string; label?: string; interaction?: string }) {
  const label = revisionLabels[action.id] ?? action.label ?? action.id
  const replacements: Record<string, string> = {
    '会社へ向かう': '会社への訪問', '直人に会いに行く': '直人との面会',
    '二人を迎える': '来客の準備', '日常へ戻る': '依頼を終えて',
    '引継ぎを確認する': '警察への引継ぎ', '黒田への連絡を確認する': '黒田への連絡',
    '今日の記録をまとめる': '今日の調査記録',
  }
  return replacements[label] ?? label
}

// 正解・進捗IDは原稿のまま。誤答は実際に混同しやすい証言・記録へ合わせる。
export const reasoningLabels: Record<string, Record<string, string>> = {
  'Q1-2': { a: '管理人から控えを借りること。' },
  'Q1-3': { a: '直人は当時から、黒田の説明を否定していた。', c: '直人は事故の記録を確認するためだけに、休暇を取った。' },
  'Q2-1': { a: '鍵の日誌だけで、黒田が転落時までいたと分かる。', c: '宮原が、階段で黒田の顔を見たという証言。' },
  'Q2-3': { a: '宮原が押す動作と黒田の顔を同時に見たこと。' },
}
