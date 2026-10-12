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
// 同室で次の場面へ進む際にも、することを具体的に示す。
export const sceneContinuations: Record<string, string> = {
  'P1-01': '仕事に戻る', 'P1-02': '兄の事情を確かめる', 'P1-03': '聞き取った内容を考える',
  'P1-04': '依頼について話す', 'P1-05': '調査の準備をする', 'P1-06': '調査を始める',
  'P2-09': '調査内容を整理する', 'P2-10': '連絡を待つ', 'P2-11': '直人との面会に備える',
  'P3-03': '当時の出来事を確かめる', 'P3-04': '証言について話す', 'P3-05': '現場の位置を確かめる',
  'P3-06': '翌朝の確認を打ち合わせる', 'P3-07': '警察に引き継ぐ',
  'P4-06': '黒田との面会に臨む', 'P4-07': '確認の結果を受け止める',
  'P4-08-OFFICE': '後日の報告を待つ', 'P4-09': '二人を迎える', 'P4-10': '二人を見送る', 'P4-11': '仕事を終える',
}
