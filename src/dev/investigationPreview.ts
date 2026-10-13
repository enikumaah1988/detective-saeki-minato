import { itemImages } from '../data/itemImages'
import type { InvestigationRecord } from '../types/investigation'
import { resolveExpression } from '../data/presentation'

export type PreviewMode = 'normal' | 'empty' | 'all-empty' | 'stress' | 'no-images'
export const previewModes: { id: PreviewMode; label: string }[] = [
  { id: 'normal', label: '通常' }, { id: 'empty', label: '一部空' },
  { id: 'all-empty', label: '全部空' }, { id: 'stress', label: '多数・長文' }, { id: 'no-images', label: '画像なし' },
]
const asset = (name: string) => new URL(`./assets/${name}.svg`, import.meta.url).href
const record = (id: string, category: InvestigationRecord['category'], title: string, details: string[], extra: Partial<InvestigationRecord> = {}): InvestigationRecord =>
  ({ id, category, title, description: details[0], details, ...extra })
export function createInvestigationPreview(mode: PreviewMode): InvestigationRecord[] {
  const records = [
    record('dev-minato', 'people', '佐伯湊', ['架空のUI確認用人物記録です。本編の進捗とは無関係です。', '聞き取った内容の表示例。長さや余白を確認します。'], { imageSrc: resolveExpression('minato', 'normal').imageSrc }),
    record('dev-mio', 'people', '澪', ['架空のUI確認用人物記録です。', '人物画像は既存素材を表示領域でトリミングしています。'], { imageSrc: resolveExpression('mio', 'normal').imageSrc }),
    record('dev-photo', 'evidence', '現場の写真', ['架空のUI確認用の写真です。実際の事件とは関係ありません。'], { imageSrc: asset('scene-photo') }),
    record('dev-note', 'evidence', '聞き取りメモ', ['画像なしの架空の聞き取り記録です。', '名称と複数段落の説明だけでも読めることを確認します。']),
    ...[ ['09:00', '現場で物音', '14:30'], ['09:20', '通行人が目撃', '13:00'], ['10:00', '周辺の確認', '12:00'] ].map(([time, title, acquired], i) =>
      record(`dev-event-${i}`, 'events', title, ['架空のUI確認用の出来事です。', `情報取得日時：仮日 15日 ${acquired}（事件の発生順とは別）`], { timeLabel: `発生日時：仮日 14日 ${time}`, chronologicalOrder: i })),
    ...[ ['smartphone', 'スマホ'], ['electronic-cigarette', '電子タバコ'], ['business-card', '名刺'] ].map(([id, title]) =>
      record(`dev-${id}`, 'belongings', title, ['持ち物のUI確認用サンプルです。使用・提示はできません。'], { imageSrc: itemImages[id] })),
  ]
  if (mode === 'all-empty') return []
  if (mode === 'empty') return records.filter(entry => entry.category === 'people' || entry.category === 'belongings')
  if (mode === 'no-images') return records.map(({ imageSrc: _image, ...entry }) => entry)
  if (mode === 'stress') return records.concat(Array.from({ length: 24 }, (_, i) => record(`dev-long-${i}`, 'people', `長い名前の調査記録・表示領域と折り返しの確認項目 ${i + 1}`, Array.from({ length: 18 }, (_, p) => `第${p + 1}段落。これは架空のUI確認用文章です。長文を詳細領域内でスクロールして読み、一覧側の選択が維持されることを確認します。`.repeat(3)))))
  return records
}
