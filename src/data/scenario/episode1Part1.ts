import type { Choice, Scenario, Scene, StateUpdate } from '../../types/scenario'
import { episode1Part1Legacy } from './episode1Part1Legacy'
import { episode1Part1Records } from './episode1Part1Records'
import { resolveExpression } from '../presentation'
import { buildRevision } from './buildRevision'
import { revisionData } from './revisionData'
import { revisionRecords } from './revisionRecords'

// 保存済みノードIDを残し、ver2のデータを同じシナリオとして読み込める。
const scenes: Record<string, Scene> = {
  routine: { backgroundId: 'office-before-noon', characters: [{ characterId: 'minato', expression: 'normal', position: 'left' }, { characterId: 'mio', expression: 'smile', position: 'right' }], smokingAllowed: true },
  request: { backgroundId: 'office-before-noon', characters: [{ characterId: 'minato', expression: 'normal', position: 'left' }, { characterId: 'akari', expression: 'worried', position: 'right' }], smokingAllowed: true },
  company: { backgroundId: 'company-reception', characters: [{ characterId: 'mio', expression: 'serious', position: 'left' }], smokingAllowed: false },
  kuroda: { backgroundId: 'company-reception', characters: [{ characterId: 'kuroda', expression: 'normal', position: 'right' }], smokingAllowed: false },
  building: { backgroundId: 'building-entrance', characters: [{ characterId: 'miyahara', expression: 'normal', position: 'right' }], smokingAllowed: false },
  stairs: { backgroundId: 'building-stairs', characters: [{ characterId: 'mio', expression: 'serious', position: 'left' }], smokingAllowed: false },
  police: { backgroundId: 'building-entrance', characters: [{ characterId: 'okumura', expression: 'serious', position: 'left' }, { characterId: 'segawa', expression: 'serious', position: 'right' }], smokingAllowed: false },
  office: { backgroundId: 'office-before-noon', characters: [{ characterId: 'mio', expression: 'serious', position: 'right' }], smokingAllowed: true },
  brother: { backgroundId: 'building-entrance', characters: [{ characterId: 'naoto', expression: 'worried', position: 'right' }], smokingAllowed: false },
  interview: { backgroundId: 'building-room', characters: [{ characterId: 'naoto', expression: 'serious', position: 'right' }], smokingAllowed: false },
  documents: { backgroundId: 'old-office', characters: [{ characterId: 'okumura', expression: 'serious', position: 'left' }, { characterId: 'segawa', expression: 'serious', position: 'right' }], smokingAllowed: false },
  conclusion: { backgroundId: 'company-reception', characters: [{ characterId: 'okumura', expression: 'serious', position: 'left' }, { characterId: 'kuroda', expression: 'normal', position: 'right' }], smokingAllowed: false },
  reunion: { backgroundId: 'office-before-noon', characters: [{ characterId: 'naoto', expression: 'serious', position: 'left' }, { characterId: 'akari', expression: 'sad', position: 'right' }], smokingAllowed: true },
}
const nodes: Scenario['nodes'] = { ...episode1Part1Legacy.nodes }
const times: Record<string, string> = {}
let time = '2026年10月8日（木）10:40'
const info = (id: string): StateUpdate => ({ type: 'addInformation', id })
const flag = (id: string): StateUpdate => ({ type: 'setFlag', id, value: true })
const has = (...ids: string[]) => ({ type: 'hasAllInformation' as const, ids })
type Line = [string, string, string?]
function sequence(id: string, sceneId: string, lines: Line[], next: string, updates: StateUpdate[] = []) {
  lines.forEach(([speakerId, text, expression], index) => {
    if (speakerId === 'naoto' && expression === 'sad') expression = 'pained'
    const key = index === 0 ? id : `${id}-${index + 1}`
    let scene = sceneId
    if (expression && scenes[sceneId].characters?.some(person => person.characterId === speakerId)) {
      scene = `${sceneId}-${speakerId}-${expression}`
      scenes[scene] = { ...scenes[sceneId], characters: scenes[sceneId].characters?.map(person => person.characterId === speakerId ? { ...person, expression } : person) }
    }
    nodes[key] = { type: 'dialogue', sceneId: scene, stage: scenes[scene], speakerId, text, next: index === lines.length - 1 ? next : `${id}-${index + 2}`, updates: index === lines.length - 1 ? updates : [] }
    times[key] = time
  })
  return id
}
function menu(id: string, sceneId: string, options: Choice[], empty: string) {
  nodes[id] = { type: 'choice', mode: 'free-action', keepQuestions: true, implementedCommands: ['talk', 'look', 'think', 'organize', 'move'], sceneId, stage: scenes[sceneId], prompt: '次の行動', options, empty: { label: '話を続ける', next: empty } }
  times[id] = time
}
function topics(id: string, parent: string, sceneId: string, options: Choice[], commandId: 'talk' | 'look' = 'talk') {
  nodes[id] = { type: commandId === 'talk' ? 'topic' : 'inspect', parent: { commandId, nodeId: parent }, sceneId, stage: scenes[sceneId], prompt: commandId === 'talk' ? '何を聞く？' : '何を調べる？', options }
  times[id] = time
}
function subject(id: string, label: string, scene: string, lines: Line[], parent: string, condition?: Choice['condition'], acquired: string[] = []) {
  sequence(id, scene, lines, parent, [{ type: 'addHeardTopic', id }, ...acquired.map(info)])
  sequence(`${id}-summary`, scene, [['narrator', lines.filter(line => line[0] !== 'narrator').map(line => line[1]).slice(-2).join('\n')]], parent)
  return { id, label, next: id, repeatNext: `${id}-summary`, condition }
}
function map(id: string, current: string, back: string, destination: string, next: string, condition?: Choice['condition']) {
  nodes[id] = { type: 'choice', stage: scenes[current === 'office' ? 'office' : current === 'building' ? 'building' : 'company'], prompt: '移動先', map: { current, back }, options: [{ id: destination, label: destination === 'company' ? '東成ビルサービス' : destination === 'building' ? '成子坂共同ビル' : '佐伯探偵事務所', next, condition }, { id: 'return', label: '戻る', next: back }] }
  times[id] = time
}
function question(id: string, scene: string, prompt: string, answers: [string, string, boolean][], next: string, hint: string) {
  nodes[id] = { type: 'choice', stage: scenes[scene], sceneId: scene, prompt, options: answers.map(([answerId, label, correct]) => ({ id: answerId, label, next: correct ? next : `${id}-hint`, updates: correct ? [flag(`${id}-solved`)] : [] })) }
  sequence(`${id}-hint`, scene, [['narrator', hint]], id)
  times[id] = time
}

sequence('opening-1', 'routine', [
  ['narrator', '窓の向こうで、配送のトラックが一度だけクラクションを鳴らした。机の上には、昨日閉じたままの帳簿がある。'],
  ['mio', '佐伯さん。コーヒー、置きますね。', 'smile'],
  ['minato', 'ありがとう。……その帳簿も、置いておいてくれ。'],
  ['mio', 'もう置いてあります。昨日と同じところに。'],
  ['narrator', 'カップだけを手元へ引き寄せた。澪は帳簿を開かず、俺の向かいに座る。'],
  ['mio', '今日は、午後までお約束はありません。今のうちに片づけませんか？'],
  ['minato', 'コーヒーが冷めてからでいいか？'],
  ['mio', '冷めたら、淹れ直してほしくなるでしょう？'],
  ['minato', 'よく分かってる。'],
  ['mio', '何年、ここでコーヒーを淹れていると思っていらっしゃるんですか。'],
  ['narrator', '澪は小さく笑って、紙の端をそろえた。湯気の向こうで時計が進む。依頼のない午前は、だいたいこんなものだ。'],
  ['narrator', 'インターホンが鳴った。俺がカップを戻すより先に、澪が立ち上がった。'],
  ['mio', 'はい、佐伯探偵事務所です。どうぞ、お入りください。'],
], 'visitor-arrives')
sequence('visitor-arrives', 'request', [
  ['narrator', '扉の前に、赤いカーディガンの若い女性が立っていた。鞄の肩紐を、両手で握っている。'],
  ['akari', '予約していないんですけど……相談をしても、いいですか？', 'worried'],
  ['mio', 'もちろんです。こちらへどうぞ。今日は、どのようなご相談でしょうか？'],
  ['akari', '高瀬あかりといいます。兄が帰ってこなくて……。'],
  ['minato', '佐伯だ。まず、座ってくれ。'],
  ['narrator', 'あかりは椅子を半分だけ引き、浅く腰を下ろした。澪が、新しいカップにお茶を注ぐ。'],
  ['mio', '急いで話さなくて大丈夫ですよ。熱いので、ゆっくりどうぞ。'],
  ['akari', 'ありがとうございます。ここ、駅からの道で看板を見て。それで、調べて……。'],
  ['minato', '兄の名前を聞いてもいいか？'],
  ['akari', '高瀬直人です。二十九歳で、ビルの管理や修繕の仕事をしています。'],
  ['narrator', '澪は名前を書いてから、ペンを止めた。答えを急かす音まで消えた気がした。'],
  ['minato', 'いつから、帰っていない？'],
  ['akari', '月曜日……五日の朝です。今日で三日になります。兄を、捜していただきたいんです。', 'serious'],
], 'office-menu', [info('met-akari'), info('brother-profile')])
menu('office-menu', 'request', [
  { id: 'talk', label: '聞く', next: 'office-topics' }, { id: 'look', label: '調べる', next: 'office-targets' },
  { id: 'think', label: '考える', next: 'office-reflection' },
], 'visitor-arrives')
const morning = subject('morning', '最後の朝', 'request', [
  ['mio', '最後に会った朝は、どんな様子でしたか？'],
  ['akari', '普通でした。七時半ごろ、いつもの服で。私が、帰りに牛乳を買ってくるって言ったら、「頼む」って。'],
  ['minato', '仕事へ行く、と兄が言ったのか？'],
  ['akari', '……言っていません。いつもの時間だったので、私がそう思いました。', 'serious'],
  ['narrator', 'あかりはカップに触れ、すぐ手を引いた。熱さを忘れていたらしい。'],
  ['akari', 'それが最後です。何か、変なところがなかったかって、何度も考えて。でも……。'],
  ['minato', '今、思い出せないことは、そのままでいい。覚えていることを聞かせてくれ。'],
  ['mio', '「仕事へ行った」ではなく、「いつもの時間に家を出た」と書いておきますね。'],
], 'office-menu', undefined, ['morning'])
const contact = subject('contact', '連絡を試したこと', 'request', [
  ['minato', '兄に連絡は取れたか？'],
  ['akari', '電話も、メッセージも返ってきません。最初は、仕事が長引いたのかと思っていました。'],
  ['mio', '最初に電話をかけたのは、月曜日の夜ですか？'],
  ['akari', 'はい。夕飯を残して、先に寝て……。次の朝も、そのままでした。'],
  ['minato', '返事がないまま、何度か連絡をしたんだな。'],
  ['akari', 'はい。「どこにいるの」ばかり送ってしまって。最後のは、「何でもいいから返して」って。', 'sad'],
  ['narrator', '鞄から出したスマホを、あかりは裏返して膝に置いた。新しい通知は来ていなかった。'],
  ['mio', '連絡を試したことも、分かりました。送った言葉を責めなくて大丈夫ですよ。'],
], 'office-menu', undefined, ['contact'])
const workplace = subject('workplace', '勤務先', 'request', [
  ['minato', '勤務先を教えてくれ。会社には、もう聞いたか？'],
  ['akari', '東成ビルサービスです。火曜日に電話したら、その日から来ていないと言われました。'],
  ['mio', '「その日」は、月曜日のことですね？'],
  ['akari', 'はい。私、仕事に行ったはずですって言ったんですけど……。'],
  ['minato', '会社からは、それ以上の説明はなかった？'],
  ['akari', '担当の人がいないので、分からないと。私も、何を聞けばいいのか分からなくなって。'],
  ['mio', '窓口で分かったことと、お兄さんの予定は別かもしれません。勤務の記録を確認しましょう。'],
  ['narrator', '会社の名前の下に、澪が一本の線を引いた。行き先が一つ、形になった。'],
], 'office-menu', undefined, ['workplace'])
topics('office-topics', 'office-menu', 'request', [morning, contact, workplace,
  subject('daily', '兄の普段の連絡', 'request', [
    ['akari', '遅くなる時は、必ず連絡をくれます。「先に食べて」とか、「今日は遅い」とか、短いんですけど。'],
    ['minato', '三日も黙っているのは、普段の兄とは違うんだな。'],
    ['akari', 'はい。私が返すのを忘れると、朝、何も言わずにスマホを指して……。'],
    ['narrator', 'あかりは少し笑いかけた。そこに、今いない兄の姿が見えたようだった。'],
    ['akari', 'あの時は、細かいなって思ってました。', 'sad'],
  ], 'office-menu', has('contact'), ['naoto-daily']),
  subject('family', '家族と頼れる人', 'request', [
    ['akari', '両親はもういません。今は兄と二人で暮らしています。'],
    ['mio', 'お兄さん以外に、連絡を取れそうな方はいらっしゃいますか？'],
    ['akari', '思いつく人には聞きました。でも、誰も……。兄は、仕事のことを家ではあまり話さないので。'],
    ['minato', '知らないことまで答えなくていい。会社の人間には、こちらから聞く。'],
  ], 'office-menu', has('morning'), ['akari-family']),
  subject('police-consultation', '警察への相談', 'request', [
    ['minato', '警察には相談したか？'],
    ['akari', 'はい。会社に電話したあとで。でも、事件に巻き込まれたかは分からないって。'],
    ['mio', 'ご相談したことは、記録に残しておきます。'],
    ['akari', '私、自分でも何かしないと。待っているだけじゃ、帰ってくるかも分からなくて。', 'determined'],
    ['minato', 'ここへ来たのも、そのためだな。'],
  ], 'office-menu', has('contact'), ['police-consulted']),
  { id: 'request', label: '捜索の依頼について', next: 'accept-1', condition: has('I01') },
])
topics('office-targets', 'office-menu', 'request', [
  { id: 'cup', label: 'お茶と手元', next: 'cup-1' },
  { id: 'bag', label: 'あかりの鞄', next: 'bag-observation' },
], 'look')
sequence('cup-1', 'request', [['narrator', 'カップはほとんど減っていない。縁に添えた指が白い。あかりは俺の視線に気づき、少しだけ手の力を抜いた。'], ['mio', '冷めてしまったら、淹れ直しますね。']], 'office-menu', [{ type: 'addInspectedTarget', id: 'cup' }])
sequence('bag-observation', 'request', [['narrator', '膝の上の鞄は、口が少し開いている。スマホと、透明な袋に入れた写真が見えた。勝手に手を伸ばすものではない。']], 'office-menu', [{ type: 'addInspectedTarget', id: 'bag' }])
sequence('office-reflection', 'request', [['narrator', 'いつもの朝だったことと、その後もいつもどおりだったことは違う。あかりが見たこと、連絡して確かめたことを分けて聞こう。']], 'office-menu')
time = '2026年10月8日（木）11:15'
sequence('accept-1', 'request', [
  ['minato', '兄が家を出た。その後、連絡がなく、会社でも姿を確認できていない。まずは、その間を調べる。'],
  ['akari', '料金は、どのくらい……。'],
  ['narrator', 'あかりは鞄を膝に引き寄せた。財布を出すか迷ってから、俺を見た。'],
  ['akari', '私の貯金で、どこまでお願いできますか？'],
  ['narrator', '俺は紙に書いて、彼女へ向けた。澪は説明の途中で口を挟まず、あかりが紙を読むのを待っていた。'],
  ['minato', 'まず足取りを調べるなら、これくらいだ。分からないところがあれば、聞いてくれ。'],
  ['akari', '……お願いします。'],
  ['minato', '今、答えを急がなくてもいい。'],
  ['akari', '兄がどこにいるか、知りたいんです。', 'determined'],
  ['narrator', '紙を押さえた指はまだ硬かった。声は、ここへ来た時よりはっきりしている。'],
  ['minato', '分かった。引き受ける。'],
  ['mio', 'お兄さんのお写真をお持ちですか？ ご連絡先も、お預かりしてよろしいでしょうか？'],
], 'photo-handoff', [flag('request_accepted')])
sequence('photo-handoff', 'request', [
  ['akari', 'はい。これ、最近の写真です。顔が分かるものを、持ってきました。'],
  ['narrator', '透明な袋から、あかりが写真を抜いた。角を曲げないよう、両手で机へ置く。'],
  ['mio', 'こちらがお兄さんですね。髪型や眼鏡は、今も同じですか？'],
  ['akari', 'はい。……仕事の帰りは、だいたいこの顔です。少し疲れて見えますけど。'],
  ['minato', '捜す時に使わせてもらう。大切に預かる。'],
  ['akari', 'お願いします。', 'serious'],
], 'photo-received')
nodes['photo-received'] = { type: 'dialogue', stage: scenes.request, sceneId: 'request', speakerId: 'narrator', text: '高瀬直人の写真を受け取った。', next: 'contact-handoff', acquisition: { itemId: 'naoto-photo', title: '高瀬直人の写真', imageSrc: resolveExpression('naoto', 'normal').imageSrc! }, updates: [info('search-photo')] }
times['photo-received'] = time
sequence('contact-handoff', 'request', [
  ['narrator', '澪が、あかりの連絡先を確認する。一桁ずつ読み返す声に、あかりがうなずいた。'],
  ['mio', 'お兄さんについて分かったことがあれば、こちらへご連絡します。知らない番号でも、事務所からかもしれません。'],
  ['akari', '分かりました。電話、持っておきます。'],
  ['minato', '兄から連絡があった時も、教えてくれ。責める言葉を考えるのは、そのあとでいい。'],
  ['akari', '……はい。帰ってきたら、まず、顔を見たいです。', 'relieved'],
  ['narrator', '澪が扉まで見送った。靴音が階段へ消える。机の上に、写真だけが残った。'],
], 'departure', [info('akari-contact')])
scenes.after = { ...scenes.office, characters: [{ characterId: 'minato', expression: 'serious', position: 'left' }, { characterId: 'mio', expression: 'serious', position: 'right' }] }
menu('departure', 'after', [{ id: 'talk', label: '聞く', next: 'after-topics' }, { id: 'look', label: '調べる', next: 'after-targets' }, { id: 'think', label: '考える', next: 'after-thought' }, { id: 'organize', label: '整理する', next: 'organize', condition: has('I01', 'search-photo', 'akari-contact') }], 'departure-insufficient-1')
topics('after-topics', 'departure', 'after', [subject('mio-reaction', '澪の気づき', 'after', [['mio', '帰りを待つ方が、こんなに不安そうなのに。お兄さんは、何も知らないかもしれませんね。'], ['minato', '知っていて連絡できない可能性もある。まだ、決めない。'], ['mio', 'はい。あかりさんが知っているお兄さんと、月曜日の行動を、少しずつ確かめましょう。']], 'departure')])
topics('after-targets', 'departure', 'after', [{ id: 'photo', label: '預かった写真', next: 'photo-inspect' }], 'look')
sequence('photo-inspect', 'after', [['narrator', '写真の中の直人は、まっすぐこちらを見ている。あかりが知っている、いつもの兄の顔だ。写っていない事情まで、ここから読もうとしてはいけない。']], 'departure', [{ type: 'addInspectedTarget', id: 'photo' }])
sequence('after-thought', 'after', [['narrator', '写真と連絡先は預かった。あかりの話のどこまでが確認済みで、どこからが推測か。最初の行き先を決める前に、澪とそろえておこう。']], 'departure')
nodes.organize = { type: 'think', stage: scenes.after, sceneId: 'after', speakerId: 'minato', requiredInformation: [{ id: 'I01', summary: '最後の朝・連絡・勤務先' }, { id: 'search-photo', summary: '捜索用の写真' }, { id: 'akari-contact', summary: '依頼人の連絡先' }], insufficient: { text: '聞き取りと、預かるものを確かめよう。', next: 'office-menu' }, partial: { text: '写真と連絡先の受け取りを終えよう。', next: 'accept-1' }, complete: { text: '確かなのは、家を出たことと、その後連絡がないこと。出勤したかどうかは、会社で確かめる。', next: 'part1-complete' } }
sequence('part1-complete', 'after', [['mio', 'まず、東成ビルサービスですね。'], ['minato', 'ああ。本人の勤務記録を見てもらおう。'], ['narrator', '澪は手帳を閉じた。俺は写真を内ポケットへ入れる。帰りを待つ人がいる。出かける理由は、それで十分だった。']], 'part2-start', [flag('part1_completed')])
time = '2026年10月8日（木）11:35'
sequence('part2-start', 'after', [['narrator', '第2部　展開\n事務所を出る前に、行き先を確認する。']], 'travel-ready')
menu('travel-ready', 'after', [{ id: 'move', label: '移動', next: 'destinations' }, { id: 'talk', label: '聞く', next: 'travel-topics' }], 'part2-start')
topics('travel-topics', 'travel-ready', 'after', [subject('travel-plan', '会社で確認すること', 'after', [['mio', '勤務記録、最後の出勤、それから同僚の方が覚えていることですね。'], ['minato', '写真を見せて、誰について聞いているかも確かめよう。']], 'travel-ready')])
map('destinations', 'office', 'travel-ready', 'company', 'company-arrival-1', has('I01', 'search-photo'))
time = '2026年10月8日（木）12:00'
sequence('company-arrival-1', 'company', [['narrator', '東成ビルサービス。受付の奥で電話が鳴っている。澪が声をかけると、担当者が応接スペースへ案内した。'], ['company-staff', '高瀬さんの妹さんから、昨日もお電話がありました。まだ連絡がつかないんですか？'], ['minato', 'ああ。妹さんの依頼で捜している。少し、確認させてくれ。']], 'company-menu')
menu('company-menu', 'company', [{ id: 'talk', label: '聞く', next: 'company-topics' }, { id: 'think', label: '考える', next: 'company-thought' }], 'company-arrival-1')
topics('company-topics', 'company-menu', 'company', [subject('leave-and-appointment', '休暇記録と面会申込み', 'company', [
  ['company-staff', '記録を確認しました。高瀬さんは、月曜日は休暇を取っていました。'], ['mio', '欠勤ではなく、あらかじめ申請していた休暇ですか？'], ['company-staff', 'はい。私用、と。妹さんには来ていないとしかお答えできなくて……。その後も欠勤が続いているので、こちらも心配しています。'],
  ['minato', '休暇の日に、会社の誰かと会う予定はあったか？'], ['company-staff', '黒田部長との面会を頼まれていました。内容までは聞いていません。'], ['mio', 'お仕事のご相談だったのでしょうか？'], ['company-staff', '古い事務所の片づけの件かと思っていました。成子坂共同ビルです。明後日から取り壊しになるので。'], ['narrator', '成子坂共同ビル。あそこで人が死んだことは、覚えていた。事故だった。少なくとも、そう聞いていた。'], ['minato', '黒田部長に、面会を申し入れたい。'], ['company-staff', '確認します。こちらでお待ちください。'],
], 'company-menu', undefined, ['I02']), subject('staff-followup', '最初の回答について', 'company', [['mio', '最初のお電話では、勤務の記録までは確認されなかったんですね。'], ['company-staff', '窓口で、出勤していないことだけお伝えしました。休暇の理由まで、私から答えてよいか分からなくて。'], ['minato', '分かった。休んだことと、そのあと帰らないことは、分けて確かめる。']], 'company-menu', has('I02')),
  { id: 'meet-kuroda', label: '黒田部長との面会', next: 'kuroda-meeting', condition: has('I02') },
])
sequence('company-thought', 'company', [['narrator', '休みを取って会いに行ったなら、家を出た時には目的があった。何の話をして、どこへ向かったのか。面会相手に聞こう。']], 'company-menu')
sequence('part2-boundary', 'company', [['narrator', '黒田部長が面会に応じた。確認した内容を手帳に挟み、俺たちは応接の席を移った。']], 'kuroda-meeting')
time = '2026年10月8日（木）12:20'
sequence('kuroda-meeting', 'kuroda', [['narrator', '黒田は名刺を受け取り、机の端へ置いた。直人の写真には、短く目を落としただけだった。'], ['kuroda', '高瀬君から会いたいと言われたのは、確かです。何をお知りになりたいんですか？']], 'kuroda-menu', [info('met-kuroda')])
menu('kuroda-menu', 'kuroda', [{ id: 'talk', label: '聞く', next: 'kuroda-topics' }, { id: 'think', label: '考える', next: 'kuroda-thought' }, { id: 'move', label: '移動', next: 'company-map', condition: has('I03') }], 'kuroda-meeting')
topics('kuroda-topics', 'kuroda-menu', 'kuroda', [subject('meeting-purpose', '直人との面会', 'kuroda', [
  ['minato', '何の話だった？'], ['kuroda', '昔の事故です。もう終わったことを、急に持ち出しまして。'], ['mio', '何とおっしゃっていたんですか？'], ['kuroda', '本当のことを話してほしい、と。意味が分からない。'], ['minato', '成子坂共同ビルで亡くなった社員のことか？'], ['kuroda', '三崎です。気の毒でしたが、階段で足を滑らせた事故です。'], ['minato', '高瀬は、そう思っていない。'], ['kuroda', '彼は当時、何も見ていないと答えています。私も、その日は現場にいませんでした。'], ['narrator', '尋ねていないはずの「何も見ていない」が、先に出てきた。澪のペン先が止まる。'], ['mio', '面会のあと、高瀬さんはどちらへ向かいましたか？'], ['kuroda', '知りません。こちらが聞きたいくらいです。'], ['minato', '妹が捜している。'], ['kuroda', 'なら、帰るように言ってください。仕事を放り出してもらっては困ります。'],
], 'kuroda-menu', undefined, ['I03']), subject('misaki-work', '三崎の仕事ぶり', 'kuroda', [['kuroda', '熱心でしたよ。ただ、何でも自分で抱え込むところがあった。'], ['minato', '高瀬もそうだと？'], ['kuroda', '……似たところはあります。'], ['mio', '三崎さんのお仕事の記録は、残っていますか？'], ['kuroda', '古いものは整理中です。個人の書類を、外の方に渡すわけにはいきません。']], 'kuroda-menu', has('I03'))])
sequence('kuroda-thought', 'kuroda', [['narrator', '高瀬が何を聞いたかより、何も見ていないと言ったことを先に持ち出した。それが気になる。気になるだけだ。まだ、決めるな。']], 'kuroda-menu')
map('company-map', 'company', 'kuroda-menu', 'building', 'building-arrival', has('I03'))
time = '2026年10月8日（木）13:10'
sequence('building-arrival', 'building', [['narrator', '成子坂共同ビル。入口のガラスに、十月十日から取り壊しに着手するという掲示がある。誰かが外した看板の跡だけ、壁の色が薄い。'], ['miyahara', 'お客様ですか？ 会社なら、もう移っていますよ。'], ['minato', '管理人の宮原さんか？ 高瀬直人について聞きたい。'], ['miyahara', '高瀬君……。昨日、来ましたよ。']], 'building-menu', [info('met-miyahara'), info('demolition-date')])
menu('building-menu', 'building', [{ id: 'talk', label: '聞く', next: 'building-topics' }, { id: 'look', label: '調べる', next: 'building-targets' }, { id: 'think', label: '考える', next: 'building-thought' }, { id: 'move', label: '移動', next: 'building-map', condition: has('I04-sighting', 'E01', 'E02', 'E03', 'stair-layout') }], 'building-arrival')
topics('building-topics', 'building-menu', 'building', [subject('naoto-sighting', '昨日の直人と伝言', 'building', [
  ['minato', '昨日、ここへ？'], ['miyahara', '昔の書類を確かめたいって。随分、疲れた顔で。'], ['mio', 'お怪我などは、ありませんでしたか？'], ['miyahara', '見たところは。何かあったんですか？'], ['minato', '妹が捜している。まず、会いたい。'], ['miyahara', '連絡先は預かっています。でも、誰にも教えないでくれと言われて……。'], ['narrator', '宮原はポケットに手を入れ、出さずに止めた。約束を破るかどうか、迷っている。'], ['minato', '教えなくていい。本人に伝えてくれ。あかりさんから依頼を受けた、佐伯だと。'], ['miyahara', '……それなら。本人から、こちらへ連絡してもらいます。'], ['mio', '預けた書類があれば、私たちが見てもよいかも確認していただけますか？'], ['miyahara', '分かりました。伝えます。'],
], 'building-menu', undefined, ['I04-sighting']), subject('old-building-life', '以前のビル', 'building', [['miyahara', '朝は、階段の足音で誰が来たか分かるくらいでした。高瀬君は二段ずつ上がって、三崎さんは必ず挨拶して。'], ['mio', '皆さんを、よく覚えていらっしゃるんですね。'], ['miyahara', '長いですから。なくなるとなると、何を残せばいいのか……。'], ['narrator', '宮原の視線が、取り壊しの掲示を避けて階段へ動いた。']], 'building-menu'), subject('police-record', '当時の事故説明を確認', 'police', [
  ['narrator', '奥村に連絡すると、近くにいた二人がビルの入口へ来た。'], ['okumura', '事故の記録を全部渡すわけにはいかん。説明できるところだけだ。'], ['minato', 'それでいい。'], ['okumura', '三崎は階段で転落した。誰かに押されたという証言は得られていなかった。本人の不注意として処理された。'], ['minato', '高瀬は？'], ['okumura', '何も見ていないと答えた。'], ['segawa', '二年後になって話が変わるなら、その理由も確認しないといけません。'], ['minato', 'ああ。その通りだ。'], ['okumura', '佐伯。建物の中を勝手に荒らすなよ。'], ['minato', '管理人に案内してもらっている。'], ['mio', 'お伺いした範囲で、記録を分けておきます。'],
], 'building-menu', has('E01'), ['E02']), subject('narumi-call', '鳴海に会社の外の話を聞く', 'building', [['narumi', '会社のこと、少し聞けましたよ。人が減ったのに仕事は減らない。まあ、珍しい話じゃないですけどね。'], ['minato', '三崎は、それを問題にした。'], ['narumi', '辞めた人の話を、終わったことにしなかったんでしょうね。'], ['minato', '裏は取れるか？'], ['narumi', '話せる人に聞いてます。まだ売れる形じゃないんで、断定は勘弁。'], ['narrator', '電話の向こうで、鳴海が笑った。調査の根拠には、まだ使えない話だ。']], 'building-menu', has('E03'), ['narumi-rumor'])])
topics('building-targets', 'building-menu', 'building', [
  { id: 'journal', label: '管理日誌', next: 'journal', condition: has('I04-sighting') },
  { id: 'stairs', label: '階段と出入口', next: 'stairs-inspect', condition: has('E01') },
  { id: 'envelope', label: '預かった封筒', next: 'envelope', condition: has('I04-sighting') },
], 'look')
sequence('journal', 'building', [['miyahara', '古い日誌も処分するところでした。事故の日なら、ここです。'], ['narrator', '宮原が開いたページは、二〇二四年十月のものだった。紙の端が擦れている。'], ['mio', '黒田部長、旧事務室の鍵を受領……返却の記載はありませんね。'], ['miyahara', '終わるのが遅い時は、翌朝返すこともありました。'], ['minato', 'この日に来たことは、覚えているか？'], ['miyahara', '鍵を渡したことは。あの日のことは、忘れられません。'], ['mio', '該当する箇所を記録させてください。原本は、警察が確認するまで残していただけますか？'], ['miyahara', 'ええ。これは処分しません。'], ['narrator', '鍵を借りた記録がある。借りたまま帰った可能性は、まだ残る。']], 'building-menu', [info('E01'), { type: 'addInspectedTarget', id: 'journal' }])
sequence('stairs-inspect', 'stairs', [['narrator', '宮原の案内で、階段を確かめた。下階の戸口から踊り場は見えるが、上の出入口の奥は戸に隠れる。澪が簡単な図を描いた。'], ['minato', '事故の時、あんたはどこにいた？'], ['miyahara', '下の戸口です。物音がして……三崎さんが倒れていました。'], ['mio', 'その前は、何か見えましたか？'], ['miyahara', '……顔は見ていません。'], ['minato', '顔、か。'], ['miyahara', 'すみません。もう、うまく思い出せなくて。'], ['narrator', '急かすと、覚えていることまで言葉を変えてしまう。今日は、この答えをそのまま残す。']], 'building-menu', [info('stair-layout'), { type: 'addInspectedTarget', id: 'stairs' }])
sequence('envelope', 'building', [['miyahara', '折り返しがありました。高瀬君から、見せていいと。これを、捨てないでくれって預かっていたんです。'], ['narrator', '宮原が封筒を机に置いた。中にあるのは、三崎の報告書の控えだった。'], ['mio', '負傷した社員の作業について、人員と指示の確認を求めています。書き直した跡もありますね。'], ['miyahara', '三崎さんが、辞めた社員のことを気にしていたのは覚えています。'], ['minato', '会社は、本人の不注意と言った。'], ['miyahara', 'ええ。三崎さんの時も、そうでした。'], ['narrator', '同じ言葉が、二度使われている。それは対立の理由にはなる。殺した証拠には、まだならない。']], 'building-menu', [info('E03'), { type: 'addInspectedTarget', id: 'envelope' }])
sequence('building-thought', 'building', [['narrator', '直人の足取りはつながった。過去の事故の話も、同じ場所へ戻ってくる。人の話と記録を、順番に確かめよう。']], 'building-menu')
map('building-map', 'building', 'building-menu', 'office', 'part2-office', has('I04-sighting', 'E01', 'E02', 'E03', 'stair-layout'))
time = '2026年10月8日（木）15:00'
sequence('part2-office', 'after', [['narrator', '事務所へ戻り、あかりに昨日の目撃を伝えた。電話の向こうで、長く息を吐く音がした。'], ['mio', '目撃が得られたことは、喜んでいらっしゃいました。ただ、なぜ連絡をくれないのかと。'], ['minato', 'それは、本人に聞く。'], ['mio', '黒田さんは現場にいなかったと。管理日誌には、鍵の貸出があります。'], ['minato', '借りて、そのまま帰った可能性は残る。'], ['mio', 'はい。それと、宮原さんは「誰も見ていない」ではなく、「顔は見ていない」と答えました。'], ['narrator', '澪は現場図を、日誌の写しの隣へ置いた。今まで別々だった言葉の間に、空白が見える。']], 'part2-menu')
menu('part2-menu', 'after', [{ id: 'talk', label: '聞く', next: 'part2-topics' }, { id: 'organize', label: '整理する', next: 'reason1-intro', condition: has('I02', 'I03', 'I04-sighting', 'E01', 'E02', 'E03', 'stair-layout') }], 'part2-office')
topics('part2-topics', 'part2-menu', 'after', [subject('mio-evidence', '記録と証言の違い', 'after', [['mio', '鍵の記録はあります。でも、それだけで階段にいたとは言えません。'], ['minato', '本人の話が必要だ。高瀬も、宮原さんも。'], ['mio', '顔を見ていないことと、何も見ていないこと。そこは、次に確かめましょう。']], 'part2-menu')])
sequence('reason1-intro', 'after', [['narrator', '整理する。兄が消えた朝から、黒田に会うまで。確認したことだけをつなぐ。']], 'reason1-q1')
question('reason1-q1', 'after', '兄は、なぜ家を出た？', [['work', '仕事中に突然巻き込まれた', false], ['appointment', '休暇を取り、面会へ向かった', true], ['unknown', '家出するため荷物を運んだ', false]], 'reason1-q2', '会社が確認したのは、休暇の申請と面会の予定だ。家を出たことだけで、突然巻き込まれたとは決められない。')
question('reason1-q2', 'after', '兄が黒田へ求めたことは？', [['money', '給料の前借り', false], ['accident', '二年前の事故の本当の説明', true], ['demolition', '取り壊しの延期', false]], 'reason1-q3', '黒田は、直人から「本当のことを話してほしい」と言われた。話題は、三崎が亡くなった事故だった。')
question('reason1-q3', 'after', '当時の回答と、今の行動で気になる点は？', [['killer', '直人が犯人だと分かった', false], ['contradiction', '何も見ていないと言った兄が、真相を求めている', true], ['innocent', '黒田の不在が証明された', false]], 'naoto-callback', '兄は当時、何も見ていないと答えた。今、何を知っていて説明を求めたのか。犯人や、黙った理由は、まだ聞いていない。')
sequence('naoto-callback', 'after', [['narrator', '黒田の嘘を知っているのか。それとも、自分の嘘を終わらせたいのか。電話が鳴った。'], ['naoto', '……高瀬です。宮原さんから聞きました。'], ['minato', '妹の依頼で捜している。会って話せるか？'], ['naoto', 'あかりは、事務所へ？'], ['minato', 'ああ。帰りを待っている。'], ['naoto', '……あのビルで。人がいる時間なら。'], ['minato', '分かった。待っていてくれ。'], ['narrator', '受話器を置いた。澪はもう、鞄に手帳を入れている。今度の行き先には、待っている本人がいる。']], 'part3-start', [info('I04'), flag('part2_completed')])
time = '2026年10月8日（木）16:10'
sequence('part3-start', 'after', [['narrator', '第3部　核心\n直人に会い、無事をあかりに知らせる。']], 'part3-travel')
menu('part3-travel', 'after', [{ id: 'move', label: '移動', next: 'part3-map' }], 'part3-start')
map('part3-map', 'office', 'part3-travel', 'building', 'naoto-meeting', has('I04'))
time = '2026年10月8日（木）16:30'
sequence('naoto-meeting', 'brother', [['narrator', 'ビルの入口。宮原の少し後ろに、写真と同じ顔の男がいた。足元を見たまま、鞄の紐を握っている。'], ['minato', '高瀬直人だな。'], ['naoto', 'はい。'], ['mio', 'お怪我はありませんか？'], ['naoto', '大丈夫です。あかりには……。'], ['minato', '会えたと伝える。声だけでも聞かせられるか？'], ['naoto', '場所は、言わないでください。'], ['minato', '何を恐れている？'], ['narrator', '直人は答えず、手を握り直した。'], ['minato', '先に、無事だと伝えよう。']], 'safety-call', [info('met-naoto')])
sequence('safety-call', 'brother', [['narrator', 'あかりに電話をかけ、直人へスマホを渡した。場所を知らせる言葉は、こちらから出さなかった。'], ['akari', 'お兄ちゃん？'], ['naoto', 'ああ。……ごめん。', 'sad'], ['akari', 'どこにいるの？ 帰ってこられるの？'], ['naoto', '今、佐伯さんと話してる。ちゃんと話すから。'], ['akari', 'また連絡、くれる？'], ['naoto', 'する。今度は、俺から。'], ['narrator', '直人は電話を返し、袖で目元をこすった。無事を知らせるだけの言葉に、こんなに時間がかかった。']], 'brother-menu', [info('safety-reported')])
menu('brother-menu', 'interview', [{ id: 'talk', label: '聞く', next: 'brother-topics' }, { id: 'think', label: '考える', next: 'brother-thought' }, { id: 'organize', label: '整理する', next: 'part3-organize', condition: has('W01', 'safety-reported', 'witness-position') }], 'naoto-meeting')
topics('brother-topics', 'brother-menu', 'interview', [subject('naoto-testimony', '黒田との面会と、当時の目撃', 'interview', [
  ['narrator', '管理人の休憩スペースで、宮原は席を外した。直人は、椅子の背もたれに触れずに座っている。'], ['minato', '黒田に会って、何があった？'], ['naoto', '三崎さんのことを、話しました。あれは事故じゃないんじゃないかって。'], ['minato', '何を見た？'], ['naoto', '倒れた三崎さんと……階段の上から戻ってくる黒田さんを。手に、三崎さんの書類を持っていました。'], ['mio', '押すところを見たわけではないんですね？'], ['naoto', 'はい。でも、いなかったなんて嘘です。'], ['minato', '当時、言わなかった理由は？'], ['naoto', '仕事がなくなったら、あかりの学校をどうするって。黒田さんに言われました。'], ['naoto', '両親がいなくなってから、俺が何とかしなきゃと思って。あかりには、学校を続けてほしかった。'], ['minato', 'それで、何も見ていないと答えた。'], ['naoto', '……はい。', 'sad'], ['narrator', '直人は言い直さなかった。自分の口で、あの時の答えを認めた。'],
], 'brother-menu', undefined, ['naoto-witness']), subject('naoto-threat', '今回、帰れなくなった理由', 'interview', [
  ['mio', '今回、話そうと思ったのはなぜですか？'], ['naoto', '片づけをしていて、三崎さんの控えが出てきたんです。怪我をした人のことを、何度も書き直してありました。'], ['naoto', '三崎さんまで、本人が悪かったことになって。そのまま、ここもなくなる。'], ['naoto', 'もう本当のことを話してくださいって。俺も、話すからって。'], ['minato', '黒田は、何と？'], ['naoto', 'あかりの大学の名前を言いました。いつも帰る道も。妹が困ることになるぞ、って。', 'worried'], ['narrator', '直人はそこで、入口を振り返った。今も、言葉の続きを誰かに聞かれると思っている。'], ['naoto', '帰ったら、あかりのところへ来るんじゃないかと思って……。'], ['minato', 'だから身を隠した。'], ['naoto', '連絡したら、捜しに来る。黒田さんに聞きに行くかもしれない。何も知らないまま待ってくれている方が、安全だと思いました。'], ['minato', '妹は、待つだけじゃいられなかった。'], ['naoto', '……はい。'], ['narrator', '長い沈黙。澪は手帳を閉じ、直人の言葉が戻るのを待った。'], ['naoto', '言えば、学校をやめるって言うかもしれない。俺のせいで、そんなことを……。'], ['mio', 'お兄さんのことを知りたい気持ちと、学校をやめるかどうかは、別のお話です。'], ['minato', '妹が何を選ぶかまで、一人で決めていたんだな。'], ['naoto', '守ってるつもりでした。'], ['minato', 'その気持ちは否定しない。でも、三崎のことも、妹のことも、黙ったままでは終わらない。'], ['naoto', '……今からでも、話せますか？'], ['minato', '話せる。あんたが選ぶことだ。'], ['naoto', '警察で、話します。あの時の答えも、訂正します。', 'serious'], ['narrator', '奥村に脅しのことも伝え、兄妹の安全への対応を相談した。直人一人を、ここへ残すつもりはなかった。'],
], 'brother-menu', has('naoto-witness'), ['naoto-threat']), subject('witness-position', '目撃した位置と書類', 'interview', [
  ['narrator', '澪が現場図を開き、直人に立っていた位置を示してもらった。'], ['mio', 'ここから黒田さんが見えた。階段側から、旧事務室へ戻ったんですね？'], ['naoto', 'はい。灰色の上着でした。三崎さんの報告書には、青い表紙がついていました。'], ['minato', '報告書の原本は？'], ['naoto', '黒田さんが受け取った物は、旧事務室に残っていると思います。俺が見つけたのは、三崎さんが手元に置いていた控えです。'], ['mio', '片づけは、まだ終わっていない。'], ['naoto', '社員の書類は、鍵のある棚に残っています。勝手に処分できないので。'], ['minato', '奥村さんに確認してもらおう。'], ['narrator', 'いたことと、殺したことは別だ。足りないところを、恐怖や罪悪感で埋めるな。'],
], 'brother-menu', has('W01'), ['witness-position']), subject('naoto-hidden-time', '連絡を絶っていた時間', 'interview', [['naoto', '宿にいました。電話を切って。眠れなくて、ここへ戻って……。何をすればいいか、分からなくなってました。'], ['minato', '一人で戻ってくるのは、もうやめよう。次は俺たちと確かめる。'], ['naoto', 'はい。電話も、もう切りません。']], 'brother-menu', has('W01')), subject('naoto-responsibility', '黙ったことの責任', 'interview', [['naoto', '黒田さんがやったなら、俺のせいじゃないって、何度も考えました。'], ['minato', '殺したのは、殺した人間だ。あんたが黙ったことは、それとは別に残る。'], ['naoto', '……分かってます。'], ['mio', '見たことと、考えたことを分けて、改めてお話ししましょう。']], 'brother-menu', has('W01'))])
sequence('brother-thought', 'interview', [['narrator', '兄は無事だった。それで依頼の一つは果たせた。だが、帰れない理由も分かった。証言の残りを確かめ、帰れる状況につなげよう。']], 'brother-menu')
sequence('part3-organize', 'interview', [['mio', '直人さんは、黒田さんの顔を見た。でも、押すところは見ていない。'], ['minato', '宮原さんは、顔を見ていないと言った。何が見えたのかを、もう一度聞こう。'], ['mio', '原本の確認も、奥村さんたちにお願いします。'], ['narrator', '直人がうなずいた。俺たちは現場図を閉じずに、明日の確認事項を一つずつ書き足した。']], 'part4-start', [flag('part3_completed')])
time = '2026年10月9日（金）10:00'
sequence('part4-start', 'documents', [['narrator', '第4部　解決\n翌朝。取り壊しまで一日。会社への正式な確認を経て、奥村たちが旧事務室の保管書類を調べている。']], 'part4-menu')
menu('part4-menu', 'documents', [{ id: 'talk', label: '聞く', next: 'part4-topics' }, { id: 'look', label: '調べる', next: 'part4-targets' }, { id: 'organize', label: '整理する', next: 'reason2-intro', condition: has('E04', 'W02', 'I05') }], 'part4-start')
topics('part4-targets', 'part4-menu', 'documents', [{ id: 'original', label: '報告書の原本と控え', next: 'original-confirmation' }, { id: 'positions', label: '二人の位置を現場図で照合', next: 'position-confirmation', condition: has('E04', 'W02') }], 'look')
sequence('original-confirmation', 'documents', [['segawa', 'ありました。三崎さんの報告書。受領欄は黒田征司、日付は事件当日です。'], ['okumura', '原本を確認する。写しと照合しておけ。'], ['mio', '宮原さんから見せていただいた控えと、内容は一致しています。'], ['minato', '高瀬は、黒田がこれを持って戻るところを見た。'], ['segawa', 'それだけなら、話をしたあとに帰った可能性はあります。'], ['minato', 'ああ。だから、もう一人の話が要る。'], ['narrator', '署名は接触を裏づける。押した瞬間まで、紙に書かれているわけではない。']], 'part4-menu', [info('E04'), { type: 'addInspectedTarget', id: 'original' }])
topics('part4-topics', 'part4-menu', 'building', [subject('miyahara-testimony', '宮原が見た動作', 'building', [
  ['narrator', '直人が当時の説明を訂正したことと、原本の確認を宮原に伝えた。宮原は椅子を引き、現場図を両手で押さえた。'], ['miyahara', '私も、何も言えませんでした。顔を見ていないのに、誰かを殺人犯にしてしまったらと思って。'], ['minato', '誰だったかは、今は聞かない。何が見えた？'], ['miyahara', '三崎さんの背中に、両手が。肩より下です。'], ['mio', '支えようとしていたのか、押していたのか。覚えている範囲で構いません。'], ['miyahara', '押しました。体が前へ出て、その人は手を離した。三崎さんは、階段へ落ちて……。'], ['narrator', '宮原は口元を押さえた。続きを頼む前に、うなずいて待った。'], ['minato', 'その人は、どう動いた？'], ['miyahara', '上の踊り場へ戻りました。灰色の上着が、旧事務室の戸口へ。顔は、戸の陰で。'], ['mio', 'そこで見失ったんですね？'], ['miyahara', 'はい。そのすぐあと、高瀬君が廊下の方から来ました。'], ['naoto', '俺は、その戸口で黒田さんを見ました。'], ['miyahara', '……そこまで、見ていたんですか？'], ['naoto', 'はい。なのに、言わなかった。'], ['miyahara', '私は、顔を見ていないことを理由に、押したことまで話しませんでした。'], ['minato', '今は、見たところを話してくれた。それを確かめる。'],
], 'part4-menu', has('E04'), ['W02']), subject('segawa-caution', '瀬川の確認事項', 'documents', [['segawa', '二人の説明は、別々に聞き直します。覚えていない部分まで一致させる必要はありません。'], ['minato', 'ああ。俺たちの図に合わせて、記憶を変えさせたくはない。'], ['mio', '聞き取った言葉は、元のまま残してあります。']], 'part4-menu', has('E04'))])
sequence('position-confirmation', 'stairs', [['narrator', '宮原の視点を下階の戸口に置く。三崎の背中を押した人物は、上の踊り場から旧事務室の戸口へ戻った。'], ['mio', '宮原さんがそこで見失い、その直後、廊下から来た直人さんが黒田さんを見た。'], ['naoto', '間違いありません。戸口から戻ってきて、青い表紙の書類を持っていました。'], ['minato', '服の色だけで決めるんじゃない。行き先と、直後の人物目撃。原本にある当日の接触も合わせる。'], ['mio', '顔を見た人と、動作を見た人。別々の話が、同じ場所でつながります。']], 'part4-menu', [info('I05'), { type: 'addInspectedTarget', id: 'positions' }])
sequence('reason2-intro', 'office', [['narrator', '整理する。記録は、当日の接触を示す。証言は、人物と動作を別々に示す。事故という説明が、どこで成立しなくなるのか。']], 'reason2-q1')
question('reason2-q1', 'office', '黒田の「現場にいなかった」に反するものは？', [['journal', '鍵の貸出だけで殺人が確定する', false], ['combined', '鍵の日誌・受領原本・直人の目撃', true], ['rumor', '鳴海が聞いた人員削減の噂', false]], 'reason2-q2', '鍵を借りただけでは滞在を断定できない。受領原本と直人の目撃を合わせ、当日の接触と現場での姿を確認する。')
question('reason2-q2', 'office', '不注意で転落した、という説明を崩すものは？', [['report', '負傷社員についての報告書', false], ['push', '宮原が見た背中を押す動作', true], ['absence', '直人が三日間、連絡しなかったこと', false]], 'reason2-q3', '報告書は対立の理由を示す。転落が誰かの行為だったことを示すのは、宮原が見た動作だ。')
question('reason2-q3', 'office', '押した人物を黒田へ結ぶものは？', [['gray', '二人が同じ色の上着を見たことだけ', false], ['naoto', '直人が押すところを見たこと', false], ['position', '退出先と直後の人物目撃の位置、その接触の文書', true]], 'confrontation', '直人は押すところを見ていない。宮原の見た退出先と、直人が直後に黒田を見た位置を、現場図でつなぐ。')
time = '2026年10月9日（金）13:30'
sequence('confrontation', 'conclusion', [
  ['narrator', '高瀬は顔を見た。宮原は押すところを見た。一人では言えなかった二つの話が、同じ場所でつながる。奥村の同席で、黒田に説明を求めた。'], ['kuroda', '二年も前の記憶を、今になって持ち出されても。'], ['okumura', '記憶だけの話じゃない。日誌と原本を確認している。まず、その日にいなかったという説明を聞こう。'], ['kuroda', '書類の日付など、後からでも……。'], ['minato', '日誌を書いたのは宮原さんだ。原本の控えを残したのは三崎だ。高瀬の話だけで集まった物じゃない。'], ['kuroda', '高瀬君は、自分も嘘をついたと認めているんでしょう？'], ['minato', '認めている。だから、別の記録と証言で確かめた。'], ['okumura', '三崎と話したのか？'], ['kuroda', '……話はしました。'], ['minato', 'なぜ、いなかったと言った？'], ['kuroda', '騒ぎになるのを避けたかった。それだけです。'], ['minato', '三崎にも、同じことを言ったのか？'], ['kuroda', '会社が潰れれば、困るのは社員です。彼には、それが分からなかった。'], ['minato', '怪我をした社員は、もう困っていた。'], ['narrator', '黒田は紙の端をそろえた。何も書き足せない指が、同じところを何度もなぞる。'], ['okumura', '宮原さんは、背中を両手で押す動作を見ている。その人物が戻った戸口で、高瀬がお前を見た。そこを説明しろ。'], ['kuroda', '帰れと言ったんです。聞かなかった。'], ['kuroda', '戻ってきて、また話そうとして……俺は。'], ['okumura', '続けろ。'], ['kuroda', '……押しました。'],
], 'police-confirmation', [info('W03')])
sequence('police-confirmation', 'documents', [['narrator', '奥村たちは、文書・証言・現場の確認を進めた。黒田の言葉だけを結論にせず、俺たちの記録も引き渡した。'], ['segawa', '高瀬さんにも、当時の話を改めて聞きます。'], ['minato', '本人も、そのつもりだ。'], ['okumura', 'お前も記録を置いていけ。'], ['minato', '澪がまとめている。'], ['okumura', '相澤さん、頼みます。'], ['mio', 'はい。確認できたことと、証言の部分を分けてお渡しします。'], ['narrator', 'その後の確認と聴取を経て、黒田は逮捕された。三崎が一人で落ちた、という説明は、もう続かなかった。']], 'reunion-opening', [flag('investigation_completed')])
time = '2026年10月12日（月）17:20'
sequence('reunion-opening', 'reunion', [['narrator', '数日後。事務所で、あかりと直人が向かい合った。俺と澪は少し離れている。お茶を置く音だけが、しばらく聞こえた。'], ['akari', '仕事がなくなるかもしれないって、ずっと思ってたの？'], ['naoto', 'ああ。'], ['akari', '私の学校のことも？'], ['naoto', '続けてほしかった。父さんたちも、そう思ってたはずだから。'], ['akari', '……私、普通に通ってた。お兄ちゃんが、そんなこと考えてるって知らないで。'], ['narrator', '声が細くなった。直人は顔を上げられなかった。'], ['akari', '気づかなかった。お金の話をしても、大丈夫って言うから。私、それで……。'], ['naoto', '大丈夫って言ったのは、俺だ。'], ['naoto', '黙るって決めたのも。あかりが学校に行ったからじゃない。'], ['akari', '分かってる。でも、話してほしかった。'], ['akari', '私が何を言うか、聞いてほしかった。', 'serious'], ['naoto', '……ごめん。', 'sad'], ['akari', 'いなくなった時、私、何かしたのかなって。帰りたくなくなったのかなって。'], ['naoto', '違う。そんなことは。'], ['akari', 'うん。でも、分からなかった。'], ['narrator', '直人は手を開いた。握り込んでいた指が、少しずつほどけた。'], ['naoto', 'これから、仕事のことも、警察で話すこともある。前と同じには戻れない。'], ['akari', '一緒に考えよう。', 'determined'], ['naoto', '……ああ。'], ['akari', '今日は、帰ってくる？'], ['naoto', '帰る。', 'relieved'], ['narrator', 'あかりはうなずいた。涙を拭いて、もう一度うなずいた。'], ['akari', '冷蔵庫、牛乳が余ってる。何本も買ってしまって。'], ['naoto', '……一緒に飲もう。'], ['narrator', 'その約束だけは、今日のうちに果たせる。二人は相談して、同じ電車で帰ることにした。']], 'epilogue')
sequence('epilogue', 'routine', [['narrator', '兄妹が帰ったあと、扉の音が静かに収まった。澪が机に残ったカップを集める。'], ['mio', 'お茶、ほとんど冷めてしまいました。'], ['minato', '話せたなら、いい。'], ['mio', 'はい。'], ['narrator', '澪がコーヒーを置く。俺はカップへ手を伸ばした。黙っていた年月は消えない。三崎が帰ってくるわけでもない。'], ['narrator', '高瀬は、自分の言葉を訂正する。これから何度も、その日に戻ることになるだろう。だが今夜、妹は帰ってくる兄を待てる。'], ['mio', 'お疲れさまでした、佐伯さん。', 'smile'], ['minato', 'ああ。澪も。'], ['narrator', 'コーヒーは、まだ温かかった。机の端には、閉じた帳簿がある。今度は、あとにしないでおこうと思った。']], 'episode-complete', [flag('part4_completed')])
nodes['episode-complete'] = { type: 'end', stage: scenes.routine, sceneId: 'routine', text: 'Episode 01「灰色の証言」　終' }
times['episode-complete'] = time
// 旧セーブの途中会話も保持。旧ルートからは新しい区切りへ合流する。
nodes['accept-14'] = { ...nodes['accept-14'], next: 'photo-handoff', updates: [flag('request_accepted')] } as Scenario['nodes'][string]
nodes['company-followup-3'] = { ...nodes['company-followup-3'], next: 'company-menu' } as Scenario['nodes'][string]
nodes['part1-exit'] = { ...nodes['part1-exit'], complete: { text: '黒田に、直接話を聞こう。', next: 'kuroda-meeting' } } as Scenario['nodes'][string]
for (const node of Object.values(nodes)) {
  if (node.type === 'dialogue' && !/[。？！!?」]$/.test(node.text)) node.text += '。'
}
for (const id of ['inquiry-1', 'inquiry-3', 'inquiry-5', 'inquiry-11', 'accept-6', 'company-3', 'company-5', 'company-7', 'company-9']) {
  const node = nodes[id]
  if (node.type === 'dialogue') node.text = node.text.replace(/。$/, '？')
}

export const episode1Part1Previous: Scenario = {
  id: episode1Part1Legacy.id,
  title: 'Episode 01「灰色の証言」', start: 'opening-1', scenes, nodes,
  records: episode1Part1Records, dateLabel: '2026年10月8日（木）午前', nodeTimes: times,
  milestones: [{ id: 'I01', required: ['morning', 'contact', 'workplace'] }, { id: 'W01', required: ['naoto-witness', 'naoto-threat'] }],
  saveAliases: [
    { heardTopic: 'morning-contact-work', information: ['morning', 'contact', 'workplace', 'met-akari', 'brother-profile'] },
    { heardTopic: 'morning-contact-work', ifInformation: 'search-photo', information: ['akari-contact'] },
  ],
  itemUses: [
    { itemId: 'naoto-photo', nodeIds: ['departure'], next: 'photo-inspect', condition: has('search-photo') },
    { itemId: 'naoto-photo', nodeIds: ['company-menu'], next: 'photo-company', condition: has('search-photo') },
    { itemId: 'business-card', nodeIds: ['company-menu'], next: 'card-company' },
    { itemId: 'smartphone', nodeIds: ['departure'], next: 'contact-check', condition: has('akari-contact') },
    { itemId: 'smartphone', nodeIds: ['building-menu'], next: 'narumi-call', condition: has('E03') },
  ],
  smokingHints: { rules: [{ id: 'finished', nodeIds: ['episode-complete'], text: '二人は帰った。残した記録を、もう一度読み返しておこう。' }, { id: 'request', nodeIds: ['office-menu', 'office-topics'], text: '最後の朝、連絡を試したこと、勤務先を、別々に聞こう。' }], fallback: '覚えていることと、まだ確かめていないこと。調査記録で、分けて読み返そう。' },
}
sequence('photo-company', 'company', [['minato', 'この写真の男性だ。高瀬直人で間違いないか？'], ['company-staff', 'はい、高瀬さんです。こちらで勤務の記録を確認します。']], 'company-menu')
sequence('card-company', 'company', [['narrator', '佐伯探偵事務所の名刺を渡し、妹の依頼で来たことを説明した。'], ['company-staff', '何か分かりましたら、こちらへご連絡します。']], 'company-menu')
sequence('contact-check', 'after', [['narrator', '澪が確認した、あかりの連絡先を開いた。調査の途中でも、兄から連絡があれば知らせてもらえる。今は、会社へ確認に行こう。']], 'departure')
times['photo-company'] = times['card-company'] = '2026年10月8日（木）12:00'
times['contact-check'] = '2026年10月8日（木）11:15'
export const episode1Part1 = buildRevision({ ...episode1Part1Previous, records: revisionRecords }, revisionData)
