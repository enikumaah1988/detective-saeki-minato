// 原稿のask/speak/inspectは保存IDを維持。画面上の行動分類を別に管理する。
const detailedInspections = new Set(['p2-journal', 'p2-envelope', 'p4-shelf'])
const everydayQuestions = new Set(['p1-age', 'p1-daily', 'p1-family', 'p2-building-life', 'p2-misaki-work', 'p3-mio-callback', 'p3-responsibility', 'p4-misaki-memory'])
export function revisionCommand(kind: 'ask' | 'speak' | 'inspect', id: string) {
  return kind === 'inspect' ? detailedInspections.has(id) ? 'investigate' : 'look'
    : kind === 'ask' ? everydayQuestions.has(id) ? 'speak' : 'talk' : 'speak'
}
export const revisionLabels: Record<string, string> = {
  'p1-ledger': '帳簿', 'p1-visitor': '相談の用件', 'p4-siblings-talk': 'これまでのこと',
}
