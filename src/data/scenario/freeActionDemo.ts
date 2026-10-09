import type { Scenario, Stage } from '../../types/scenario'

const stage: Stage = { backgroundId: 'office-afternoon', characterId: 'mio', expression: 'normal' }
export const freeActionDemo: Scenario = {
  id: 'gray-testimony-part1-demo',
  title: '第1話「灰色の証言」第1部「依頼」の通し仮シナリオ（正式シナリオではありません）',
  start: 'office-daily',
  nodes: {
    'office-daily': { type: 'dialogue', stage: { ...stage, characterId: 'minato' }, speakerId: 'minato', text: '午後の事務所は静かだ。冷めたコーヒーを片づけようとした時、扉が鳴った。', next: 'visitor' },
    visitor: { type: 'dialogue', stage, speakerId: 'mio', text: '相澤澪と申します。相談してもよろしいでしょうか。', next: 'welcome' },
    welcome: { type: 'dialogue', stage: { ...stage, characterId: 'minato' }, speakerId: 'minato', text: '佐伯湊です。どうぞ、お掛けください。', next: 'request-intro' },
    'request-intro': { type: 'dialogue', stage, speakerId: 'mio', text: '兄がいなくなったんです。探していただけませんか。', next: 'begin-inquiry' },
    'begin-inquiry': { type: 'dialogue', stage: { ...stage, characterId: 'minato' }, speakerId: 'minato', text: 'まずは事情を聞かせてください。写真などがあれば、それも見せていただきたい。', next: 'menu' },
    menu: { type: 'choice', mode: 'free-action', stage, prompt: '何をしますか？', options: [
      { id: 'talk', label: '聞く', next: 'topics' },
      { id: 'look', label: '見る／調べる', next: 'targets' },
      { id: 'think', label: '考える', next: 'think' },
    ] },
    topics: { type: 'topic', stage, prompt: '何について聞きますか？', options: [
      { id: 'brother', label: '兄について', next: 'brother' },
      { id: 'missing', label: '失踪について', next: 'missing' },
      { id: 'recent-brother', label: '最近の兄について', next: 'recent-brother', condition: { type: 'heardTopic', id: 'brother' } },
      { id: 'accident', label: '過去の事故について', next: 'accident', condition: { type: 'heardTopic', id: 'recent-brother' } },
      { id: 'return', label: '戻る', next: 'menu' },
    ] },
    targets: { type: 'inspect', stage, prompt: 'どこを調べますか？', options: [
      { id: 'client', label: '依頼人', next: 'client' },
      { id: 'photo', label: '兄の写真', next: 'photo' },
      { id: 'return', label: '戻る', next: 'menu' },
    ] },
    brother: { type: 'dialogue', stage, speakerId: 'mio', text: '兄は几帳面な人です。連絡を絶やしたことはありませんでした。', next: 'menu', updates: [
      { type: 'addHeardTopic', id: 'brother' }, { type: 'addInformation', id: 'brother_profile' },
    ] },
    missing: { type: 'dialogue', stage, speakerId: 'mio', text: '三日前から兄と連絡が取れないんです。', next: 'menu', updates: [
      { type: 'addHeardTopic', id: 'missing' }, { type: 'addInformation', id: 'missing_date' }, { type: 'addInformation', id: 'disappearance_timing' },
    ] },
    'recent-brother': { type: 'dialogue', stage, speakerId: 'mio', text: '最後に連絡があった時、昔の事故の記録を調べに行くと言っていました。', next: 'menu', updates: [
      { type: 'addHeardTopic', id: 'recent-brother' }, { type: 'addInformation', id: 'brother_recent' }, { type: 'addInformation', id: 'last_known_activity' },
    ] },
    accident: { type: 'dialogue', stage, speakerId: 'mio', text: '兄は以前の事故について、まだ確かめたいことがあると話していました。', next: 'menu', updates: [
      { type: 'addHeardTopic', id: 'accident' }, { type: 'addInformation', id: 'past_accident' },
    ] },
    think: {
      type: 'think', stage: { ...stage, characterId: 'minato', expression: 'serious' }, speakerId: 'minato',
      requiredInformation: [
        { id: 'brother_profile', summary: '兄は連絡を絶やさない几帳面な人だ' },
        { id: 'disappearance_timing', summary: '連絡が途絶えた時期' },
        { id: 'last_known_activity', summary: '最後に確認された兄の行動' },
        { id: 'past_accident', summary: '兄が気にしていた過去の事故' },
      ],
      insufficient: { text: 'まだ材料が足りない。まずは話を聞き、周囲を調べよう。', next: 'menu' },
      partial: { text: '手掛かりはある。今の話を整理してみよう。', next: 'menu' },
      complete: { text: '連絡を絶やさない兄が、過去の事故を調べた後に姿を消した。……これは単なる失踪ではない。依頼を受けよう。', next: 'accept-request' },
    },
    'accept-request': { type: 'dialogue', stage: { ...stage, characterId: 'minato' }, speakerId: 'minato', text: '依頼を引き受けます。お兄さんの足取りを、事故の記録から追ってみましょう。', next: 'accepted', updates: [
      { type: 'setFlag', id: 'request_accepted', value: true },
    ] },
    accepted: { type: 'dialogue', stage: { ...stage, characterId: 'minato' }, speakerId: 'minato', text: '第1部「依頼」完了。調査に出る準備はできた。', next: 'part2-placeholder', updates: [
      { type: 'setFlag', id: 'part1_completed', value: true },
    ] },
    'part2-placeholder': { type: 'end', stage: { ...stage, characterId: 'minato' }, text: '第2部開始用の仮遷移先です。ここからの本編は未実装です。' },
    client: { type: 'dialogue', stage: { ...stage, characterId: 'minato' }, speakerId: 'minato', text: '落ち着いて話しているが、手元には緊張が見える。', next: 'menu', updates: [
      { type: 'addInspectedTarget', id: 'client' },
    ] },
    photo: { type: 'dialogue', stage: { ...stage, characterId: 'minato', expression: 'serious' }, speakerId: 'minato', text: '写真の裏に、小さな日付が書かれている。', next: 'menu', updates: [
      { type: 'addInspectedTarget', id: 'photo' }, { type: 'addInformation', id: 'photo_date' },
      { type: 'setFlag', id: 'photo_examined', value: true },
    ] },
  },
}
