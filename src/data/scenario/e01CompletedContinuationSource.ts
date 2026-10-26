// 原文転記: b36e278d6f08b911dd7dcdf05dedd80d8e9b1d77 / draft-v2/dialogue/part-02〜05 と gameplay-interactions 2ファイル。
export type CompletedLine = { speakerId: string; text: string }
export type CompletedAction = { id: string; label: string; kind: string; required: boolean; flag?: string; lines: CompletedLine[] }
export type CompletedScene = { id: string; heading: string; body: CompletedLine[]; actions: CompletedAction[]; questions: { prompt: string; choices: { id: string; label: string }[]; correct: string; answer: CompletedLine[]; wrong: CompletedLine[] }[] }
export const completedContinuationSource: CompletedScene[] = [
  {
    "id": "S07",
    "heading": "S07 10月7日夜／成子坂共同ビル・地下",
    "body": [
      {
        "speakerId": "narrator",
        "text": "（夜間管理担当者が到着。警察・消防へ連絡済みで、捜索関係者が安全確認を進めている）"
      },
      {
        "speakerId": "night-manager",
        "text": "旧保管室、ですか。図面では地下の設備区画になっています"
      },
      {
        "speakerId": "minato",
        "text": "古い配置図だと、壁で仕切られている"
      },
      {
        "speakerId": "night-manager",
        "text": "棚の裏に通路があるとは聞いています。でも、どこで折れるかまでは知りません。通常の巡回経路からも外れています"
      },
      {
        "speakerId": "mio",
        "text": "直人さんがそこへ向かったと決まったわけではありません。でも、予定外の部品確認が残っています"
      },
      {
        "speakerId": "night-manager",
        "text": "分かりました。確認できる場所から見ましょう"
      },
      {
        "speakerId": "narrator",
        "text": "（管理者と関係者が安全を確保し、通路の周辺を確認する）"
      },
      {
        "speakerId": "night-manager",
        "text": "ここから先は配管が低く、棚も密集しています。安全確認と通路の整理が必要です"
      },
      {
        "speakerId": "minato",
        "text": "無理はしないでください。管理図面をもう一度見ましょう"
      },
      {
        "speakerId": "mio",
        "text": "警察にも今の状況を伝えます"
      },
      {
        "speakerId": "narrator",
        "text": "近いかもしれない。だが、場所が分からなければ助けられない"
      }
    ],
    "actions": [
      {
        "id": "必須：聞く「巡回対象外」",
        "label": "巡回対象外",
        "kind": "talk",
        "required": true,
        "flag": "F_NIGHT_ROUTE",
        "lines": [
          {
            "speakerId": "night-manager",
            "text": "棚の裏の通路は通常の巡回経路ではありません"
          }
        ]
      },
      {
        "id": "調べる：棚",
        "label": "棚",
        "kind": "look",
        "required": false,
        "lines": [
          {
            "speakerId": "minato",
            "text": "向こう側は見えない。通路を塞いでいるわけではなさそうだ"
          }
        ]
      },
      {
        "id": "調べる：配管",
        "label": "配管",
        "kind": "look",
        "required": false,
        "lines": [
          {
            "speakerId": "night-manager",
            "text": "安全を確認してから進みます"
          }
        ]
      },
      {
        "id": "考える",
        "label": "考える",
        "kind": "think",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "見落とした理由は分かる。だが、入口はまだ分からない"
          }
        ]
      },
      {
        "id": "再訪",
        "label": "再訪",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "mio",
            "text": "管理会社からの詳細図を待っています。捜索は続いています"
          }
        ]
      }
    ],
    "questions": []
  },
  {
    "id": "S08",
    "heading": "S08 10月7日深夜〜8日朝／管理室・地下",
    "body": [
      {
        "speakerId": "narrator",
        "text": "（夜間も捜索を続ける。管理会社の図面保管担当から届いた詳細図を、管理者が旧図面と照合する）"
      },
      {
        "speakerId": "mio",
        "text": "最初の案内図だと、通路が途中で終わっています。……でも、詳細図ではその先に線が続いていますね"
      },
      {
        "speakerId": "night-manager",
        "text": "届いた詳細図で分かりました。昨夜確認した場所から、もう一度奥へ折れる通路があります。棚の裏で見えなかったんです"
      },
      {
        "speakerId": "minato",
        "text": "昨日は正面から見ただけだった。棚の裏側か"
      },
      {
        "speakerId": "night-manager",
        "text": "ええ。正面からは見えません"
      },
      {
        "speakerId": "mio",
        "text": "旧保管室は、その先ですね"
      },
      {
        "speakerId": "minato",
        "text": "確認をお願いします。危険があるなら専門の方に"
      },
      {
        "speakerId": "narrator",
        "text": "（夜間から捜索を継続。明け方、管理者と捜索関係者が安全な経路を確保する）"
      },
      {
        "speakerId": "night-manager",
        "text": "……ありました。棚の陰で、入口が見えなかったんです"
      },
      {
        "speakerId": "minato",
        "text": "待ってください。……何か聞こえませんか"
      }
    ],
    "actions": [
      {
        "id": "必須：調べる「旧図面と詳細図」",
        "label": "旧図面と詳細図",
        "kind": "look",
        "required": true,
        "flag": "F_ROUTE_BEND",
        "lines": [
          {
            "speakerId": "mio",
            "text": "この折れ目、最初の案内図には描かれていません"
          }
        ]
      },
      {
        "id": "任意：聞く「図面の保管」",
        "label": "図面の保管",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "night-manager",
            "text": "詳細図は管理会社の担当が保管しています。届いたものを照合しています"
          }
        ]
      },
      {
        "id": "考える",
        "label": "考える",
        "kind": "think",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "棚の裏で、もう一度曲がる"
          }
        ]
      },
      {
        "id": "発見演出",
        "label": "発見演出",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "night-manager",
            "text": "そこは昨夜、正面からしか見ていません"
          },
          {
            "speakerId": "minato",
            "text": "なら、棚の奥を安全確認のうえで見てもらおう"
          }
        ]
      },
      {
        "id": "移動",
        "label": "移動",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "night-manager",
            "text": "安全な経路を確認しました。案内します"
          }
        ]
      }
    ],
    "questions": []
  },
  {
    "id": "S09",
    "heading": "S09 10月8日午前／地下旧保管室前",
    "body": [
      {
        "speakerId": "narrator",
        "text": "（扉の内側から弱い物音）"
      },
      {
        "speakerId": "mio",
        "text": "……今、聞こえましたよね"
      },
      {
        "speakerId": "minato",
        "text": "高瀬直人さん。聞こえますか"
      },
      {
        "speakerId": "narrator",
        "text": "（間。小さく叩く音）"
      },
      {
        "speakerId": "night-manager",
        "text": "……中からですか？"
      },
      {
        "speakerId": "minato",
        "text": "高瀬さん、助けが来ます。扉から離れられますか"
      },
      {
        "speakerId": "narrator",
        "text": "（返事は不明瞭。佐伯は扉の状態を確認し、管理者・消防の現場担当へ即座に所在と反応を伝える）"
      },
      {
        "speakerId": "mio",
        "text": "場所を伝えました。救急の対応もお願いしています"
      },
      {
        "speakerId": "minato",
        "text": "分かった。ここで待とう"
      }
    ],
    "actions": [
      {
        "id": "必須：調べる「扉の向こう」",
        "label": "扉の向こう",
        "kind": "look",
        "required": true,
        "flag": "F_RESPONSE",
        "lines": [
          {
            "speakerId": "minato",
            "text": "高瀬さん、聞こえますか"
          }
        ]
      },
      {
        "id": "任意：考える",
        "label": "考える",
        "kind": "think",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "話を聞くのは後だ。まず救助だ"
          }
        ]
      },
      {
        "id": "移動不可",
        "label": "移動不可",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "mio",
            "text": "今は救助担当の指示を待ちましょう"
          }
        ]
      },
      {
        "id": "進行",
        "label": "進行",
        "kind": "event",
        "required": false,
        "lines": []
      }
    ],
    "questions": []
  },
  {
    "id": "S10",
    "heading": "S10 10月8日午前／救助",
    "body": [
      {
        "speakerId": "narrator",
        "text": "（救助隊が扉と周囲の安全を確認して開放する。直人は衰弱している。扉の不具合の原因は後日、管理会社が調査する）"
      },
      {
        "speakerId": "rescue-worker",
        "text": "意識はあります。こちらで対応します。通路を空けてください"
      },
      {
        "speakerId": "minato",
        "text": "分かりました"
      },
      {
        "speakerId": "narrator",
        "text": "（澪と佐伯が道を空ける）"
      },
      {
        "speakerId": "naoto",
        "text": "……あかり、は"
      },
      {
        "speakerId": "minato",
        "text": "連絡します。今は、こちらの方の話を聞いてください"
      },
      {
        "speakerId": "narrator",
        "text": "（隊員が直人を搬送）"
      },
      {
        "speakerId": "mio",
        "text": "……よかった。本当に"
      },
      {
        "speakerId": "minato",
        "text": "ああ"
      },
      {
        "speakerId": "narrator",
        "text": "（救急車の扉が閉まる。2人はしばらく、その場に立っている）"
      },
      {
        "speakerId": "mio",
        "text": "……返事が聞こえたとき、ほっとしました"
      },
      {
        "speakerId": "minato",
        "text": "俺もだ"
      },
      {
        "speakerId": "mio",
        "text": "高瀬さんへ、私から連絡してもいいですか"
      },
      {
        "speakerId": "minato",
        "text": "頼む。状態は分かる範囲だけ、正確に"
      },
      {
        "speakerId": "mio",
        "text": "はい"
      }
    ],
    "actions": [
      {
        "id": "演出必須",
        "label": "演出必須",
        "kind": "event",
        "required": true,
        "lines": []
      },
      {
        "id": "考える",
        "label": "考える",
        "kind": "think",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "よかった。……それだけでいい"
          }
        ]
      },
      {
        "id": "澪への会話",
        "label": "澪への会話",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "mio",
            "text": "ご家族への連絡、私がします"
          },
          {
            "speakerId": "minato",
            "text": "頼む。分かったことだけで"
          }
        ]
      },
      {
        "id": "進行",
        "label": "進行",
        "kind": "event",
        "required": false,
        "flag": "F_NAOTO_RESCUED",
        "lines": []
      }
    ],
    "questions": []
  },
  {
    "id": "S11",
    "heading": "S11 10月8日夕方／探偵事務所・依頼の区切り",
    "body": [
      {
        "speakerId": "narrator",
        "text": "（救助直後に連絡済み。あかりは病院で兄に面会した後、事務所へ立ち寄る）"
      },
      {
        "speakerId": "akari",
        "text": "本当に……ありがとうございました。兄に会えました"
      },
      {
        "speakerId": "minato",
        "text": "それはよかった。まだ検査もあるでしょうから、無理はさせないでください"
      },
      {
        "speakerId": "akari",
        "text": "はい。兄、私の顔を見て、先に謝ったんです。心配かけたって"
      },
      {
        "speakerId": "mio",
        "text": "謝るより先に、元気になってほしいですね"
      },
      {
        "speakerId": "akari",
        "text": "……そうですね。怒ろうと思ってたのに、何も言えませんでした"
      },
      {
        "speakerId": "akari",
        "text": "病室で兄の携帯が鳴ったんです。いつもなら『また仕事？』って言うのに……今日は、その音が聞けて安心しました"
      },
      {
        "speakerId": "mio",
        "text": "……そうでしたか"
      },
      {
        "speakerId": "minato",
        "text": "その話は、元気になってからでもできます"
      },
      {
        "speakerId": "narrator",
        "text": "（あかりが帰る）"
      },
      {
        "speakerId": "mio",
        "text": "ひとまず、よかったですね"
      },
      {
        "speakerId": "minato",
        "text": "ああ"
      },
      {
        "speakerId": "narrator",
        "text": "（あかりが座っていた椅子を、澪が静かに戻す）"
      },
      {
        "speakerId": "mio",
        "text": "今日は、ここまでにしましょうか"
      },
      {
        "speakerId": "minato",
        "text": "そうだな。……現場で気になった記録だけ、忘れないうちにメモしておく"
      },
      {
        "speakerId": "mio",
        "text": "非常照明の交換記録ですね"
      },
      {
        "speakerId": "minato",
        "text": "交換したことになっている。だが、現場の説明と噛み合わない"
      },
      {
        "speakerId": "mio",
        "text": "単なる記載違いかもしれません"
      },
      {
        "speakerId": "minato",
        "text": "宮原さんには、現場の記録に食い違いがあると伝えておこう。会社が確認を始めるなら、俺たちは見聞きしたことを整理して協力する"
      },
      {
        "speakerId": "mio",
        "text": "依頼はここで一区切りですね。別の調査として動くなら、会社の正式な了承が必要です"
      },
      {
        "speakerId": "minato",
        "text": "そうだな。まずは先方に任せよう"
      },
      {
        "speakerId": "mio",
        "text": "はい。高瀬さんたちには、安心してもらいたいですし"
      }
    ],
    "actions": [
      {
        "id": "必須：聞く「あかりの面会」",
        "label": "あかりの面会",
        "kind": "talk",
        "required": true,
        "flag": "F_AKARI_REUNION",
        "lines": []
      },
      {
        "id": "任意：聞く「直人の様子」",
        "label": "直人の様子",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "akari",
            "text": "まだ検査があります。でも、ちゃんと話せました"
          },
          {
            "speakerId": "minato",
            "text": "今は、それで十分です"
          }
        ]
      },
      {
        "id": "考える",
        "label": "考える",
        "kind": "think",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "連絡を待つ側の時間は、長かっただろうな"
          }
        ]
      },
      {
        "id": "任意：調べる「設備記録メモ」",
        "label": "設備記録メモ",
        "kind": "look",
        "required": false,
        "lines": [
          {
            "speakerId": "minato",
            "text": "非常照明の交換記録。確認したいことは残っている"
          }
        ]
      },
      {
        "id": "進行",
        "label": "進行",
        "kind": "event",
        "required": false,
        "lines": []
      }
    ],
    "questions": []
  },
  {
    "id": "S12",
    "heading": "S12 10月9日／東成ビルサービス／佐伯・宮原・黒田",
    "body": [
      {
        "speakerId": "narrator",
        "text": "（直人救助の翌日以降。佐伯は宮原に、救助前に気になった設備記録の確認を相談する）"
      },
      {
        "speakerId": "miyahara",
        "text": "直人の件、本当に助かりました。あいつ、まだ病院ですが、意識ははっきりしているそうです"
      },
      {
        "speakerId": "minato",
        "text": "それはよかった。……今日は別の確認をお願いしたくて"
      },
      {
        "speakerId": "miyahara",
        "text": "別の？"
      },
      {
        "speakerId": "minato",
        "text": "依頼された失踪調査とは別件です。まずは御社の担当者に記録の確認をお願いできれば"
      },
      {
        "speakerId": "minato",
        "text": "成子坂の非常照明です。交換済みという記録と、現場で伺った管理状況が合わない気がしたんです"
      },
      {
        "speakerId": "miyahara",
        "text": "会社として設備記録の確認を始めます。佐伯さんには、現場で見聞きした範囲を整理していただけませんか。社内履歴の確認と警察への提出は、こちらの権限者が行います"
      },
      {
        "speakerId": "minato",
        "text": "承知しました。確認事項をまとめます"
      },
      {
        "speakerId": "miyahara",
        "text": "器具が故障したとか、古い在庫を使った可能性は？"
      },
      {
        "speakerId": "minato",
        "text": "ええ。だから、確かめたい"
      },
      {
        "speakerId": "narrator",
        "text": "（黒田が入る）"
      },
      {
        "speakerId": "kuroda",
        "text": "お話は伺いました。設備管理部の黒田です。直人の件ではお世話になりました"
      },
      {
        "speakerId": "minato",
        "text": "佐伯です。こちらこそ、皆さんの協力がなければ"
      },
      {
        "speakerId": "kuroda",
        "text": "記録の食い違いですか。古い物件では珍しくありません。確認はさせますよ"
      },
      {
        "speakerId": "minato",
        "text": "ありがとうございます。結論を急ぐつもりはありません"
      },
      {
        "speakerId": "kuroda",
        "text": "そうしていただけると助かります。訂正が必要なら、過去の承認分まで確認することになりますから"
      }
    ],
    "actions": [
      {
        "id": "必須：聞く「会社の確認手続き」",
        "label": "会社の確認手続き",
        "kind": "talk",
        "required": true,
        "flag": "F_COMPANY_AUTH",
        "lines": [
          {
            "speakerId": "miyahara",
            "text": "こちらの担当で確認します。佐伯さんは現場で見たことだけまとめてください"
          }
        ]
      },
      {
        "id": "任意：聞く「黒田の担当」",
        "label": "黒田の担当",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "kuroda",
            "text": "古い物件の記録は複雑です。照合には時間をください"
          }
        ]
      },
      {
        "id": "考える",
        "label": "考える",
        "kind": "think",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "違和感を伝えるのと、不正だと決めつけるのは違う"
          }
        ]
      },
      {
        "id": "再訪",
        "label": "再訪",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "miyahara",
            "text": "確認結果が出るまでは、推測で話せません"
          }
        ]
      }
    ],
    "questions": []
  },
  {
    "id": "S13",
    "heading": "S13 10月9日／宮原の執務室／佐伯・宮原",
    "body": [
      {
        "speakerId": "narrator",
        "text": "（宮原は当時の点検控えを、社内の適切な手続きを経て確認）"
      },
      {
        "speakerId": "miyahara",
        "text": "この設備の記録、前にも細かく指摘した奴がいました"
      },
      {
        "speakerId": "minato",
        "text": "どなたです？"
      },
      {
        "speakerId": "miyahara",
        "text": "三崎健。2年前まで、この現場を見ていた社員です"
      },
      {
        "speakerId": "minato",
        "text": "どういう人でした"
      },
      {
        "speakerId": "miyahara",
        "text": "面倒な奴でしたよ。こっちが『たぶん同じ部品だろ』と言うと、型番が違うって戻してくる"
      },
      {
        "speakerId": "minato",
        "text": "それは困る"
      },
      {
        "speakerId": "miyahara",
        "text": "困りました。でも、実際に違ったこともあったんです。あいつ、そのときは嫌な顔もせず、正しい型番を調べてきた"
      },
      {
        "speakerId": "minato",
        "text": "細かいだけじゃなかった"
      },
      {
        "speakerId": "miyahara",
        "text": "ええ。自分が間違えたときは、誰より先に謝る男でした"
      },
      {
        "speakerId": "miyahara",
        "text": "若い作業員が数字を取り違えたときも、責めずに一緒に照合していた。翌朝には直った書類だけが机に置いてあったそうです"
      },
      {
        "speakerId": "miyahara",
        "text": "後でその作業員が『助かりました』と言ったら、三崎は『次は俺が間違えるかもしれないから』と笑ったそうです"
      },
      {
        "speakerId": "minato",
        "text": "今は？"
      },
      {
        "speakerId": "miyahara",
        "text": "……亡くなりました。2年前、ここの階段で転落して"
      },
      {
        "speakerId": "narrator",
        "text": "（短い間）"
      },
      {
        "speakerId": "minato",
        "text": "事故だったんですか"
      },
      {
        "speakerId": "miyahara",
        "text": "そう聞いています。警察も調べた。……私に分かるのは、それだけです"
      }
    ],
    "actions": [
      {
        "id": "必須：聞く「差し戻し」",
        "label": "差し戻し",
        "kind": "talk",
        "required": true,
        "flag": "F_MISAKI_REVIEW",
        "lines": [
          {
            "speakerId": "miyahara",
            "text": "型番が違えば、見過ごさなかった"
          }
        ]
      },
      {
        "id": "任意：聞く「若手の記憶」",
        "label": "若手の記憶",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "miyahara",
            "text": "責めずに書類を直してくれたそうです。本人は大したことじゃないという顔で"
          }
        ]
      },
      {
        "id": "必須：聞く「現在」",
        "label": "現在",
        "kind": "talk",
        "required": true,
        "flag": "F_MISAKI_DEATH",
        "lines": [
          {
            "speakerId": "miyahara",
            "text": "2年前に、階段で亡くなりました"
          }
        ]
      },
      {
        "id": "考える",
        "label": "考える",
        "kind": "think",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "会ったことのない人間を、書類だけで分かった気になるな"
          }
        ]
      }
    ],
    "questions": []
  },
  {
    "id": "S14",
    "heading": "S14 10月12日／探偵事務所／佐伯・澪",
    "body": [
      {
        "speakerId": "mio",
        "text": "三崎さんの差し戻し、理由が具体的ですね。『交換した蓄電池の品番と作業報告の記載が一致しない』"
      },
      {
        "speakerId": "minato",
        "text": "勘違いで済む話かもしれない"
      },
      {
        "speakerId": "mio",
        "text": "古い在庫だったとか、報告書の転記ミスだったとか"
      },
      {
        "speakerId": "minato",
        "text": "交換後に別の故障が出た可能性もある"
      },
      {
        "speakerId": "mio",
        "text": "なら、部品の払出し記録を確認すれば絞れますね"
      },
      {
        "speakerId": "minato",
        "text": "会社が調べてくれるなら、だが"
      },
      {
        "speakerId": "mio",
        "text": "先方へ、確認してもらう項目を整理します"
      },
      {
        "speakerId": "minato",
        "text": "頼む。……三崎さんも、こんなふうに調べていたのかな"
      },
      {
        "speakerId": "mio",
        "text": "そうかもしれません。でも、まだ記録から分かることだけにしましょう"
      },
      {
        "speakerId": "minato",
        "text": "そうだな"
      }
    ],
    "actions": [
      {
        "id": "必須：考える「交換済み記録」",
        "label": "交換済み記録",
        "kind": "think",
        "required": true,
        "flag": "F_ALTERNATIVES",
        "lines": [
          {
            "speakerId": "minato",
            "text": "古い在庫品、転記ミス、再故障。どれも今は消せない"
          }
        ]
      },
      {
        "id": "任意：聞く「次の確認」",
        "label": "次の確認",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "mio",
            "text": "出庫履歴と現物の確認を会社にお願いしましょう"
          }
        ]
      },
      {
        "id": "調べる：照会メモ",
        "label": "照会メモ",
        "kind": "look",
        "required": false,
        "lines": [
          {
            "speakerId": "minato",
            "text": "仮説を一つに絞るには早い"
          }
        ]
      }
    ],
    "questions": []
  },
  {
    "id": "S15",
    "heading": "S15 10月12日／成子坂共同ビル／佐伯・管理担当者・設備技術者",
    "body": [
      {
        "speakerId": "technician",
        "text": "この器具、蓄電池の交換記録はあります。ただ、製造年月だけで未交換とは言えません"
      },
      {
        "speakerId": "minato",
        "text": "古い在庫品だった可能性がある"
      },
      {
        "speakerId": "technician",
        "text": "ええ。交換したかどうかは、作業票と部材の出庫履歴も見ないと"
      },
      {
        "speakerId": "building-manager",
        "text": "当時の点検控えは保管されています。照合は会社に依頼します"
      },
      {
        "speakerId": "minato",
        "text": "お願いします。私が見たいのは、誰かを責める材料じゃありません。何が実際に行われたかです"
      }
    ],
    "actions": [
      {
        "id": "必須：聞く「技術者の見解」",
        "label": "技術者の見解",
        "kind": "talk",
        "required": true,
        "flag": "F_TECH_LIMIT",
        "lines": [
          {
            "speakerId": "technician",
            "text": "製造年月だけでは交換の有無は分かりません"
          }
        ]
      },
      {
        "id": "必須：調べる「点検控え」",
        "label": "点検控え",
        "kind": "look",
        "required": true,
        "flag": "F_INSPECTION_NOTE",
        "lines": [
          {
            "speakerId": "building-manager",
            "text": "会社の照合に回します"
          }
        ]
      },
      {
        "id": "任意：考える",
        "label": "考える",
        "kind": "think",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "『古い』だけでは、何も決まらない"
          }
        ]
      },
      {
        "id": "再訪",
        "label": "再訪",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "technician",
            "text": "確認が必要なら、管理側を通してください。勝手に器具は開けないでください"
          }
        ]
      }
    ],
    "questions": []
  },
  {
    "id": "S16",
    "heading": "S16 10月13日／東成ビルサービス／佐伯・宮原・会社の確認担当・黒田",
    "body": [
      {
        "speakerId": "company-reviewer",
        "text": "照会いただいた案件、社内で確認しました。報告上は交換完了ですが、該当品番の払出しが確認できません"
      },
      {
        "speakerId": "minato",
        "text": "記録の保存漏れもあり得ますか"
      },
      {
        "speakerId": "company-reviewer",
        "text": "可能性はあります。ただ、別の物件でも似た不一致が見つかっています"
      },
      {
        "speakerId": "miyahara",
        "text": "同じ処理をした担当者がいるんですか"
      },
      {
        "speakerId": "company-reviewer",
        "text": "承認者は共通しています。ですが、通常の案件も承認する役職ですから、それだけでは何とも"
      },
      {
        "speakerId": "narrator",
        "text": "（黒田が応じる）"
      },
      {
        "speakerId": "kuroda",
        "text": "古い案件の書類は揃っていないものです。私が承認した案件も含め、まずは社内で確認します"
      },
      {
        "speakerId": "minato",
        "text": "そうですね。確認の結果を待ちます"
      }
    ],
    "actions": [
      {
        "id": "必須：聞く「部材払出し」",
        "label": "部材払出し",
        "kind": "talk",
        "required": true,
        "flag": "F_NO_DISPATCH",
        "lines": [
          {
            "speakerId": "company-reviewer",
            "text": "完了報告はありますが、対応する品番の払出しが確認できません"
          }
        ]
      },
      {
        "id": "必須：聞く「他の案件」",
        "label": "他の案件",
        "kind": "talk",
        "required": true,
        "flag": "F_MULTIPLE_GAPS",
        "lines": [
          {
            "speakerId": "company-reviewer",
            "text": "似た不一致はほかにもあります。ただし保存漏れの可能性は残ります"
          }
        ]
      },
      {
        "id": "任意：聞く「承認者」",
        "label": "承認者",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "company-reviewer",
            "text": "承認権限が共通でも、担当者が不正をした証拠にはなりません"
          }
        ]
      },
      {
        "id": "考える",
        "label": "考える",
        "kind": "think",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "帳簿の穴は見えた。何が起きたかは、まだ見えない"
          }
        ]
      },
      {
        "id": "再訪",
        "label": "再訪",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "kuroda",
            "text": "社内で調べています。結果が出るまでは、待っていただきたい"
          }
        ]
      }
    ],
    "questions": []
  },
  {
    "id": "S17",
    "heading": "S17 10月14日／探偵事務所／佐伯・澪／整理する",
    "body": [
      {
        "speakerId": "mio",
        "text": "いま分かっているのは、完了報告があること。対応する部材の払出しが確認できないこと。それが複数案件にあること"
      },
      {
        "speakerId": "minato",
        "text": "ただし、記録の欠落だけでは未施工と決まらない"
      },
      {
        "speakerId": "mio",
        "text": "三崎さんは、どうして差し戻したんでしょう"
      },
      {
        "speakerId": "minato",
        "text": "現場と書類が噛み合わなかった。少なくとも、差し戻しには理由が書いてある"
      },
      {
        "speakerId": "mio",
        "text": "じゃあ、調べるべきは『誰が悪いか』ではなく？"
      },
      {
        "speakerId": "minato",
        "text": "『差し戻した理由が、解消されたか』だ"
      },
      {
        "speakerId": "narrator",
        "text": "（プレイヤーの整理：完了報告＋点検控え＋部材払出し＋差し戻し理由。誤答でも情報を見直せる）"
      },
      {
        "speakerId": "mio",
        "text": "その案件、現在の表示では処理済みです。ただ、処理した時期や根拠はまだ確認できていません"
      },
      {
        "speakerId": "minato",
        "text": "処理した時期と、差し戻しへの回答を確認してもらおう"
      }
    ],
    "actions": [
      {
        "id": "正答後",
        "label": "正答後",
        "kind": "event",
        "required": false,
        "flag": "F_AUDIT_QUESTIONS",
        "lines": []
      }
    ],
    "questions": [
      {
        "prompt": "交換済みという報告に対して、今確認できていないものは？",
        "choices": [
          {
            "id": "A",
            "label": "三崎の勤務先"
          },
          {
            "id": "B",
            "label": "対応する部材の払出し"
          },
          {
            "id": "C",
            "label": "直人の家族構成"
          }
        ],
        "correct": "B",
        "answer": [
          {
            "speakerId": "minato",
            "text": "報告と出庫履歴が噛み合わない"
          }
        ],
        "wrong": [
          {
            "speakerId": "mio",
            "text": "交換の記録と、部品の動きを比べましょう"
          }
        ]
      },
      {
        "prompt": "不一致があるとき、今の段階で言えるのは？",
        "choices": [
          {
            "id": "A",
            "label": "交換は絶対に行われていない"
          },
          {
            "id": "B",
            "label": "黒田が転落させた"
          },
          {
            "id": "C",
            "label": "未施工・転記ミス・保存漏れなどを検証する必要がある"
          }
        ],
        "correct": "C",
        "answer": [
          {
            "speakerId": "minato",
            "text": "不一致は事実だ。理由はまだ一つじゃない"
          }
        ],
        "wrong": [
          {
            "speakerId": "mio",
            "text": "現物の古さだけでは決められない、と技術者も言っていました"
          }
        ]
      },
      {
        "prompt": "三崎の差し戻しで確認すべきなのは？",
        "choices": [
          {
            "id": "A",
            "label": "指摘が解消されたか"
          },
          {
            "id": "B",
            "label": "誰が一番怒っていたか"
          },
          {
            "id": "C",
            "label": "どの書類が古いかだけ"
          }
        ],
        "correct": "A",
        "answer": [
          {
            "speakerId": "minato",
            "text": "指摘のあと、どう処理されたかを会社に確認してもらう"
          }
        ],
        "wrong": [
          {
            "speakerId": "mio",
            "text": "差し戻しの理由と、その後の処理を見てください"
          }
        ]
      }
    ]
  },
  {
    "id": "S18",
    "heading": "S18 10月15日／東成ビルサービス／会社確認担当・宮原・佐伯（奥村へ連携）",
    "body": [
      {
        "speakerId": "company-reviewer",
        "text": "社内の権限者が履歴を確認しました。三崎さんの差し戻しは未解消のまま、亡くなった後に処理済みへ変更されています。佐伯さんには確認結果の概要のみ説明します。原本は会社で保全します"
      },
      {
        "speakerId": "minato",
        "text": "処理者は？"
      },
      {
        "speakerId": "company-reviewer",
        "text": "黒田です。なお、これだけで不正が確定するわけではありません"
      },
      {
        "speakerId": "miyahara",
        "text": "三崎が死んだあとに……。当時、私は処理済みと聞いて、それ以上確かめなかった"
      },
      {
        "speakerId": "company-reviewer",
        "text": "もう一点、転落当日の業務コメントがあります。16:18に三崎さんが説明を求め、16:32に黒田が『16:50頃に話そう』と返しています"
      },
      {
        "speakerId": "minato",
        "text": "亡くなった日の？"
      },
      {
        "speakerId": "company-reviewer",
        "text": "はい。記録は保全し、警察に正式に共有する手続きを進めています"
      },
      {
        "speakerId": "miyahara",
        "text": "……あいつは、最後まで確認しようとしてたんですね"
      },
      {
        "speakerId": "minato",
        "text": "三崎さんが確認を求めたことは分かります。ただ、実際に会ったかどうかはまだ分かりません"
      },
      {
        "speakerId": "narrator",
        "text": "（会社側が奥村に情報提供。佐伯も自身の調査で確認した事実と推測を分けて伝える）"
      },
      {
        "speakerId": "narrator",
        "text": "あの人が何を確かめたかったのか。残った記録から、もう一度たどってみよう"
      }
    ],
    "actions": [
      {
        "id": "必須：聞く「処理済みの理由」",
        "label": "処理済みの理由",
        "kind": "talk",
        "required": true,
        "flag": "F_UNRESOLVED_CLOSED",
        "lines": [
          {
            "speakerId": "company-reviewer",
            "text": "指摘は未解消のまま、三崎さんが亡くなった後に処理済みへ変更されています"
          }
        ]
      },
      {
        "id": "必須：聞く「転落当日のコメント」",
        "label": "転落当日のコメント",
        "kind": "talk",
        "required": true,
        "flag": "F_MEETING_PLAN",
        "lines": [
          {
            "speakerId": "company-reviewer",
            "text": "16:18に三崎さんが訂正を求め、16:32に黒田が『16:50頃に話そう』と返しています"
          }
        ]
      },
      {
        "id": "任意：聞く「原本の保全」",
        "label": "原本の保全",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "company-reviewer",
            "text": "会社で保全し、警察へ正式に共有します。原本はお渡しできません"
          }
        ]
      },
      {
        "id": "考える",
        "label": "考える",
        "kind": "think",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "約束したことと、会ったことは別だ"
          }
        ]
      },
      {
        "id": "進行",
        "label": "進行",
        "kind": "event",
        "required": false,
        "flag": "F_POLICE_HANDOFF",
        "lines": []
      }
    ],
    "questions": []
  },
  {
    "id": "BAR-A",
    "heading": "任意：BAR「雨宿り」／S17後〜S18前の夜",
    "body": [
      {
        "speakerId": "narrator",
        "text": "（落ち着いた照明。杏奈がグラスを下げる）"
      },
      {
        "speakerId": "reiko",
        "text": "今日は、いつもより遅いのね"
      },
      {
        "speakerId": "minato",
        "text": "時計を見てなかったもので"
      },
      {
        "speakerId": "reiko",
        "text": "仕事？"
      },
      {
        "speakerId": "minato",
        "text": "まあ、そんなところです"
      },
      {
        "speakerId": "reiko",
        "text": "話したくないなら、聞かないわ"
      },
      {
        "speakerId": "minato",
        "text": "助かります"
      },
      {
        "speakerId": "anna",
        "text": "お水、お持ちしますね"
      },
      {
        "speakerId": "minato",
        "text": "ありがとう"
      },
      {
        "speakerId": "narrator",
        "text": "（杏奈は静かに席を離れる）"
      },
      {
        "speakerId": "reiko",
        "text": "……でも、考え事はここに置いていってもいいのよ"
      },
      {
        "speakerId": "minato",
        "text": "それじゃ、帰るときに忘れそうだ"
      },
      {
        "speakerId": "reiko",
        "text": "たまには忘れなさい"
      },
      {
        "speakerId": "minato",
        "text": "努力します"
      }
    ],
    "actions": [
      {
        "id": "初回",
        "label": "初回",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "reiko",
            "text": "今日は遅いのね"
          },
          {
            "speakerId": "minato",
            "text": "時計を見てませんでした"
          },
          {
            "speakerId": "reiko",
            "text": "それ、仕事の顔ね"
          },
          {
            "speakerId": "minato",
            "text": "仕事の話はしませんよ"
          },
          {
            "speakerId": "reiko",
            "text": "ええ。聞かないわ"
          }
        ]
      },
      {
        "id": "調べる：カウンター",
        "label": "カウンター",
        "kind": "look",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "磨かれたグラスが並んでいる。怜子さんらしい"
          }
        ]
      },
      {
        "id": "聞く：杏奈",
        "label": "杏奈",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "anna",
            "text": "お水、足りていますか"
          },
          {
            "speakerId": "minato",
            "text": "ありがとう。大丈夫です"
          }
        ]
      },
      {
        "id": "再訪",
        "label": "再訪",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "reiko",
            "text": "いつもの席、空いてるわよ"
          },
          {
            "speakerId": "minato",
            "text": "少しだけ寄っていきます"
          }
        ]
      },
      {
        "id": "終了",
        "label": "終了",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "reiko",
            "text": "今日は考え事を置いていきなさい"
          },
          {
            "speakerId": "minato",
            "text": "忘れ物は苦手でね"
          }
        ]
      }
    ],
    "questions": []
  },
  {
    "id": "S19",
    "heading": "S19 探偵事務所：疑問",
    "body": [
      {
        "speakerId": "mio",
        "text": "亡くなった日の16:32、黒田さんは『16:50頃に話そう』と返している"
      },
      {
        "speakerId": "minato",
        "text": "予定だ。会った証拠じゃない"
      },
      {
        "speakerId": "mio",
        "text": "実際に会ったかどうか、警察が確認する必要がありますね"
      },
      {
        "speakerId": "minato",
        "text": "ああ。奥村さんには会社から記録が渡る。俺は、階段を見ておこう"
      },
      {
        "speakerId": "mio",
        "text": "事故だった可能性も忘れずに"
      },
      {
        "speakerId": "minato",
        "text": "……分かってる"
      },
      {
        "speakerId": "mio",
        "text": "その間は、分かってないときの顔です"
      },
      {
        "speakerId": "minato",
        "text": "厳しいな"
      }
    ],
    "actions": [
      {
        "id": "必須：考える「面談予定」",
        "label": "面談予定",
        "kind": "think",
        "required": true,
        "flag": "F_PLAN_NOT_MEETING",
        "lines": [
          {
            "speakerId": "minato",
            "text": "会社の記録は約束まで。会ったかどうかは警察が確かめる"
          }
        ]
      },
      {
        "id": "任意：聞く「事故の可能性」",
        "label": "事故の可能性",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "mio",
            "text": "事故だったとしても、記録の不一致は残ります"
          }
        ]
      },
      {
        "id": "調べる：会社の確認事項メモ",
        "label": "会社の確認事項メモ",
        "kind": "look",
        "required": false,
        "lines": [
          {
            "speakerId": "minato",
            "text": "差し戻しと処理済み。その間に説明がない"
          }
        ]
      },
      {
        "id": "移動",
        "label": "移動",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "mio",
            "text": "現場で分かるのは今の構造だけです。気をつけて"
          }
        ]
      }
    ],
    "questions": []
  },
  {
    "id": "S20",
    "heading": "S20 現在の階段：現場の限界",
    "body": [
      {
        "speakerId": "building-manager",
        "text": "階段は当時から大きく変わっていません"
      },
      {
        "speakerId": "minato",
        "text": "上の踊り場から、折り返して下へ……"
      },
      {
        "speakerId": "building-manager",
        "text": "事故だったと聞いています"
      },
      {
        "speakerId": "minato",
        "text": "ええ。今ここに立っても、当日誰がいたかは分からない"
      },
      {
        "speakerId": "narrator",
        "text": "場所は何も喋らない。記録と結びついて、初めて意味を持つ"
      }
    ],
    "actions": [
      {
        "id": "必須：調べる「踊り場」",
        "label": "踊り場",
        "kind": "look",
        "required": true,
        "flag": "F_STAIR_PRESENT",
        "lines": [
          {
            "speakerId": "minato",
            "text": "ここから見えるのは、今の階段だ"
          }
        ]
      },
      {
        "id": "任意：聞く「改修」",
        "label": "改修",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "building-manager",
            "text": "大きな構造変更はありません。ただ、当日の人の動きは分かりません"
          }
        ]
      },
      {
        "id": "考える",
        "label": "考える",
        "kind": "think",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "現場を見ただけで、過去の転落を再現した気になるな"
          }
        ]
      },
      {
        "id": "再訪",
        "label": "再訪",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "building-manager",
            "text": "現場確認は以上です。過去の記録は警察へ"
          }
        ]
      }
    ],
    "questions": []
  },
  {
    "id": "S21",
    "heading": "S21 警察署：奥村・瀬川",
    "body": [
      {
        "speakerId": "okumura",
        "text": "佐伯。会社から新しい資料が来た。三崎さんの案件コメントだ。内容の詳細はまだ話せんが、お前が伝えた確認事項と一致している"
      },
      {
        "speakerId": "minato",
        "text": "面談予定の記録ですね"
      },
      {
        "speakerId": "segawa",
        "text": "当時の資料も、こちらで改めて照合しています。個別の内容は捜査資料なので、お話しできません"
      },
      {
        "speakerId": "minato",
        "text": "当時の記録と、今回見つかったものは別ですね"
      },
      {
        "speakerId": "segawa",
        "text": "はい。新しく確認された会社の記録と、当時の捜査資料は分けて扱います"
      },
      {
        "speakerId": "okumura",
        "text": "以前の判断も含めて検証する。まだ話せないことは勘弁してくれ"
      },
      {
        "speakerId": "minato",
        "text": "面談予定だけでは、実際に会ったかどうかも分かりません"
      },
      {
        "speakerId": "okumura",
        "text": "調べ直す理由にはなる。だが、それだけで答えが出るわけじゃない"
      },
      {
        "speakerId": "minato",
        "text": "奥村さんは、いつもそこを間違えませんね"
      },
      {
        "speakerId": "okumura",
        "text": "お前こそ、早合点するなよ"
      }
    ],
    "actions": [
      {
        "id": "必須：聞く「新しい資料の扱い」",
        "label": "新しい資料の扱い",
        "kind": "talk",
        "required": true,
        "flag": "F_OKUMURA_REVIEW",
        "lines": [
          {
            "speakerId": "okumura",
            "text": "会社の資料は受け取った。裏付けはこっちで取る"
          }
        ]
      },
      {
        "id": "任意：聞く「当時の調査」",
        "label": "当時の調査",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "segawa",
            "text": "当時の記録は改めて確認しています。詳しい内容はお話しできません"
          }
        ]
      },
      {
        "id": "考える",
        "label": "考える",
        "kind": "think",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "渡せる材料を渡した。次は奥村さんの仕事だ"
          }
        ]
      },
      {
        "id": "再訪",
        "label": "再訪",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "okumura",
            "text": "新しいことが分かっても、今話せるとは限らんぞ"
          }
        ]
      }
    ],
    "questions": []
  },
  {
    "id": "S22",
    "heading": "S22 黒田への任意確認：初期説明",
    "body": [
      {
        "speakerId": "okumura",
        "text": "三崎さんと16:50頃に話す約束をしていましたね"
      },
      {
        "speakerId": "kuroda",
        "text": "ええ。ただ、実際には会っていません"
      },
      {
        "speakerId": "segawa",
        "text": "階段扉は使われています"
      },
      {
        "speakerId": "kuroda",
        "text": "通りました。以前もそう説明したはずです"
      },
      {
        "speakerId": "okumura",
        "text": "そうです。階段を通ったことと、三崎さんと話したことは別です"
      },
      {
        "speakerId": "narrator",
        "text": "（黒田は机上の資料を一度見てから、奥村へ視線を戻す）"
      },
      {
        "speakerId": "kuroda",
        "text": "でしたら、答えは変わりません"
      },
      {
        "speakerId": "okumura",
        "text": "分かりました。引き続き、当時の経緯を確認します"
      }
    ],
    "actions": [
      {
        "id": "警察演出・固定",
        "label": "警察演出・固定",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "okumura",
            "text": "三崎さんとは会いましたか"
          },
          {
            "speakerId": "kuroda",
            "text": "約束はしましたが、会っていません"
          },
          {
            "speakerId": "segawa",
            "text": "階段を通ったことは？"
          },
          {
            "speakerId": "kuroda",
            "text": "それは以前も話しました"
          }
        ]
      },
      {
        "id": "演出用の考える",
        "label": "演出用の考える",
        "kind": "think",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "階段を通ったことと、会ったことは別。ここを飛ばせない"
          }
        ]
      },
      {
        "id": "演出",
        "label": "演出",
        "kind": "event",
        "required": false,
        "lines": []
      },
      {
        "id": "プレイヤー選択なし",
        "label": "プレイヤー選択なし",
        "kind": "event",
        "required": false,
        "lines": []
      }
    ],
    "questions": []
  },
  {
    "id": "S23",
    "heading": "S23 探偵事務所：「整理する」",
    "body": [
      {
        "speakerId": "mio",
        "text": "会社が確認したのは面談予定。階段の記録や証言の詳細は、警察の手元にあります"
      },
      {
        "speakerId": "minato",
        "text": "俺たちに分かるのは、予定と実際の面会は別だということだ"
      },
      {
        "speakerId": "mio",
        "text": "私たちの調査で、まだ確かめられていないことは？"
      },
      {
        "speakerId": "minato",
        "text": "会社が保全した『面談の約束』と未解消記録は、もう奥村さんたちに渡っている。俺たちは確認した範囲を整理しておこう"
      },
      {
        "speakerId": "mio",
        "text": "私たちが確かめたことは、ここまでですね"
      },
      {
        "speakerId": "minato",
        "text": "ああ。あとは、向こうに任せる"
      }
    ],
    "actions": [
      {
        "id": "正答後",
        "label": "正答後",
        "kind": "event",
        "required": false,
        "flag": "F_EVIDENCE_BOUNDARY",
        "lines": [
          {
            "speakerId": "mio",
            "text": "会社から警察へ資料は渡っています。私たちの確認事項を整理しておきましょう"
          }
        ]
      },
      {
        "id": "再挑戦",
        "label": "再挑戦",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "minato",
            "text": "警察の資料は、こちらの手札に入れない"
          }
        ]
      }
    ],
    "questions": [
      {
        "prompt": "会社が新たに確認したものは？",
        "choices": [
          {
            "id": "A",
            "label": "三崎と黒田の面談の約束"
          },
          {
            "id": "B",
            "label": "黒田が押した瞬間"
          },
          {
            "id": "C",
            "label": "階段で聞こえた声の主"
          }
        ],
        "correct": "A",
        "answer": [
          {
            "speakerId": "minato",
            "text": "16:32の返信は、面談予定を示している"
          }
        ],
        "wrong": [
          {
            "speakerId": "mio",
            "text": "会社の業務コメントに書かれている範囲だけです"
          }
        ]
      },
      {
        "prompt": "面談予定だけから結論できないのは？",
        "choices": [
          {
            "id": "A",
            "label": "返信が残っていること"
          },
          {
            "id": "B",
            "label": "実際に会ったことと転落の原因"
          },
          {
            "id": "C",
            "label": "会社が原本を保全したこと"
          }
        ],
        "correct": "B",
        "answer": [
          {
            "speakerId": "minato",
            "text": "約束と実行、実行と転落。そこは分ける"
          }
        ],
        "wrong": [
          {
            "speakerId": "mio",
            "text": "約束があっても、会ったかどうかはまだ分かりません"
          }
        ]
      }
    ]
  },
  {
    "id": "S24",
    "heading": "S24 奥村・瀬川：事故説の再検討",
    "body": [
      {
        "speakerId": "segawa",
        "text": "当時の写真では、書類ケースが上の踊り場付近にあります"
      },
      {
        "speakerId": "okumura",
        "text": "それだけなら、事故でも説明できる"
      },
      {
        "speakerId": "segawa",
        "text": "上腕の損傷も、他人との接触を示すとは限りません"
      },
      {
        "speakerId": "okumura",
        "text": "無理に答えへ寄せるな。確認できる範囲を積み上げろ"
      },
      {
        "speakerId": "segawa",
        "text": "はい。会社の面談記録の保存経緯も照会します"
      }
    ],
    "actions": [
      {
        "id": "警察演出・固定",
        "label": "警察演出・固定",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "segawa",
            "text": "ケースの位置も、傷も、それだけでは他人が押した証拠になりません"
          },
          {
            "speakerId": "okumura",
            "text": "事故の可能性を消すな"
          }
        ]
      },
      {
        "id": "プレイヤー選択なし",
        "label": "プレイヤー選択なし",
        "kind": "event",
        "required": false,
        "lines": []
      }
    ],
    "questions": []
  },
  {
    "id": "S25",
    "heading": "S25 再聴取：説明の変更",
    "body": [
      {
        "speakerId": "okumura",
        "text": "『会っていない』とのことでしたが、約束の前後の行動をもう一度確認させてください"
      },
      {
        "speakerId": "kuroda",
        "text": "……あの日のことを、今さら細かく？"
      },
      {
        "speakerId": "segawa",
        "text": "無理に時刻を断定していただく必要はありません。覚えている範囲で"
      },
      {
        "speakerId": "okumura",
        "text": "当時、階段を使ったことは認めておられました。会わなかったのなら、それも含めて経緯を確認したいんです"
      },
      {
        "speakerId": "narrator",
        "text": "（黒田は答えかけて止まる。瀬川は沈黙を埋めず、奥村も次の質問を急がない）"
      },
      {
        "speakerId": "kuroda",
        "text": "……会わなかったことに、したかったんです"
      },
      {
        "speakerId": "segawa",
        "text": "どういう意味でしょう"
      },
      {
        "speakerId": "kuroda",
        "text": "仕事のことで揉めたんです。死んだ人間と口論したなんて言えば、私が何かしたと思われる"
      },
      {
        "speakerId": "okumura",
        "text": "それで、面会そのものを否定した？"
      },
      {
        "speakerId": "kuroda",
        "text": "……階段で、少し話しました"
      },
      {
        "speakerId": "okumura",
        "text": "三崎さんと？"
      },
      {
        "speakerId": "kuroda",
        "text": "ええ。修繕の件で。言い合いになりましたが、私は先に離れました"
      },
      {
        "speakerId": "segawa",
        "text": "前回は、会っていないと"
      },
      {
        "speakerId": "kuroda",
        "text": "疑われるのが嫌だったんです。……それで、話したことまで消した"
      },
      {
        "speakerId": "okumura",
        "text": "今の説明も確認します。転落について、見聞きしたことは？"
      },
      {
        "speakerId": "kuroda",
        "text": "……ありません"
      }
    ],
    "actions": [
      {
        "id": "警察演出・固定",
        "label": "警察演出・固定",
        "kind": "event",
        "required": false,
        "lines": []
      },
      {
        "id": "瀬川の補足",
        "label": "瀬川の補足",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "segawa",
            "text": "前の説明と違う点は記録します。今の話も確認が必要です"
          }
        ]
      },
      {
        "id": "演出",
        "label": "演出",
        "kind": "event",
        "required": false,
        "lines": []
      },
      {
        "id": "プレイヤー選択なし",
        "label": "プレイヤー選択なし",
        "kind": "event",
        "required": false,
        "lines": []
      }
    ],
    "questions": []
  },
  {
    "id": "S26",
    "heading": "S26 探偵事務所：2つの仮説",
    "body": [
      {
        "speakerId": "narrator",
        "text": "（S25の再聴取内容は警察内部の情報であり、佐伯と澪は知らない）"
      },
      {
        "speakerId": "mio",
        "text": "会社の記録では、面談の約束があった。実際に会ったかどうかは、まだ私たちには分かりません"
      },
      {
        "speakerId": "minato",
        "text": "会っていたとしても、事故の可能性は残る"
      },
      {
        "speakerId": "mio",
        "text": "逆に、会っていなかったとしても、書類の不一致は消えません"
      },
      {
        "speakerId": "minato",
        "text": "そこを混ぜると、何でも都合よく見えてしまうな"
      },
      {
        "speakerId": "mio",
        "text": "三崎さんが求めた訂正は、結局どうなったんでしょう"
      },
      {
        "speakerId": "minato",
        "text": "未解消のまま処理済みになった。原本は会社から警察へ渡っている。俺たちは疑問を整理しよう"
      },
      {
        "speakerId": "mio",
        "text": "分かりました。推測の部分には印をつけておきます"
      },
      {
        "speakerId": "minato",
        "text": "助かる"
      },
      {
        "speakerId": "mio",
        "text": "佐伯さんの字、後で読めなくなるので"
      },
      {
        "speakerId": "minato",
        "text": "……それも事実だな"
      }
    ],
    "actions": [
      {
        "id": "必須：考える「事故と他人の関与」",
        "label": "事故と他人の関与",
        "kind": "think",
        "required": true,
        "flag": "F_ALTERNATE_DEATH",
        "lines": [
          {
            "speakerId": "minato",
            "text": "面談があったとしても、転落が事故かどうかは決まらない"
          }
        ]
      },
      {
        "id": "任意：聞く「残る仕事」",
        "label": "残る仕事",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "mio",
            "text": "黒田さんが処理済みにしたことは確認できています。未解消の指摘が、なぜ閉じられたのかを整理しましょう"
          }
        ]
      },
      {
        "id": "調べる：手帳",
        "label": "手帳",
        "kind": "look",
        "required": false,
        "lines": [
          {
            "speakerId": "minato",
            "text": "三崎さんの名前と、会社が残した時刻。ここまでは確認できる"
          }
        ]
      },
      {
        "id": "再訪",
        "label": "再訪",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "mio",
            "text": "答えを決める前に、会社の記録をもう一度見ましょう"
          }
        ]
      }
    ],
    "questions": []
  },
  {
    "id": "S27",
    "heading": "S27 最終「整理する」",
    "body": [
      {
        "speakerId": "mio",
        "text": "会社が残したのは、未解消の差し戻しと面談の約束。実際に何が起きたかは、まだ分かりません"
      },
      {
        "speakerId": "minato",
        "text": "転落した瞬間のことは、まだ分からない"
      },
      {
        "speakerId": "mio",
        "text": "奥村さんに伝えるのは？"
      },
      {
        "speakerId": "minato",
        "text": "三崎さんが訂正を求めた記録は、死後に解決されないまま処理済みになった。その処理者が面談の相手でもある。事故かどうかは決められないが、当時の説明を確かめ直す理由にはなる"
      },
      {
        "speakerId": "narrator",
        "text": "（奥村に電話）"
      },
      {
        "speakerId": "minato",
        "text": "奥村さん。会社から渡った記録について、確認事項を整理しました。まだ説明のつかない空白があります"
      },
      {
        "speakerId": "okumura",
        "text": "聞こう"
      }
    ],
    "actions": [
      {
        "id": "全正答後",
        "label": "全正答後",
        "kind": "event",
        "required": false,
        "flag": "F_FINAL_HANDOFF",
        "lines": [
          {
            "speakerId": "minato",
            "text": "奥村さん。会社から届いた記録について、確認事項を時系列にまとめました。処理済みになるまでの説明が、抜けています"
          },
          {
            "speakerId": "okumura",
            "text": "分かった。確認する"
          }
        ]
      },
      {
        "id": "再挑戦",
        "label": "再挑戦",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "mio",
            "text": "『分からない』という結論も、今は必要です"
          }
        ]
      },
      {
        "id": "達成感の演出",
        "label": "達成感の演出",
        "kind": "event",
        "required": false,
        "lines": []
      }
    ],
    "questions": [
      {
        "prompt": "三崎が面談を求めた背景として記録に残るのは？",
        "choices": [
          {
            "id": "A",
            "label": "未解消の修繕差し戻し"
          },
          {
            "id": "B",
            "label": "直人の失踪"
          },
          {
            "id": "C",
            "label": "個人的な恨み"
          }
        ],
        "correct": "A",
        "answer": [
          {
            "speakerId": "minato",
            "text": "訂正を求めた記録がある"
          }
        ],
        "wrong": [
          {
            "speakerId": "mio",
            "text": "2つの事件は直接つながっていません。会社の記録を見ましょう"
          }
        ]
      },
      {
        "prompt": "面談予定と転落の関係について言えることは？",
        "choices": [
          {
            "id": "A",
            "label": "面談予定だけで突き飛ばしは証明できない"
          },
          {
            "id": "B",
            "label": "予定があれば殺人確定"
          },
          {
            "id": "C",
            "label": "予定がなければ事故確定"
          }
        ],
        "correct": "A",
        "answer": [
          {
            "speakerId": "minato",
            "text": "そこは奥村さんたちが確かめる"
          }
        ],
        "wrong": [
          {
            "speakerId": "mio",
            "text": "約束、実際の面会、転落原因を分けてください"
          }
        ]
      },
      {
        "prompt": "警察に追加で伝えるべき検証事項は？",
        "choices": [
          {
            "id": "A",
            "label": "黒田を逮捕するよう要求"
          },
          {
            "id": "B",
            "label": "未解消の差し戻しが死後に処理済みになり、その処理者が面談相手だったこと"
          },
          {
            "id": "C",
            "label": "直人が犯人を見たこと"
          }
        ],
        "correct": "B",
        "answer": [
          {
            "speakerId": "minato",
            "text": "俺たちの結論じゃない。確認してほしい空白だ"
          }
        ],
        "wrong": [
          {
            "speakerId": "mio",
            "text": "私たちが確認できた事実に戻りましょう"
          }
        ]
      }
    ]
  },
  {
    "id": "S28",
    "heading": "S28 警察側の再聴取・検証",
    "body": [
      {
        "speakerId": "narrator",
        "text": "（場面は奥村と瀬川の捜査に切り替わる。佐伯は同席しない）"
      },
      {
        "speakerId": "segawa",
        "text": "黒田さんの説明を時系列にしました。面談があったことはご本人が認めています"
      },
      {
        "speakerId": "okumura",
        "text": "それでも、転落との関係は別だ"
      },
      {
        "speakerId": "narrator",
        "text": "（数日を置いた任意の再聴取。黒田には事前に確認事項が伝えられている。奥村は前回の説明を一方的に読み上げず、黒田自身の言葉で経過を話すよう求める）"
      },
      {
        "speakerId": "okumura",
        "text": "三崎さんと別れたあと、どこへ向かいましたか"
      },
      {
        "speakerId": "kuroda",
        "text": "……覚えていません"
      },
      {
        "speakerId": "okumura",
        "text": "覚えていないことは、そのままで構いません。前回は、口論を隠したかったとおっしゃいましたね"
      },
      {
        "speakerId": "kuroda",
        "text": "そうです。……口論しただけだと、思ってほしかった"
      },
      {
        "speakerId": "narrator",
        "text": "（黒田は口を閉ざす。奥村は急かさず、記録を伏せて待つ）"
      },
      {
        "speakerId": "kuroda",
        "text": "最初は、会わなかったことにした。次は、先に帰ったことにした。……三崎が死んだと聞いたとき、これで説明しなくて済むと思ったんです"
      },
      {
        "speakerId": "okumura",
        "text": "なぜ、説明を変えたんですか"
      },
      {
        "speakerId": "kuroda",
        "text": "訂正はできたんです。面倒でも、やるべきだった。……私がやりたくなかっただけです"
      },
      {
        "speakerId": "kuroda",
        "text": "事故だと聞いて、ほっとしたんです。そのくせ、あいつが何を直そうとしていたのかは、今も覚えている"
      },
      {
        "speakerId": "segawa",
        "text": "口論のあと、何がありましたか。覚えているところからで構いません"
      },
      {
        "speakerId": "kuroda",
        "text": "……あいつは、間違っていると何度も言った。直すには、私がこれまで承認したものまで見直す必要があった"
      },
      {
        "speakerId": "okumura",
        "text": "それで、どうしたんですか"
      },
      {
        "speakerId": "kuroda",
        "text": "三崎が、もう一度記録を見せようとして……私は……"
      },
      {
        "speakerId": "narrator",
        "text": "（黒田は両手を膝の上で握り直す。少し間を置いて、自分から顔を上げる）"
      },
      {
        "speakerId": "kuroda",
        "text": "三崎を押しました。……止めようとしたんじゃない。腹が立って、突き放したんです"
      },
      {
        "speakerId": "okumura",
        "text": "それから？"
      },
      {
        "speakerId": "kuroda",
        "text": "下に落ちたのは分かりました。でも、見に行かなかった。誰にも知らせずに……戻りました"
      },
      {
        "speakerId": "okumura",
        "text": "今のお話は記録します。事実関係を、改めて確認させてください"
      },
      {
        "speakerId": "narrator",
        "text": "（後刻）"
      },
      {
        "speakerId": "segawa",
        "text": "供述と当時の現場記録を照合しています。外部から知り得た情報と、ご本人の記憶は分けて確認します"
      },
      {
        "speakerId": "okumura",
        "text": "供述だけで終わらせるな。事故の可能性も含めて調べる。本人しか知り得ないことがあるのか、先に外部へ出た情報なのかも分けて確認しろ"
      }
    ],
    "actions": [
      {
        "id": "警察演出・固定",
        "label": "警察演出・固定",
        "kind": "event",
        "required": false,
        "lines": []
      },
      {
        "id": "検証会話",
        "label": "検証会話",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "segawa",
            "text": "供述に含まれる場所や順序が、当時公開されていた情報から言えるものか確認します"
          },
          {
            "speakerId": "okumura",
            "text": "供述の前後関係も調べる。認めたから終わり、にはするな"
          }
        ]
      },
      {
        "id": "演出",
        "label": "演出",
        "kind": "event",
        "required": false,
        "lines": []
      },
      {
        "id": "選択なし",
        "label": "選択なし",
        "kind": "event",
        "required": false,
        "lines": []
      }
    ],
    "questions": []
  },
  {
    "id": "S29",
    "heading": "S29 後日／探偵事務所：奥村の報告",
    "body": [
      {
        "speakerId": "narrator",
        "text": "（奥村が事務所を訪れる）"
      },
      {
        "speakerId": "mio",
        "text": "奥村さん、コーヒーはいかがですか"
      },
      {
        "speakerId": "okumura",
        "text": "いただこう"
      },
      {
        "speakerId": "minato",
        "text": "珍しいですね。わざわざ"
      },
      {
        "speakerId": "okumura",
        "text": "会社への照会で、お前の確認事項が役に立った。礼を言いに来た"
      },
      {
        "speakerId": "minato",
        "text": "黒田さんの件ですか"
      },
      {
        "speakerId": "okumura",
        "text": "詳しいことはまだ話せん。ただ、あの日の経緯について、以前とは違う説明が出てきた"
      },
      {
        "speakerId": "minato",
        "text": "……そうですか"
      },
      {
        "speakerId": "okumura",
        "text": "裏付けはまだ調べている。ここから先は、俺たちの仕事だ"
      },
      {
        "speakerId": "minato",
        "text": "分かっています"
      },
      {
        "speakerId": "okumura",
        "text": "お前が最初に伝えた違和感は、無駄にはならなかった"
      },
      {
        "speakerId": "minato",
        "text": "俺が知っているのは、残った記録だけです"
      },
      {
        "speakerId": "okumura",
        "text": "だからこそ、勝手に分かった気になるなよ"
      },
      {
        "speakerId": "minato",
        "text": "……ええ"
      },
      {
        "speakerId": "okumura",
        "text": "じゃあな。コーヒー、うまかった"
      },
      {
        "speakerId": "mio",
        "text": "ありがとうございます"
      },
      {
        "speakerId": "narrator",
        "text": "（奥村退出）"
      }
    ],
    "actions": [
      {
        "id": "必須：聞く「調査の区切り」",
        "label": "調査の区切り",
        "kind": "talk",
        "required": true,
        "flag": "F_POLICE_THANKS",
        "lines": [
          {
            "speakerId": "okumura",
            "text": "会社への確認事項は役に立った。詳しい捜査は話せんが、礼を言いに来た"
          }
        ]
      },
      {
        "id": "任意：聞く「三崎の件」",
        "label": "三崎の件",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "okumura",
            "text": "まだ確認している。今はそれ以上言えん"
          },
          {
            "speakerId": "minato",
            "text": "分かりました"
          }
        ]
      },
      {
        "id": "調べる：コーヒー",
        "label": "コーヒー",
        "kind": "look",
        "required": false,
        "lines": [
          {
            "speakerId": "minato",
            "text": "奥村さん、砂糖は？"
          },
          {
            "speakerId": "okumura",
            "text": "今日はそのままでいい"
          }
        ]
      },
      {
        "id": "再訪なし",
        "label": "再訪なし",
        "kind": "event",
        "required": false,
        "lines": []
      }
    ],
    "questions": []
  },
  {
    "id": "S30",
    "heading": "S30 エンディング／探偵事務所",
    "body": [
      {
        "speakerId": "narrator",
        "text": "（夕方。澪がカップを置く）"
      },
      {
        "speakerId": "mio",
        "text": "高瀬さんから連絡がありました。直人さん、少しずつ普段の生活に戻っているそうです"
      },
      {
        "speakerId": "minato",
        "text": "よかったな"
      },
      {
        "speakerId": "mio",
        "text": "あかりさん、退院してから言いたいことが山ほどあるって"
      },
      {
        "speakerId": "minato",
        "text": "直人さんも覚悟が必要だ"
      },
      {
        "speakerId": "mio",
        "text": "ふふ。……三崎さんのことは、どう思います？"
      },
      {
        "speakerId": "minato",
        "text": "分からないことが多いよ。どんな声で笑ったかも、何が好きだったかも"
      },
      {
        "speakerId": "mio",
        "text": "でも、仕事の記録は残っていた"
      },
      {
        "speakerId": "minato",
        "text": "ああ。……あのまま終わったことにしなくてよかった"
      },
      {
        "speakerId": "mio",
        "text": "コーヒー、冷めますよ"
      },
      {
        "speakerId": "minato",
        "text": "……いただくよ"
      },
      {
        "speakerId": "narrator",
        "text": "（窓の外、街の明かり）"
      },
      {
        "speakerId": "narrator",
        "text": "『処理済み』か。……便利な言葉だな"
      }
    ],
    "actions": [
      {
        "id": "必須：聞く「直人の近況」",
        "label": "直人の近況",
        "kind": "talk",
        "required": true,
        "flag": "F_NAOTO_RECOVERY",
        "lines": [
          {
            "speakerId": "mio",
            "text": "少しずつ普段の生活に戻っているそうです"
          }
        ]
      },
      {
        "id": "任意：考える「三崎の記録」",
        "label": "三崎の記録",
        "kind": "think",
        "required": false,
        "lines": [
          {
            "speakerId": "narrator",
            "text": "俺が知っているのは、残った文字と、それを見た人の話だけだ"
          }
        ]
      },
      {
        "id": "調べる：コーヒー",
        "label": "コーヒー",
        "kind": "look",
        "required": false,
        "lines": [
          {
            "speakerId": "minato",
            "text": "今日はちょうどいい"
          },
          {
            "speakerId": "mio",
            "text": "今日は、ですか"
          },
          {
            "speakerId": "minato",
            "text": "毎日うまいよ"
          },
          {
            "speakerId": "mio",
            "text": "……なら、いいです"
          }
        ]
      },
      {
        "id": "終了",
        "label": "終了",
        "kind": "event",
        "required": false,
        "lines": []
      }
    ],
    "questions": []
  },
  {
    "id": "BAR-B",
    "heading": "BAR「雨宿り」任意エピローグ（S30後、別枠）",
    "body": [
      {
        "speakerId": "narrator",
        "text": "（夜。常連としてカウンターに座る佐伯。杏奈は静かに片付けをしている）"
      },
      {
        "speakerId": "reiko",
        "text": "今日は、少し顔色がいいわね"
      },
      {
        "speakerId": "minato",
        "text": "そう見えます？"
      },
      {
        "speakerId": "reiko",
        "text": "この前は、ずっと何か考えてた"
      },
      {
        "speakerId": "minato",
        "text": "いつもですよ"
      },
      {
        "speakerId": "reiko",
        "text": "今日は、ちゃんとここにいる顔"
      },
      {
        "speakerId": "minato",
        "text": "……それは、よかった"
      },
      {
        "speakerId": "anna",
        "text": "お水、お替わりいかがですか"
      },
      {
        "speakerId": "minato",
        "text": "お願いします"
      },
      {
        "speakerId": "reiko",
        "text": "また、ふらっと来なさい"
      },
      {
        "speakerId": "minato",
        "text": "そうします"
      }
    ],
    "actions": [
      {
        "id": "初回",
        "label": "初回",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "reiko",
            "text": "今日は、ちゃんとここにいる顔ね"
          },
          {
            "speakerId": "minato",
            "text": "いつもいますよ"
          },
          {
            "speakerId": "reiko",
            "text": "心ここにあらず、って顔もあるの"
          },
          {
            "speakerId": "minato",
            "text": "……一本取られた"
          }
        ]
      },
      {
        "id": "聞く：杏奈",
        "label": "杏奈",
        "kind": "talk",
        "required": false,
        "lines": [
          {
            "speakerId": "anna",
            "text": "お水、お替わりいかがですか"
          },
          {
            "speakerId": "minato",
            "text": "お願いします"
          }
        ]
      },
      {
        "id": "再訪",
        "label": "再訪",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "reiko",
            "text": "今日は何も聞かないわ"
          },
          {
            "speakerId": "minato",
            "text": "それが一番ありがたい"
          }
        ]
      },
      {
        "id": "終了",
        "label": "終了",
        "kind": "event",
        "required": false,
        "lines": [
          {
            "speakerId": "reiko",
            "text": "またいらっしゃい"
          },
          {
            "speakerId": "minato",
            "text": "ええ、また"
          }
        ]
      }
    ],
    "questions": []
  }
]
