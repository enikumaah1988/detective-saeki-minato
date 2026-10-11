import type { Scenario, Scene } from '../../types/scenario'
import { episode1Part1Records } from './episode1Part1Records'

// 原稿ver0.01第1部。ノード・補足対応はdocs/scenario-ver001-part1.md。
const scenes: Record<string, Scene> = {
  "request": {
    "backgroundId": "office-before-noon",
    "characters": [
      {
        "characterId": "minato",
        "expression": "normal",
        "position": "left"
      },
      {
        "characterId": "akari",
        "expression": "normal",
        "position": "right"
      }
    ],
    "smokingAllowed": true
  },
  "company": {
    "backgroundId": "company-reception",
    "characters": [
      {
        "characterId": "minato",
        "expression": "normal",
        "position": "left"
      },
      {
        "characterId": "mio",
        "expression": "normal",
        "position": "right"
      }
    ],
    "smokingAllowed": false
  }
}

export const episode1Part1: Scenario = {
  id: "gray-testimony-ver001-part1",
  title: "第1話「灰色の証言」ver0.01 第1部「依頼」",
  start: "opening-1",
  smokingHints: {"rules":[{"id":"finished","nodeIds":["part1-complete","part2-boundary"],"text":"第1部の確認は済んだ。調査記録を読み返せる。"},{"id":"company","nodeIds":["departure","destinations"],"text":"次は東成ビルサービスへ確認に行こう。"},{"id":"listen","nodeIds":["office-menu","office-topics"],"missingInformation":["I01"],"text":"最後の朝、連絡、勤務先について、あかりに聞こう。"},{"id":"company-inquiry","nodeIds":["company-menu","company-topics"],"text":"会社の担当に、休暇記録と面会申込みを確認しよう。"}],"fallback":"今の話を最後まで読み、確認した内容を調査記録で確かめよう。"},
  scenes,
  records: episode1Part1Records,
  nodes: {
    'opening-1': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"narrator","text":"事務所。昼前。澪がカップを置いた。","next":"opening-2" },
    'opening-2': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"mio","text":"熱いので、ゆっくりどうぞ","next":"opening-3" },
    'opening-3': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"narrator","text":"若い女は、カップへ手を伸ばしかけて止めた。","next":"opening-4" },
    'opening-4': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"高瀬あかりといいます。兄を……捜していただきたいんです","next":"office-menu","updates":[] },
    'inquiry-1': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"minato","text":"いつから帰っていない","next":"inquiry-2" },
    'inquiry-2': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"三日前です。朝、いつもどおり出かけて、そのまま","next":"inquiry-3" },
    'inquiry-3': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"minato","text":"連絡は","next":"inquiry-4" },
    'inquiry-4': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"電話も、メッセージも。最初は仕事が長引いたのかと思いました。でも、次の日になっても……","next":"inquiry-5" },
    'inquiry-5': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"mio","text":"最後に会った朝は、どんな様子でしたか","next":"inquiry-6" },
    'inquiry-6': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"普通でした。私が、帰りに牛乳を買ってくるって言ったら、頼む、って","next":"inquiry-7" },
    'inquiry-7': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"それが最後です。もっと何か……聞いておけばよかった","next":"inquiry-8" },
    'inquiry-8': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"minato","text":"その朝に戻って考えなくていい。まず、その後だ","next":"inquiry-9" },
    'inquiry-9': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"会社に電話しました。兄は、その日から来ていないと言われました","next":"inquiry-10" },
    'inquiry-10': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"narrator","text":"澪のペンが止まった。","next":"inquiry-11" },
    'inquiry-11': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"minato","text":"仕事へ行ったと思っていたのは、あんただな","next":"inquiry-12" },
    'inquiry-12': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"はい。いつもの時間で、いつもの服でしたから","next":"inquiry-13" },
    'inquiry-13': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"narrator","text":"勤務先は東成ビルサービス。兄は高瀬直人、29歳、現場担当。","next":"office-menu","updates":[{"type":"addInformation","id":"I01"},{"type":"addHeardTopic","id":"morning-contact-work"}] },
    'daily-1': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"遅くなる時は連絡をくれます。短いんですけど、『先に食べて』とか","next":"daily-2" },
    'daily-2': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"minato","text":"三日も黙っているのは、普段の兄とは違う","next":"daily-3" },
    'daily-3': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"……はい","next":"office-menu","updates":[{"type":"addHeardTopic","id":"daily"},{"type":"addInformation","id":"naoto-daily"}] },
    'family-1': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"両親はもういません。今は兄と二人です","next":"family-2" },
    'family-2': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"mio","text":"お兄さん以外に、連絡を取れそうな方はいらっしゃいますか","next":"family-3" },
    'family-3': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"思いつく人には聞きました。でも、誰も","next":"office-menu","updates":[{"type":"addHeardTopic","id":"family"},{"type":"addInformation","id":"akari-family"}] },
    'accept-1': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"minato","text":"警察には相談したか","next":"accept-2" },
    'accept-2': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"はい。でも、事件に巻き込まれたかは分からないって。私、自分でも何かしないと。待っているだけじゃ……","next":"accept-3" },
    'accept-3': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"minato","text":"兄が家を出た。その後、会社へは来ていない。まずは、その間を調べる","next":"accept-4" },
    'accept-4': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"料金は、どのくらい……","next":"accept-5" },
    'accept-5': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"narrator","text":"あかりはバッグを膝に引き寄せた。","next":"accept-6" },
    'accept-6': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"私の貯金で、どこまでお願いできますか","next":"accept-7" },
    'accept-7': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"narrator","text":"俺は紙に書いて、彼女へ向けた。","next":"accept-8" },
    'accept-8': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"minato","text":"まず足取りを調べるなら、これくらいだ","next":"accept-9" },
    'accept-9': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"……お願いします","next":"accept-10" },
    'accept-10': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"minato","text":"今、答えを急がなくてもいい","next":"accept-11" },
    'accept-11': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"akari","text":"兄がどこにいるか、知りたいんです","next":"accept-12" },
    'accept-12': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"narrator","text":"彼女の手はまだ硬かった。声は、さっきよりはっきりしていた。","next":"accept-13" },
    'accept-13': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"minato","text":"分かった。引き受ける","next":"accept-14" },
    'accept-14': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"mio","text":"お兄さんのお写真と、ご連絡先をお預かりしてもよろしいですか","next":"departure","updates":[{"type":"setFlag","id":"request_accepted","value":true},{"type":"addInformation","id":"search-photo"}] },
    'company-1': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"narrator","text":"会社の応接スペース。事務担当との短い確認。","next":"company-2" },
    'company-2': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"company-staff","text":"高瀬さんは、その日は休みを取っていました","next":"company-3" },
    'company-3': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"minato","text":"妹には、会社に来ていないと答えたそうだな","next":"company-4" },
    'company-4': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"company-staff","text":"その後も欠勤が続いていたので……。こちらも連絡がつかなくて","next":"company-5" },
    'company-5': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"mio","text":"休暇の理由は、何か聞いていらっしゃいますか","next":"company-6" },
    'company-6': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"company-staff","text":"私用です。ただ、黒田部長との面会を頼まれていました","next":"company-7" },
    'company-7': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"minato","text":"仕事の話か","next":"company-8" },
    'company-8': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"company-staff","text":"内容までは。古い事務所の片づけの件かと思っていました","next":"company-9" },
    'company-9': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"mio","text":"古い事務所というのは","next":"company-10" },
    'company-10': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"company-staff","text":"成子坂共同ビルです。もう取り壊しになるので","next":"company-11" },
    'company-11': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"narrator","text":"成子坂共同ビル。あそこで人が死んだことは、覚えていた。","next":"company-12" },
    'company-12': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"narrator","text":"事故だった。少なくとも、そう聞いていた。","next":"company-followup-1","updates":[{"type":"addInformation","id":"I02"},{"type":"addHeardTopic","id":"leave-and-appointment"}] },
    'company-followup-1': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"mio","text":"休みを取ったことを、妹さんには話していなかったんですね","next":"company-followup-2" },
    'company-followup-2': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"minato","text":"会って帰るつもりだったのかもしれない","next":"company-followup-3" },
    'company-followup-3': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"mio","text":"帰れなくなるようなことが、そこであった","next":"part1-exit","updates":[] },
    'office-menu': { stage: scenes.request, "type":"choice","sceneId":"request","prompt":"依頼人に確認する","options":[{"id":"talk","label":"聞く","next":"office-topics"},{"id":"look","label":"調べる","next":"office-targets"},{"id":"think","label":"考える","next":"organize","condition":{"type":"hasAllInformation","ids":["I01"]}}],"mode":"free-action","implementedCommands":["talk","look","think","move"],"empty":{"label":"話を聞く","next":"inquiry-1"} },
    'office-topics': { stage: scenes.request, "type":"topic","sceneId":"request","parent":{"commandId":"talk","nodeId":"office-menu"},"prompt":"確認する内容","options":[{"id":"morning-contact-work","label":"最後の朝・連絡・勤務先","next":"inquiry-1"},{"id":"daily","label":"兄の普段","next":"daily-1"},{"id":"family","label":"家族","next":"family-1"}] },
    'office-targets': { stage: scenes.request, "type":"inspect","sceneId":"request","parent":{"commandId":"look","nodeId":"office-menu"},"prompt":"調べる対象","options":[{"id":"cup","label":"カップ","next":"cup-1"}] },
    'cup-1': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"narrator","text":"若い女は、カップへ手を伸ばしかけて止めた。","next":"office-menu","updates":[{"type":"addInspectedTarget","id":"cup"}] },
    'organize': { stage: scenes.request, "type":"think","sceneId":"request","speakerId":"minato","requiredInformation":[{"id":"I01","summary":"妹の認識と確認した内容"}],"insufficient":{"text":"最後の朝と、その後の連絡、勤務先への確認を聞こう。","next":"office-menu"},"partial":{"text":"聞き取った内容を確認しよう。","next":"office-menu"},"complete":{"text":"妹が確認したことと、妹の推測を区別する。","next":"accept-1"} },
    'departure': { stage: scenes.request, "type":"choice","sceneId":"request","prompt":"会社への確認","options":[{"id":"move","label":"移動","next":"destinations","condition":{"type":"hasAllInformation","ids":["I01","search-photo"]}}],"mode":"free-action","implementedCommands":["talk","look","think","move"],"empty":{"label":"確認に戻る","next":"departure-insufficient-1"} },
    'departure-insufficient-1': { stage: scenes.request, "type":"dialogue","sceneId":"request","speakerId":"narrator","text":"依頼の聞き取りを確認しよう。","next":"office-menu","updates":[] },
    'destinations': { stage: scenes.request, "type":"choice","sceneId":"request","prompt":"移動先","options":[{"id":"company","label":"東成ビルサービス","next":"company-arrival-1","condition":{"type":"hasAllInformation","ids":["I01","search-photo"]}},{"id":"return","label":"戻る","next":"departure"}] },
    'company-arrival-1': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"narrator","text":"会社の応接スペース。事務担当との短い確認。","next":"company-menu","updates":[] },
    'company-menu': { stage: scenes.company, "type":"choice","sceneId":"company","prompt":"会社に確認する","options":[{"id":"talk","label":"聞く","next":"company-topics"}],"mode":"free-action","implementedCommands":["talk","look","think","move"],"empty":{"label":"確認を始める","next":"company-1"} },
    'company-topics': { stage: scenes.company, "type":"topic","sceneId":"company","parent":{"commandId":"talk","nodeId":"company-menu"},"prompt":"確認する内容","options":[{"id":"leave-and-appointment","label":"休暇記録と面会申込み","next":"company-1"}] },
    'part1-exit': { stage: scenes.company, "type":"think","sceneId":"company","speakerId":"minato","requiredInformation":[{"id":"I01","summary":"あかりの聞き取り"},{"id":"I02","summary":"休暇記録と面会申込み"}],"insufficient":{"text":"確認した内容が足りない。","next":"office-menu"},"partial":{"text":"休暇記録と面会申込みを確認しよう。","next":"company-menu"},"complete":{"text":"まだ分からない。黒田に聞こう","next":"part1-complete"} },
    'part1-complete': { stage: scenes.company, "type":"dialogue","sceneId":"company","speakerId":"narrator","text":"第1部「依頼」終了。黒田との面会を申し入れる。","next":"part2-boundary","updates":[{"type":"setFlag","id":"part1_completed","value":true}] },
    'part2-boundary': { stage: scenes.company, "type":"end","sceneId":"company","text":"第2部「展開」への到達境界です。ver0.01第1部の実装はここまでです。" },
  },
}
