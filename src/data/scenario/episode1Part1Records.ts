import type { InvestigationEntry } from '../../types/investigation'
const information = (id: string) => ({ type: 'information' as const, ids: [id] })
export const episode1Part1Records: readonly InvestigationEntry[] = [
  { id: 'akari', category: 'people', title: '高瀬あかり', source: information('I01'), description: '兄の捜索を依頼した妹。朝はいつもどおり出かけたと話す。仕事へ行ったというのは妹の認識。', facts: [{ source: information('akari-family'), text: '両親はもうおらず、今は兄と二人。思いつく人には聞いたが、誰も足取りを知らないと話した。' }, { source: information('I01'), text: '電話とメッセージに応答がない。会社には、その日から来ていないと言われた。' }] },
  { id: 'naoto', category: 'people', title: '高瀬直人', source: information('I01'), description: '29歳。東成ビルサービスの現場担当。', facts: [{ source: information('naoto-daily'), text: '遅くなる時には短くても連絡をくれる。三日間黙っているのは普段とは違うとあかりが話した。' }, { source: information('I02'), text: '失踪当日は休暇を取り、黒田部長への面会を申し込んでいた。面会の内容はまだ分からない。' }] },
  { id: 'kuroda', category: 'people', title: '黒田部長', source: information('I02'), description: '直人が面会を申し込んだ相手。面会を申し入れる。' },
  { id: 'I01', category: 'evidence', title: 'I01 あかりの聞き取り', source: information('I01'), description: '三日前の朝はいつもどおり。以後連絡がない。妹の認識であり、兄の実際の目的を示すものではない。' },
  { id: 'I02', category: 'evidence', title: 'I02 休暇記録と面会申込み', source: information('I02'), description: '会社の担当が本人の休暇記録と黒田への面会申込みを確認した。古い事務所は成子坂共同ビル。担当は面会の内容を知らない。記録原本を持ち出したものではない。' },
  { id: 'search-photo', category: 'evidence', title: '兄の写真（捜索用）', source: information('search-photo'), description: '澪が捜索用に写真と連絡先を預かる。写真から別の秘密は発見していない。' },
  { id: 'missing-morning', category: 'events', title: '兄が家を出る', source: information('I01'), timeLabel: '三日前の朝', chronologicalOrder: 10, description: 'いつもの時間、いつもの服で家を出た。その後は連絡がない。', facts: [{ source: information('I02'), text: '会社への確認で、休暇を取り黒田への面会を申し込んでいたと分かった。' }] },
  { id: 'old-building', category: 'events', title: '成子坂共同ビルでの過去の事故', source: information('I02'), timeLabel: '過去（詳細未確認）', chronologicalOrder: 0, description: '湊は、成子坂共同ビルで人が死んだことを覚えている。事故だったと聞いていた。原因や関係者の証言は未取得。' },
]
