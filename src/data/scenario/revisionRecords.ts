import type { InvestigationEntry, RecordFact } from '../../types/investigation'
import { episode1Part1Records } from './episode1Part1Records'
import { resolveExpression } from '../presentation'
const information = (...ids: string[]) => ({ type: 'information' as const, ids })
const fact = (id: string, text: string): RecordFact => ({ source: information(id), text })
const face = (id: string) => resolveExpression(id, 'normal').imageSrc
const people: InvestigationEntry[] = [
  { id: 'minato', category: 'people', title: '佐伯湊', source: { type: 'base' }, imageSrc: face('minato'), description: '佐伯探偵事務所の探偵。' },
  { id: 'mio', category: 'people', title: '相澤澪', source: { type: 'base' }, imageSrc: face('mio'), description: '佐伯の助手。今回は事務所で連絡と記録の整理を担う。' },
  { id: 'akari', category: 'people', title: '来訪者', source: information('met-akari', 'mentioned-akari'), titleUpdates: [{ source: information('named-akari'), title: '高瀬あかり' }], imageSrc: face('akari'), portraitSource: information('met-akari'), description: '事務所へ相談に来た女性。', facts: [
    fact('brother-profile', '高瀬直人の妹。帰ってこない兄について相談している。'), fact('morning', '10月5日の朝、兄が普段どおり家を出たと話した。目的は確認できていない。'),
    fact('contact', '電話とメッセージへの応答がない。'), fact('workplace', '会社には、兄が出勤していないと言われた。'), fact('akari-family', '両親はもうおらず、兄と二人で暮らしている。'),
    fact('request_accepted', '兄の捜索依頼を受けた。'), fact('safety-reported', '本人の声で兄の無事を確認した。'), fact('F77', '事務所で兄と向き合い、これからのことを二人で話した。'),
  ] },
  { id: 'naoto', category: 'people', title: 'あかりの兄', source: information('mentioned-naoto', 'brother-profile'), titleUpdates: [{ source: information('named-naoto'), title: '高瀬直人' }], imageSrc: face('naoto'), portraitSource: information('met-naoto'), description: 'あかりが帰りを待っている兄。', facts: [
    fact('known-naoto-age', '29歳と聞いた。'), fact('F04', '東成ビルサービスに勤めている。'), fact('naoto-daily', '遅くなる時には連絡する、と妹が話した。'),
    fact('I02', '失踪当日は休暇を取り、黒田部長との面会を予定していた。'), fact('I04-sighting', '管理人が、昨日ビルへ来た本人を確認した。'),
    fact('I04', '宮原を介して連絡があり、対面を約束した。'), fact('met-naoto', '成子坂共同ビルで本人と対面した。'), fact('safety-reported', '本人の声で妹へ無事を知らせた。'),
    fact('naoto-witness', '転落直後に戻る黒田の顔を見た。押す瞬間は見ていない。'), fact('W01b', '妹の学費と仕事への圧力を受け、当時は何も見ていないと答えた。'),
    fact('naoto-threat', '今回は妹への脅しを受け、身を隠したと話した。'), fact('F50', '警察へ話し、当時の回答を訂正する意思を示した。'), fact('F77', '妹とこれからのことを話した。黙った責任まで消えたわけではない。'),
  ] },
  { id: 'kuroda', category: 'people', title: '黒田部長', source: information('mentioned-kuroda', 'I02'), titleUpdates: [{ source: information('named-kuroda'), title: '黒田征司' }], imageSrc: face('kuroda'), portraitSource: information('met-kuroda'), description: '直人が面会を申し込んだ会社の部長。', facts: [fact('I03', '事故当日は現場にいなかった、と説明した。未検証の証言。'), fact('E01', '管理日誌には当日の鍵の貸出が記されている。'), fact('E04', '受領原本に当日の署名がある。'), fact('W03', '警察で、三崎を押したことを認めた。')] },
  { id: 'miyahara', category: 'people', title: 'ビルの管理人', source: information('mentioned-miyahara', 'recognized-miyahara', 'met-miyahara'), titleUpdates: [{ source: information('named-miyahara'), title: '宮原文雄' }], imageSrc: face('miyahara'), portraitSource: information('met-miyahara'), description: '成子坂共同ビルの管理人。', facts: [fact('F24', '本人から宮原と名乗った。会社の社員ではなく、建物の管理を担う。'), fact('F26', '昨日の直人を見たと話した。'), fact('E01', '管理日誌の記録を保管している。'), fact('W02a', '三崎の背中を押す動作を見た。'), fact('W02b', '人物は旧事務室側へ戻った。顔は戸の陰で見えなかった。'), fact('W02', '当時話せなかった内容を、改めて証言した。')] },
  { id: 'misaki', category: 'people', title: '事故で亡くなった社員', source: information('mentioned-misaki', 'I03'), titleUpdates: [{ source: information('named-misaki'), title: '三崎健' }], imageSrc: face('misaki'), portraitSource: information('seen-misaki-photo'), description: '成子坂共同ビルの過去の転落事件で亡くなった社員。', facts: [fact('E03', '負傷した社員の扱いについて、人員と指示の確認を求める報告書を残していた。'), fact('W02a', '背中を押す動作を見たという証言が得られた。')] },
  { id: 'okumura', category: 'people', title: '刑事', source: information('mentioned-okumura', 'met-okumura', 'E02'), titleUpdates: [{ source: information('named-okumura'), title: '奥村修一' }], imageSrc: face('okumura'), portraitSource: information('met-okumura'), description: '湊が連絡を取る刑事。', facts: [fact('met-okumura', '西新宿警察署で面会した。'), fact('E02', '説明できる範囲で当時の事故の扱いを確認した。'), fact('F51', '兄妹への脅しについて相談を受けた。'), fact('E04', '文書と独立した証言の確認を進めている。')] },
  { id: 'segawa', category: 'people', title: '若い刑事', source: information('mentioned-segawa', 'met-segawa'), titleUpdates: [{ source: information('named-segawa'), title: '瀬川亮介' }], imageSrc: face('segawa'), portraitSource: information('met-segawa'), description: '奥村とともに面会する刑事。', facts: [fact('named-segawa', '奥村の部下として紹介された。'), fact('E04', '報告書の原本と控えを照合した。'), fact('I05', '目撃の位置と時間関係を照合した。')] },
  { id: 'narumi', category: 'people', title: '情報屋', source: information('mentioned-narumi', 'narumi-rumor'), titleUpdates: [{ source: information('named-narumi'), title: '鳴海ユウ' }], imageSrc: face('narumi'), portraitSource: information('met-narumi'), description: '会社の外側の話を調べる情報屋。', facts: [fact('narumi-rumor', '電話で未確認の話を補った。今回、直接の対面はしていない。')] },
  { id: 'company-reception', category: 'people', title: '会社の受付の女性', source: information('mentioned-company-reception', 'recognized-company-reception'), description: '東成ビルサービスの窓口。', facts: [fact('met-company-reception', '受付カウンターで存在を確認した。'), fact('F14', '直人の休暇記録を確認した。')] },
  { id: 'police-reception', category: 'people', title: '警察署の受付の女性', source: information('recognized-police-reception'), description: '西新宿警察署の窓口。', facts: [fact('F34', '奥村との面会を取り次いだ。')] },
]
export const revisionRecords: readonly InvestigationEntry[] = [
  { id: 'initial-inquiry', category: 'events', title: '初動調査の帰所報告', source: information('initial-inquiry-reviewed'), timeLabel: '10月8日（木）14:30', chronologicalOrder: 18, description: '会社と旧ビルで得た情報を澪と確認した。兄が過去事故の説明を求めていた理由はまだ分からず、警察の当時の記録を確かめることになった。' },
  ...people, ...episode1Part1Records.filter(entry => entry.category !== 'people').map(entry => {
    if (entry.id === 'E02') return { ...entry, description: '奥村が説明できる範囲で、不注意による転落として扱われていたことを確認した。', facts: [fact('F36', '直人は当時、何も見ていないと答えていた。')] }
    if (entry.id === 'demolition') return { ...entry, description: '10月10日から取り壊しに着手する予定と掲示されている。', facts: [fact('F29', '管理日誌を処分せず保管してもらうよう依頼した。')] }
    if (entry.id === 'safety') return { ...entry, timeLabel: '10月8日（木）16:35' }
    return entry
  }),
  { id: 'journal-copy', category: 'belongings', title: '管理日誌の写し', source: information('IT02'), description: '宮原の了承を得た当日の記録の写し。原本は管理人が保管する。' },
  { id: 'report-copy', category: 'belongings', title: '報告書の控え', source: information('IT03'), description: '直人の了承を得て確認した三崎の報告書の控え。' },
  { id: 'site-plan', category: 'belongings', title: '現場図', source: information('IT04'), description: '階段と戸口を記録した図。証言者それぞれの位置を確かめる。' },
  { id: 'receipt-check', category: 'belongings', title: '原本との照合記録', source: information('IT05'), description: '警察が確認した原本と控えの照合記録。原本自体を持ち出したものではない。' },
]
