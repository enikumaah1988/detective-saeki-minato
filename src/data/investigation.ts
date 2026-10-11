import { itemImages } from './itemImages'
import type { InvestigationEntry } from '../types/investigation'
import { resolveExpression } from './presentation'

// 本編用の事実を補わず、既存の仮シナリオで実際に判明する内容のみ定義する。
export const part1Records: readonly InvestigationEntry[] = [
  {
    id: 'brother', category: 'people', title: '澪の兄',
    source: { type: 'information', ids: ['brother_profile'] },
    description: '几帳面で、連絡を絶やしたことがない人物。澪から聞き取った情報。',
    facts: [
      { source: { type: 'information', ids: ['disappearance_timing', 'missing_date'] }, text: '三日前から連絡が取れない。' },
      { source: { type: 'information', ids: ['last_known_activity', 'brother_recent'] }, text: '最後の連絡では、昔の事故の記録を調べに行くと話していた。' },
      { source: { type: 'information', ids: ['past_accident'] }, text: '以前の事故について、まだ確かめたいことがあると話していた。' },
    ],
  },
  {
    id: 'client-observation', category: 'people', title: '相澤澪',
    source: { type: 'inspection', id: 'client' },
    alternativeSources: [{ type: 'information', ids: ['brother_profile', 'disappearance_timing', 'missing_date', 'last_known_activity', 'brother_recent', 'past_accident'] }],
    description: '兄の行方について相談に来た依頼人。',
    imageSrc: resolveExpression('mio', 'normal').imageSrc,
    facts: [
      { source: { type: 'information', ids: ['brother_profile'] }, text: '兄は几帳面で、連絡を絶やしたことがないと話した。' },
      { source: { type: 'information', ids: ['disappearance_timing', 'missing_date'] }, text: '三日前から兄と連絡が取れないと話した。' },
      { source: { type: 'information', ids: ['last_known_activity', 'brother_recent'] }, text: '最後の連絡で、兄は昔の事故の記録を調べに行くと言っていたと話した。' },
      { source: { type: 'information', ids: ['past_accident'] }, text: '兄は以前の事故について、まだ確かめたいことがあると話していた。' },
      { source: { type: 'inspection', id: 'client' }, text: '落ち着いて話しているが、手元には緊張が見える。' },
    ],
  },
  {
    id: 'brother-photo', category: 'evidence', title: '兄の写真',
    source: { type: 'information', ids: ['photo_date'] },
    description: '写真の裏に小さな日付が書かれている。日付の具体的な値は、現在の仮シナリオでは未設定。',
  },
  {
    id: 'past-accident', category: 'events', title: '過去の事故',
    source: { type: 'information', ids: ['past_accident'] },
    timeLabel: '以前（時期不明）', chronologicalOrder: 10,
    description: '澪の兄が、以前の事故について確かめたいことがあると話していた。事故の日時・詳細は不明。',
  },
  {
    id: 'last-activity', category: 'events', title: '最後に確認された行動',
    source: { type: 'information', ids: ['last_known_activity', 'brother_recent'] },
    timeLabel: '最後の連絡時', chronologicalOrder: 20,
    description: '澪の兄は、昔の事故の記録を調べに行くと話していた。',
  },
  {
    id: 'disappearance', category: 'events', title: '兄との連絡が途絶える',
    source: { type: 'information', ids: ['disappearance_timing', 'missing_date'] },
    timeLabel: '三日前から', chronologicalOrder: 30,
    description: '澪から、三日前から兄と連絡が取れないと聞いた。ゲーム内の暦日・時刻は未設定。',
  },
]

export const basicBelongings: readonly InvestigationEntry[] = [
  { id: 'smartphone', imageSrc: itemImages['smartphone'], category: 'belongings', title: 'スマホ', source: { type: 'base' }, description: '佐伯湊のスマートフォン。本体を持ち物として記録する。今回は閲覧のみ。' },
  { id: 'electronic-cigarette', imageSrc: itemImages['electronic-cigarette'], category: 'belongings', title: '電子タバコ', source: { type: 'base' }, description: '佐伯湊の電子タバコ。今回は使用できない。' },
  { id: 'business-card', imageSrc: itemImages['business-card'], category: 'belongings', title: '名刺', source: { type: 'base' }, description: '佐伯湊の名刺。今回は使用・提示できない。' },
]

export const recordsByScenario: Readonly<Record<string, readonly InvestigationEntry[]>> = {
  'gray-testimony-part1-demo': part1Records,
}
