// 物語担当のver0.03から同期。原稿の正本は物語担当が管理。
import type { RevisionData } from './buildRevision'
export const revisionData = {
  "scenes": [
    {
      "id": "P1-01",
      "part": 1,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-08T10:40:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "西新宿の朝は、窓を閉めても静かにはならない。配送車のエンジン、階下の店がシャッターを開ける音。どれもこの部屋まで届く頃には、少し遠い。"
        },
        {
          "speakerId": "narrator",
          "text": "机の上の帳簿は、昨日と同じところにあった。"
        },
        {
          "speakerId": "mio",
          "text": "佐伯さん。コーヒー、置きますね。"
        },
        {
          "speakerId": "minato",
          "text": "ありがとう。"
        },
        {
          "speakerId": "mio",
          "text": "今日は、お昼までお約束はありません。"
        },
        {
          "speakerId": "minato",
          "text": "そうか？"
        },
        {
          "speakerId": "narrator",
          "text": "カップへ手を伸ばす。澪の指が、その隣の帳簿に触れた。"
        },
        {
          "speakerId": "mio",
          "text": "こちらも、今のうちに。"
        },
        {
          "speakerId": "minato",
          "text": "昨日も聞いた気がする。"
        },
        {
          "speakerId": "mio",
          "text": "昨日は、お出かけになる前でしたから。"
        },
        {
          "speakerId": "minato",
          "text": "今日は逃げ道がないな。"
        },
        {
          "speakerId": "mio",
          "text": "お時間はあります。"
        },
        {
          "speakerId": "narrator",
          "text": "俺は帳簿を開いた。澪は笑わずに、領収書の束を向けてきた。その方が少し堪える。"
        }
      ],
      "people": [
        "mio"
      ],
      "required": [
        "p1-ledger"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p1-schedule",
          "personId": "mio",
          "label": "今日の予定",
          "lines": [
            {
              "speakerId": "minato",
              "text": "午後は？"
            },
            {
              "speakerId": "mio",
              "text": "今のところ空いています。前の依頼のご報告は、お送りしました。"
            },
            {
              "speakerId": "minato",
              "text": "あの店主、納得していたか？"
            },
            {
              "speakerId": "mio",
              "text": "はい。お礼と、もう少し早く相談すればよかったと。"
            },
            {
              "speakerId": "minato",
              "text": "話せるようになるまで、時間がかかることもある。"
            },
            {
              "speakerId": "mio",
              "text": "それなら、来ていただいた時にお話を聞けるよう、空けておきましょう。"
            }
          ],
          "requires": [],
          "grants": [
            "optional-schedule"
          ],
          "required": false
        },
        {
          "id": "p1-coffee",
          "personId": "mio",
          "label": "コーヒー",
          "lines": [
            {
              "speakerId": "minato",
              "text": "今日のは、少し違うな。"
            },
            {
              "speakerId": "mio",
              "text": "昨日より軽めです。帳簿を見ながら何杯も飲まれると思って。"
            },
            {
              "speakerId": "minato",
              "text": "そこまで予定に入っていたか？"
            },
            {
              "speakerId": "mio",
              "text": "一杯で終われば、何よりです。"
            }
          ],
          "requires": [],
          "grants": [
            "optional-coffee"
          ],
          "required": false
        }
      ],
      "inspect": [
        {
          "id": "p1-ledger",
          "label": "帳簿を開く",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "数字を一つ読み違え、澪が指で示した。書き直そうとしたところで、インターホンが鳴った。"
            },
            {
              "speakerId": "mio",
              "text": "はい。佐伯探偵事務所です。"
            },
            {
              "speakerId": "narrator",
              "text": "少し間があった。"
            },
            {
              "speakerId": "akari",
              "text": "予約していないんですけど……相談をしても、いいですか？"
            },
            {
              "speakerId": "mio",
              "text": "はい。どうぞ、お入りください。"
            },
            {
              "speakerId": "narrator",
              "text": "俺がペンを置くより先に、澪は入口へ向かった。"
            }
          ],
          "requires": [],
          "grants": [
            "F00",
            "met-mio",
            "named-mio"
          ],
          "required": true
        }
      ],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P1-02",
        "requires": [
          "F00",
          "met-mio",
          "named-mio"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P1-02",
      "part": 1,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-08T10:55:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "赤いカーディガンの若い女性が立っていた。鞄の肩紐を握ったまま、部屋を見回している。"
        }
      ],
      "people": [
        "mio",
        "akari"
      ],
      "required": [
        "p1-visitor"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p1-visitor",
          "personId": "akari",
          "label": "相談を聞く",
          "lines": [
            {
              "speakerId": "mio",
              "text": "こちらへどうぞ。今日は、どのようなご相談でしょうか？"
            },
            {
              "speakerId": "akari",
              "text": "兄が、帰ってこなくて。"
            },
            {
              "speakerId": "mio",
              "text": "お兄さんのことですね。まずお名前を伺ってもよろしいですか？"
            },
            {
              "speakerId": "akari",
              "text": "高瀬あかりです。",
              "grants": [
                "met-akari",
                "named-akari"
              ]
            },
            {
              "speakerId": "mio",
              "text": "相澤です。こちらが佐伯です。"
            },
            {
              "speakerId": "minato",
              "text": "佐伯だ。座ってくれ。"
            },
            {
              "speakerId": "narrator",
              "text": "あかりは椅子を少しだけ引き、浅く腰を下ろした。澪が空いた席へお茶を置く。"
            },
            {
              "speakerId": "mio",
              "text": "熱いので、ゆっくりどうぞ。"
            },
            {
              "speakerId": "akari",
              "text": "ありがとうございます。"
            },
            {
              "speakerId": "minato",
              "text": "兄の名前を聞いてもいいか？"
            },
            {
              "speakerId": "akari",
              "text": "高瀬直人です。",
              "grants": [
                "mentioned-naoto",
                "named-naoto",
                "brother-profile"
              ]
            },
            {
              "speakerId": "narrator",
              "text": "澪は名前を書いてから、ペンを止めた。続きを待つことも、聞き取りの一部だった。"
            }
          ],
          "requires": [],
          "grants": [
            "met-akari",
            "named-akari",
            "mentioned-naoto",
            "named-naoto",
            "brother-profile"
          ],
          "required": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P1-03",
        "requires": [
          "met-akari",
          "named-akari",
          "mentioned-naoto",
          "named-naoto",
          "brother-profile"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P1-03",
      "part": 1,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-08T11:00:00",
      "intro": [],
      "people": [
        "akari",
        "mio"
      ],
      "required": [
        "p1-missing",
        "p1-morning",
        "p1-contact",
        "p1-workplace",
        "p1-company-answer",
        "p1-searched",
        "p1-police"
      ],
      "ask": [
        {
          "id": "p1-missing",
          "personId": "akari",
          "label": "帰らなくなった日",
          "lines": [
            {
              "speakerId": "minato",
              "text": "いつから帰っていない？"
            },
            {
              "speakerId": "akari",
              "text": "月曜日です。五日の朝に出かけて、そのまま。今日で三日になります。"
            },
            {
              "speakerId": "mio",
              "text": "五日の朝からですね。"
            },
            {
              "speakerId": "akari",
              "text": "夜には戻ると思っていました。夕飯も残しておいたんです。"
            }
          ],
          "requires": [],
          "grants": [
            "F01"
          ],
          "required": true
        },
        {
          "id": "p1-morning",
          "personId": "akari",
          "label": "最後の朝",
          "lines": [
            {
              "speakerId": "minato",
              "text": "最後に会った時は、どんな様子だった？"
            },
            {
              "speakerId": "akari",
              "text": "普通でした。七時半ごろ、いつもの服で。"
            },
            {
              "speakerId": "akari",
              "text": "私が、帰りに牛乳を買ってくるって言ったら、頼む、って。"
            },
            {
              "speakerId": "minato",
              "text": "仕事へ行くと、兄が言ったのか？"
            },
            {
              "speakerId": "akari",
              "text": "……言っていません。いつもの時間だったので、私がそう思いました。"
            },
            {
              "speakerId": "mio",
              "text": "『いつもの時間に家を出た』と書いておきますね。"
            },
            {
              "speakerId": "akari",
              "text": "何か変なところがなかったか、何度も考えました。でも、思い出せなくて。"
            },
            {
              "speakerId": "minato",
              "text": "覚えているところまででいい。"
            }
          ],
          "requires": [],
          "grants": [
            "F02",
            "morning"
          ],
          "required": true
        },
        {
          "id": "p1-contact",
          "personId": "akari",
          "label": "連絡",
          "lines": [
            {
              "speakerId": "minato",
              "text": "兄に連絡は取れたか？"
            },
            {
              "speakerId": "akari",
              "text": "電話もメッセージも、返ってきません。月曜日の夜からです。"
            },
            {
              "speakerId": "akari",
              "text": "最初は『遅いの？』って。そのあと、『どこにいるの』ばかり送ってしまって。"
            },
            {
              "speakerId": "akari",
              "text": "最後は、何でもいいから返してって。"
            },
            {
              "speakerId": "narrator",
              "text": "鞄から出したスマホを、あかりは裏返して膝に置いた。"
            },
            {
              "speakerId": "mio",
              "text": "連絡を試したことは分かりました。送った言葉を、ここで責めなくて大丈夫ですよ。"
            }
          ],
          "requires": [],
          "grants": [
            "F03",
            "contact"
          ],
          "required": true
        },
        {
          "id": "p1-workplace",
          "personId": "akari",
          "label": "勤務先",
          "lines": [
            {
              "speakerId": "minato",
              "text": "勤務先を教えてくれ。"
            },
            {
              "speakerId": "akari",
              "text": "東成ビルサービスです。ビルの管理や修繕の仕事をしています。"
            },
            {
              "speakerId": "mio",
              "text": "会社の連絡先は分かりますか？"
            },
            {
              "speakerId": "akari",
              "text": "はい。火曜日に電話した番号があります。"
            }
          ],
          "requires": [],
          "grants": [
            "F04"
          ],
          "required": true
        },
        {
          "id": "p1-company-answer",
          "personId": "akari",
          "label": "会社へ聞いたこと",
          "lines": [
            {
              "speakerId": "minato",
              "text": "会社からは、何と言われた？"
            },
            {
              "speakerId": "akari",
              "text": "その日から来ていないと。月曜日のことです。"
            },
            {
              "speakerId": "akari",
              "text": "仕事に行ったはずですって言ったんですけど、担当の方がいなくて分からないと。"
            },
            {
              "speakerId": "mio",
              "text": "そのお電話では、勤務の記録までは確認できなかったんですね。"
            },
            {
              "speakerId": "akari",
              "text": "はい。私も、何を聞けばいいか分からなくなって。"
            },
            {
              "speakerId": "minato",
              "text": "会社には、こちらから確かめる。"
            }
          ],
          "requires": [
            "F04"
          ],
          "grants": [
            "F05",
            "workplace"
          ],
          "required": true
        },
        {
          "id": "p1-searched",
          "personId": "akari",
          "label": "ほかに捜したところ",
          "lines": [
            {
              "speakerId": "minato",
              "text": "ほかに、誰かへ聞いたか？"
            },
            {
              "speakerId": "akari",
              "text": "思いつく人には。でも、誰も知りませんでした。警察にも相談しました。"
            }
          ],
          "requires": [
            "F03"
          ],
          "grants": [
            "F06a"
          ],
          "required": true
        },
        {
          "id": "p1-police",
          "personId": "akari",
          "label": "警察への相談",
          "lines": [
            {
              "speakerId": "minato",
              "text": "警察へ相談して、その後どうなった？"
            },
            {
              "speakerId": "akari",
              "text": "事件に巻き込まれたかは分からないと。まだ、兄の居場所は分からなくて。"
            },
            {
              "speakerId": "akari",
              "text": "私、自分でも何かしないと。待っているだけじゃ……。"
            },
            {
              "speakerId": "minato",
              "text": "ここへ来たのも、そのためだな。"
            },
            {
              "speakerId": "akari",
              "text": "はい。"
            }
          ],
          "requires": [
            "F06a"
          ],
          "grants": [
            "F06",
            "police-consulted"
          ],
          "required": true
        },
        {
          "id": "p1-age",
          "personId": "akari",
          "label": "兄の年齢",
          "lines": [
            {
              "speakerId": "minato",
              "text": "兄は、いくつだ？"
            },
            {
              "speakerId": "akari",
              "text": "二十九です。私とは八つ違います。"
            }
          ],
          "requires": [],
          "grants": [
            "known-naoto-age"
          ],
          "required": false
        },
        {
          "id": "p1-daily",
          "personId": "akari",
          "label": "普段の連絡",
          "lines": [
            {
              "speakerId": "minato",
              "text": "普段も、連絡を忘れることはあるか？"
            },
            {
              "speakerId": "akari",
              "text": "遅くなる時は必ず。短いんですけど、『先に食べて』とか？"
            },
            {
              "speakerId": "akari",
              "text": "私が返すのを忘れると、朝、何も言わずにスマホを指して。"
            },
            {
              "speakerId": "narrator",
              "text": "少し笑いかけた顔が、すぐ元へ戻った。"
            },
            {
              "speakerId": "akari",
              "text": "あの時は、細かいなって思ってました。"
            }
          ],
          "requires": [
            "F03"
          ],
          "grants": [
            "naoto-daily"
          ],
          "required": false
        },
        {
          "id": "p1-family",
          "personId": "akari",
          "label": "一緒に暮らす家族",
          "lines": [
            {
              "speakerId": "minato",
              "text": "家では、兄と二人か？"
            },
            {
              "speakerId": "akari",
              "text": "はい。両親はもういません。"
            },
            {
              "speakerId": "akari",
              "text": "兄は、仕事のことを家であまり話さないので。会社での知り合いも、私はほとんど。"
            },
            {
              "speakerId": "minato",
              "text": "知らないことまで答えなくていい。"
            }
          ],
          "requires": [],
          "grants": [
            "akari-family"
          ],
          "required": false
        }
      ],
      "speak": [],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P1-04",
        "requires": [
          "F01",
          "F02",
          "morning",
          "F03",
          "contact",
          "F04",
          "F05",
          "workplace",
          "F06a",
          "F06",
          "police-consulted"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P1-04",
      "part": 1,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-08T11:30:00",
      "intro": [],
      "people": [
        "mio",
        "akari"
      ],
      "required": [
        "p1-think"
      ],
      "ask": [],
      "speak": [],
      "inspect": [],
      "think": [
        {
          "id": "p1-think",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "五日の朝、家を出た。連絡は途絶えた。会社では出勤を確認できていない。"
            },
            {
              "speakerId": "narrator",
              "text": "出勤したはずだというのは、妹の認識だ。会社が見ているのは、その日に来たかどうか。"
            },
            {
              "speakerId": "narrator",
              "text": "間にある本人の予定は、まだ分からない。そこから確かめる。"
            }
          ],
          "requires": [
            "F01",
            "F02",
            "F03",
            "F04",
            "F05",
            "F06"
          ],
          "grants": [
            "F07",
            "I01"
          ],
          "required": true
        }
      ],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P1-05",
        "requires": [
          "F07",
          "I01"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P1-05",
      "part": 1,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-08T11:35:00",
      "intro": [],
      "people": [
        "akari",
        "mio"
      ],
      "required": [
        "p1-accept",
        "p1-photo",
        "p1-client-contact"
      ],
      "ask": [
        {
          "id": "p1-photo",
          "personId": "akari",
          "label": "兄の写真",
          "lines": [
            {
              "speakerId": "mio",
              "text": "お兄さんのお写真をお持ちですか？"
            },
            {
              "speakerId": "akari",
              "text": "はい。最近のものを、持ってきました。"
            },
            {
              "speakerId": "narrator",
              "text": "透明な袋から、あかりが写真を抜いた。角を曲げないよう、両手で置く。"
            },
            {
              "speakerId": "minato",
              "text": "今も、この髪型か？"
            },
            {
              "speakerId": "akari",
              "text": "はい。仕事の帰りは、だいたいこの顔です。少し疲れて見えますけど。"
            },
            {
              "speakerId": "minato",
              "text": "捜す時に使わせてもらう。大切に預かる。"
            }
          ],
          "requires": [
            "F08"
          ],
          "grants": [
            "IT01",
            "search-photo"
          ],
          "required": true
        },
        {
          "id": "p1-client-contact",
          "personId": "akari",
          "label": "連絡先",
          "lines": [
            {
              "speakerId": "mio",
              "text": "ご連絡先をお預かりしてもよろしいでしょうか？"
            },
            {
              "speakerId": "akari",
              "text": "はい。"
            },
            {
              "speakerId": "narrator",
              "text": "澪は番号を一桁ずつ読み返した。"
            },
            {
              "speakerId": "mio",
              "text": "分かったことがあれば、こちらからご連絡します。"
            },
            {
              "speakerId": "minato",
              "text": "兄から連絡があった時も、教えてくれ。"
            },
            {
              "speakerId": "akari",
              "text": "分かりました。電話、持っておきます。"
            }
          ],
          "requires": [
            "IT01"
          ],
          "grants": [
            "F09",
            "akari-contact"
          ],
          "required": true
        }
      ],
      "speak": [
        {
          "id": "p1-accept",
          "personId": "akari",
          "label": "調査の進め方",
          "lines": [
            {
              "speakerId": "minato",
              "text": "まず会社で、兄の予定を確かめる。行き先が分かれば、そこから足取りを追う。"
            },
            {
              "speakerId": "akari",
              "text": "お願いします。料金は、どのくらい……。"
            },
            {
              "speakerId": "narrator",
              "text": "財布を出しかけて、彼女は手を止めた。"
            },
            {
              "speakerId": "akari",
              "text": "私の貯金で、どこまでお願いできますか？"
            },
            {
              "speakerId": "narrator",
              "text": "俺は紙に書いて、彼女へ向けた。"
            },
            {
              "speakerId": "minato",
              "text": "最初の調査なら、これくらいだ。"
            },
            {
              "speakerId": "akari",
              "text": "……お願いします。"
            },
            {
              "speakerId": "minato",
              "text": "今、答えを急がなくてもいい。"
            },
            {
              "speakerId": "akari",
              "text": "兄がどこにいるか、知りたいんです。"
            },
            {
              "speakerId": "minato",
              "text": "分かった。引き受ける。"
            }
          ],
          "requires": [
            "F07"
          ],
          "grants": [
            "F08",
            "request_accepted"
          ],
          "required": true
        },
        {
          "id": "p1-return-home",
          "personId": "akari",
          "label": "帰ってきたら",
          "lines": [
            {
              "speakerId": "akari",
              "text": "怒る言葉は、いっぱい考えました。でも、今は……。"
            },
            {
              "speakerId": "minato",
              "text": "まず、顔を見たいか？"
            },
            {
              "speakerId": "akari",
              "text": "はい。そうしたら、何を言うか分かる気がします。"
            },
            {
              "speakerId": "mio",
              "text": "その時のために、まず捜しましょう。"
            }
          ],
          "requires": [
            "F09"
          ],
          "grants": [
            "optional-return-home"
          ],
          "required": false
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P1-06",
        "requires": [
          "F08",
          "request_accepted",
          "IT01",
          "search-photo",
          "F09",
          "akari-contact"
        ]
      },
      "ending": [
        {
          "speakerId": "narrator",
          "text": "澪が扉まで見送った。階段へ消える靴音を、俺は席で聞いていた。"
        }
      ],
      "organize": []
    },
    {
      "id": "P1-06",
      "part": 1,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-08T11:55:00",
      "intro": [],
      "people": [
        "mio"
      ],
      "required": [
        "p1-inspect-photo",
        "p1-company-call",
        "p1-mio-role"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p1-company-call",
          "personId": "mio",
          "label": "会社への連絡",
          "lines": [
            {
              "speakerId": "minato",
              "text": "東成ビルサービスへ、先に連絡を頼めるか？"
            },
            {
              "speakerId": "mio",
              "text": "はい。妹さんから依頼を受けたことと、勤務の確認をお願いしたいと伝えます。"
            },
            {
              "speakerId": "narrator",
              "text": "澪が電話をかけた。こちらの身分と目的を伝え、相手の返事を待つ。"
            },
            {
              "speakerId": "mio",
              "text": "受付で、調査の件とおっしゃってください。担当の方へ取り次いでくださるそうです。"
            },
            {
              "speakerId": "minato",
              "text": "助かる。"
            }
          ],
          "requires": [
            "F10"
          ],
          "grants": [
            "F11",
            "mentioned-company-reception"
          ],
          "required": true
        },
        {
          "id": "p1-mio-role",
          "personId": "mio",
          "label": "留守中の対応",
          "lines": [
            {
              "speakerId": "minato",
              "text": "俺は会社へ行く。ここは任せる。"
            },
            {
              "speakerId": "mio",
              "text": "あかりさんからのご連絡をお受けします。佐伯さんも、分かったことを知らせてください。"
            },
            {
              "speakerId": "minato",
              "text": "ああ。帰ってから、記録をそろえよう。"
            },
            {
              "speakerId": "mio",
              "text": "古い出来事につながったら、以前の記録も確認しておきます。"
            }
          ],
          "requires": [
            "F11"
          ],
          "grants": [
            "F12",
            "part1_completed"
          ],
          "required": true
        },
        {
          "id": "p1-client-mood",
          "personId": "mio",
          "label": "あかりの様子",
          "lines": [
            {
              "speakerId": "mio",
              "text": "お茶を持つ手が、最後には少しほどけていました。"
            },
            {
              "speakerId": "minato",
              "text": "結果は、まだ何も出ていない。"
            },
            {
              "speakerId": "mio",
              "text": "はい。でも、お一人で全部説明しなくてよくなった。それだけでも、違うと思います。"
            },
            {
              "speakerId": "minato",
              "text": "その先を、確かめてくる。"
            }
          ],
          "requires": [
            "F11"
          ],
          "grants": [
            "optional-client-mood"
          ],
          "required": false
        }
      ],
      "inspect": [
        {
          "id": "p1-inspect-photo",
          "label": "机の写真",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "写真の中の直人は、まっすぐこちらを見ている。あかりが知っている、いつもの兄の顔だ。"
            },
            {
              "speakerId": "narrator",
              "text": "写っていない事情まで、ここから読もうとしてはいけない。"
            }
          ],
          "requires": [
            "IT01"
          ],
          "grants": [
            "F10"
          ],
          "required": true
        }
      ],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P2-01",
        "requires": [
          "F10",
          "F11",
          "mentioned-company-reception",
          "F12",
          "part1_completed"
        ]
      },
      "ending": [
        {
          "speakerId": "narrator",
          "text": "俺は写真を内ポケットへ入れた。澪は預かった連絡先を、電話の横に置く。"
        },
        {
          "speakerId": "narrator",
          "text": "会社へ行けば兄が見つかるとは限らない。それでも、最初に確かめる場所は決まった。"
        }
      ],
      "organize": []
    },
    {
      "id": "P2-01",
      "part": 2,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-08T12:00:00",
      "intro": [
        {
          "speakerId": "mio",
          "text": "受付へは、お話を通してあります。"
        },
        {
          "speakerId": "minato",
          "text": "写真も持った。行ってくる。"
        },
        {
          "speakerId": "mio",
          "text": "いってらっしゃいませ。"
        }
      ],
      "people": [
        "mio"
      ],
      "required": [
        "p2-depart"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p2-depart",
          "personId": "mio",
          "label": "会社へ向かう",
          "lines": [
            {
              "speakerId": "minato",
              "text": "行ってくる。"
            }
          ],
          "requires": [
            "F12"
          ],
          "grants": [
            "p2-departed"
          ],
          "required": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "外に出る",
        "nextSceneId": "P2-02-EXT",
        "requires": [
          "p2-departed"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P2-02-EXT",
      "part": 2,
      "locationId": "company",
      "roomId": "company-exterior",
      "sceneTime": "2026-10-08T12:20:00",
      "intro": [],
      "people": [],
      "required": [],
      "ask": [],
      "speak": [],
      "inspect": [
        {
          "id": "p2-company-sign",
          "label": "会社の表示",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "東成ビルサービス。住所は澪が確認したものと一致する。"
            }
          ],
          "requires": [],
          "grants": [
            "company-address-confirmed"
          ],
          "required": false
        }
      ],
      "think": [],
      "exit": {
        "label": "受付",
        "nextSceneId": "P2-02",
        "requires": []
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P2-02",
      "part": 2,
      "locationId": "company",
      "roomId": "company-reception",
      "sceneTime": "2026-10-08T12:25:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "小さなカウンターの向こうで、電話の受話器が戻された。まだ、こちらへ声はかかっていない。"
        }
      ],
      "people": [
        "company-reception"
      ],
      "required": [
        "p2-reception-exists",
        "p2-reception-purpose",
        "p2-work-record",
        "p2-appointment",
        "p2-arrange-kuroda"
      ],
      "ask": [
        {
          "id": "p2-work-record",
          "personId": "company-reception",
          "label": "勤務の記録",
          "lines": [
            {
              "speakerId": "minato",
              "text": "五日の勤務記録を、確認してもらえるか？"
            },
            {
              "speakerId": "company-reception",
              "text": "少々お待ちください。"
            },
            {
              "speakerId": "narrator",
              "text": "端末を確認する間、壁の案内を見る。管理、清掃、修繕。直人の一日は、この中のどこかにあった。"
            },
            {
              "speakerId": "company-reception",
              "text": "その日は、休暇を取っています。私用、とあります。"
            },
            {
              "speakerId": "minato",
              "text": "事前に申請したものか？"
            },
            {
              "speakerId": "company-reception",
              "text": "はい。その後は欠勤が続いていて、会社からも連絡がつきません。"
            },
            {
              "speakerId": "minato",
              "text": "妹さんへの『来ていない』という回答には、休暇も含まれていたんだな。"
            },
            {
              "speakerId": "company-reception",
              "text": "はい。あの時、窓口ではそこまで確認できなくて。"
            }
          ],
          "requires": [
            "F13"
          ],
          "grants": [
            "F14"
          ],
          "required": true
        },
        {
          "id": "p2-appointment",
          "personId": "company-reception",
          "label": "当日の予定",
          "lines": [
            {
              "speakerId": "minato",
              "text": "休暇の日に、社内の誰かと会う予定はあったか？"
            },
            {
              "speakerId": "company-reception",
              "text": "黒田部長へ、面会を頼んでいました。",
              "grants": [
                "mentioned-kuroda",
                "known-kuroda-title"
              ]
            },
            {
              "speakerId": "minato",
              "text": "その面会は、どこで行う予定だった。"
            },
            {
              "speakerId": "company-reception",
              "text": "こちらです。部長の予定にも入っています。"
            }
          ],
          "requires": [
            "F14"
          ],
          "grants": [
            "F15",
            "I02",
            "mentioned-kuroda",
            "known-kuroda-title"
          ],
          "required": true
        },
        {
          "id": "p2-old-office",
          "personId": "company-reception",
          "label": "古い事務所",
          "lines": [
            {
              "speakerId": "minato",
              "text": "高瀬は普段、どんな作業をしていた。"
            },
            {
              "speakerId": "company-reception",
              "text": "現場に出ています。最近は、古い事務所の片づけも。"
            },
            {
              "speakerId": "minato",
              "text": "古い事務所は、どこだ？"
            },
            {
              "speakerId": "company-reception",
              "text": "成子坂共同ビルです。取り壊しが決まったので。"
            }
          ],
          "requires": [
            "F15"
          ],
          "grants": [
            "optional-old-office"
          ],
          "required": false
        }
      ],
      "speak": [
        {
          "id": "p2-reception-purpose",
          "personId": "company-reception",
          "label": "訪問の用件",
          "lines": [
            {
              "speakerId": "minato",
              "text": "佐伯だ。先ほど、相澤から電話をした。"
            },
            {
              "speakerId": "company-reception",
              "text": "高瀬さんの調査の件ですね。こちらでお待ちください。"
            },
            {
              "speakerId": "minato",
              "text": "妹さんから、捜索の依頼を受けている。"
            },
            {
              "speakerId": "company-reception",
              "text": "妹さんから昨日もお電話がありました。まだ、連絡がつかないんですね。"
            }
          ],
          "requires": [
            "recognized-company-reception"
          ],
          "grants": [
            "F13"
          ],
          "required": true
        },
        {
          "id": "p2-arrange-kuroda",
          "personId": "company-reception",
          "label": "部長への取次ぎ",
          "lines": [
            {
              "speakerId": "minato",
              "text": "黒田部長に、面会を申し入れたい。"
            },
            {
              "speakerId": "company-reception",
              "text": "確認します。少し、お時間をいただけますか？"
            },
            {
              "speakerId": "narrator",
              "text": "内線の声は聞き取れなかった。受話器を置いた担当者が立つ。"
            },
            {
              "speakerId": "company-reception",
              "text": "お話しできるそうです。応接室へどうぞ。"
            }
          ],
          "requires": [
            "F15"
          ],
          "grants": [
            "F16"
          ],
          "required": true
        }
      ],
      "inspect": [
        {
          "id": "p2-reception-exists",
          "label": "受付カウンター",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "社員証を下げた人が席にいる。受付担当だ。"
            }
          ],
          "requires": [],
          "grants": [
            "recognized-company-reception",
            "met-company-reception"
          ],
          "required": true
        }
      ],
      "think": [],
      "exit": {
        "label": "応接室",
        "nextSceneId": "P2-03",
        "requires": [
          "recognized-company-reception",
          "met-company-reception",
          "F13",
          "F14",
          "F15",
          "I02",
          "mentioned-kuroda",
          "known-kuroda-title",
          "F16"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P2-03",
      "part": 2,
      "locationId": "company",
      "roomId": "company-lounge",
      "sceneTime": "2026-10-08T12:45:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "応接室へ案内された。"
        },
        {
          "speakerId": "narrator",
          "text": "入室を促されたあと、黒田が席から立った。"
        },
        {
          "speakerId": "kuroda",
          "text": "業務部長の黒田征司です。",
          "grants": [
            "met-kuroda",
            "named-kuroda"
          ]
        },
        {
          "speakerId": "minato",
          "text": "佐伯だ。高瀬さんの妹から依頼を受けている。"
        },
        {
          "speakerId": "narrator",
          "text": "名刺を渡す。黒田は肩書を確かめ、机の端へ置いた。"
        }
      ],
      "people": [
        "kuroda"
      ],
      "required": [
        "p2-photo-kuroda",
        "p2-kuroda-meeting",
        "p2-naoto-demand",
        "p2-accident-explanation",
        "p2-after-meeting",
        "p2-building-work"
      ],
      "ask": [
        {
          "id": "p2-kuroda-meeting",
          "personId": "kuroda",
          "label": "直人との面会",
          "lines": [
            {
              "speakerId": "minato",
              "text": "五日に、どんな話をした？"
            },
            {
              "speakerId": "kuroda",
              "text": "昔の事故です。もう終わったことを、急に持ち出しまして。"
            },
            {
              "speakerId": "minato",
              "text": "どの事故だ。"
            },
            {
              "speakerId": "kuroda",
              "text": "成子坂共同ビルで、三崎という社員が亡くなった件です。",
              "grants": [
                "mentioned-misaki"
              ]
            }
          ],
          "requires": [
            "F17"
          ],
          "grants": [
            "F18",
            "mentioned-misaki"
          ],
          "required": true
        },
        {
          "id": "p2-naoto-demand",
          "personId": "kuroda",
          "label": "直人が求めたこと",
          "lines": [
            {
              "speakerId": "minato",
              "text": "高瀬は、何を求めた？"
            },
            {
              "speakerId": "kuroda",
              "text": "本当のことを話してほしい、と。意味が分からない。"
            },
            {
              "speakerId": "kuroda",
              "text": "彼は当時、何も見ていないと答えています。"
            },
            {
              "speakerId": "minato",
              "text": "その話を、今になって持ち出したのか？"
            },
            {
              "speakerId": "kuroda",
              "text": "そうです。"
            }
          ],
          "requires": [
            "F18"
          ],
          "grants": [
            "F19"
          ],
          "required": true
        },
        {
          "id": "p2-accident-explanation",
          "personId": "kuroda",
          "label": "当時の説明",
          "lines": [
            {
              "speakerId": "minato",
              "text": "事故は、どう説明されていた。"
            },
            {
              "speakerId": "kuroda",
              "text": "階段で足を滑らせた事故です。私もその日は現場にいませんでした。"
            },
            {
              "speakerId": "minato",
              "text": "現場には行っていない、という説明だな。"
            },
            {
              "speakerId": "kuroda",
              "text": "はい。"
            }
          ],
          "requires": [
            "F18"
          ],
          "grants": [
            "F20",
            "I03"
          ],
          "required": true
        },
        {
          "id": "p2-after-meeting",
          "personId": "kuroda",
          "label": "面会後の行き先",
          "lines": [
            {
              "speakerId": "minato",
              "text": "面会のあと、高瀬はどこへ向かった。"
            },
            {
              "speakerId": "kuroda",
              "text": "知りません。こちらが聞きたいくらいです。"
            },
            {
              "speakerId": "minato",
              "text": "妹が捜している。"
            },
            {
              "speakerId": "kuroda",
              "text": "帰るように言ってください。仕事を放り出してもらっては困ります。"
            }
          ],
          "requires": [
            "F19"
          ],
          "grants": [
            "F21"
          ],
          "required": true
        },
        {
          "id": "p2-building-work",
          "personId": "kuroda",
          "label": "ビルの片づけ",
          "lines": [
            {
              "speakerId": "minato",
              "text": "高瀬は、旧ビルの片づけをしていたのか？"
            },
            {
              "speakerId": "kuroda",
              "text": "ええ。取り壊しまでに、残った書類を確認する仕事です。"
            },
            {
              "speakerId": "minato",
              "text": "今も入れるか？"
            },
            {
              "speakerId": "kuroda",
              "text": "入口に管理人がいます。そちらで聞いてください。"
            }
          ],
          "requires": [
            "F18"
          ],
          "grants": [
            "F22",
            "mentioned-miyahara"
          ],
          "required": true
        },
        {
          "id": "p2-misaki-work",
          "personId": "kuroda",
          "label": "三崎の仕事",
          "lines": [
            {
              "speakerId": "kuroda",
              "text": "熱心でした。ただ、何でも抱え込むところがあった。"
            },
            {
              "speakerId": "minato",
              "text": "高瀬もそうだと？"
            },
            {
              "speakerId": "kuroda",
              "text": "……似たところはあります。"
            }
          ],
          "requires": [
            "F18"
          ],
          "grants": [
            "optional-misaki-work"
          ],
          "required": false
        }
      ],
      "speak": [
        {
          "id": "p2-photo-kuroda",
          "personId": "kuroda",
          "label": "直人の写真を見せる",
          "lines": [
            {
              "speakerId": "minato",
              "text": "捜しているのは、この高瀬直人だ。"
            },
            {
              "speakerId": "kuroda",
              "text": "ええ。高瀬君です。"
            }
          ],
          "requires": [
            "IT01",
            "met-kuroda"
          ],
          "grants": [
            "F17"
          ],
          "required": true,
          "interaction": "item-use",
          "itemId": "IT01"
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "受付",
        "nextSceneId": "P2-03-EXIT",
        "requires": [
          "met-kuroda",
          "named-kuroda",
          "F17",
          "F18",
          "mentioned-misaki",
          "F19",
          "F20",
          "I03",
          "F21",
          "F22",
          "mentioned-miyahara"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P2-03-EXIT",
      "part": 2,
      "locationId": "company",
      "roomId": "company-reception",
      "sceneTime": "2026-10-08T13:05:00",
      "intro": [],
      "people": [
        "company-reception"
      ],
      "required": [],
      "ask": [],
      "speak": [],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "外に出る",
        "nextSceneId": "P2-04",
        "requires": []
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P2-04",
      "part": 2,
      "locationId": "building",
      "roomId": "building-exterior",
      "sceneTime": "2026-10-08T13:20:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "外された看板の跡だけ、壁の色が薄い。入口に、取り壊しの掲示がある。"
        }
      ],
      "people": [
        "miyahara"
      ],
      "required": [
        "p2-demolition",
        "p2-manager-exists",
        "p2-manager-introduce",
        "p2-photo-miyahara",
        "p2-naoto-sighting",
        "p2-relay-contact"
      ],
      "ask": [
        {
          "id": "p2-naoto-sighting",
          "personId": "miyahara",
          "label": "昨日の様子",
          "lines": [
            {
              "speakerId": "minato",
              "text": "昨日は、何をしに来た？"
            },
            {
              "speakerId": "miyahara",
              "text": "昔の書類を確かめたいと。随分、疲れた顔でした。"
            },
            {
              "speakerId": "minato",
              "text": "怪我は見えたか？"
            },
            {
              "speakerId": "miyahara",
              "text": "見たところはありません。"
            },
            {
              "speakerId": "minato",
              "text": "妹が、帰りを待っている。"
            },
            {
              "speakerId": "miyahara",
              "text": "……そうでしたか？"
            }
          ],
          "requires": [
            "F25"
          ],
          "grants": [
            "F26"
          ],
          "required": true
        }
      ],
      "speak": [
        {
          "id": "p2-manager-introduce",
          "personId": "miyahara",
          "label": "訪問の用件",
          "lines": [
            {
              "speakerId": "minato",
              "text": "この建物の管理をされている方か？"
            },
            {
              "speakerId": "miyahara",
              "text": "はい。会社なら、もう移っていますよ。"
            },
            {
              "speakerId": "minato",
              "text": "佐伯という探偵だ。高瀬直人の足取りを調べている。"
            },
            {
              "speakerId": "miyahara",
              "text": "宮原です。ここを管理しています。",
              "grants": [
                "met-miyahara",
                "mentioned-miyahara"
              ]
            },
            {
              "speakerId": "narrator",
              "text": "渡された管理連絡票には、宮原文雄とあった。",
              "grants": [
                "named-miyahara"
              ]
            }
          ],
          "requires": [
            "recognized-miyahara"
          ],
          "grants": [
            "F24",
            "met-miyahara",
            "named-miyahara"
          ],
          "required": true
        },
        {
          "id": "p2-photo-miyahara",
          "personId": "miyahara",
          "label": "直人の写真を見せる",
          "lines": [
            {
              "speakerId": "miyahara",
              "text": "高瀬君です。昨日、来ましたよ。"
            },
            {
              "speakerId": "minato",
              "text": "この人で、間違いないか？"
            },
            {
              "speakerId": "miyahara",
              "text": "ええ。昔から知っています。"
            }
          ],
          "requires": [
            "IT01",
            "F24"
          ],
          "grants": [
            "F25",
            "I04-sighting"
          ],
          "required": true,
          "interaction": "item-use",
          "itemId": "IT01"
        },
        {
          "id": "p2-relay-contact",
          "personId": "miyahara",
          "label": "連絡を届ける",
          "lines": [
            {
              "speakerId": "minato",
              "text": "本人へ、連絡を届けられるか？"
            },
            {
              "speakerId": "miyahara",
              "text": "連絡先は預かっています。でも、誰にも教えないでくれと言われて。"
            },
            {
              "speakerId": "minato",
              "text": "教えなくていい。あかりさんから依頼を受けた佐伯が、会って話したいと伝えてくれ。"
            },
            {
              "speakerId": "narrator",
              "text": "俺は事務所の番号を書いた名刺を渡す。"
            },
            {
              "speakerId": "miyahara",
              "text": "本人から、こちらへ連絡してもらいます。"
            }
          ],
          "requires": [
            "F25"
          ],
          "grants": [
            "F27"
          ],
          "required": true
        }
      ],
      "inspect": [
        {
          "id": "p2-demolition",
          "label": "掲示",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "取り壊しは、10月10日（土）着手予定だ。"
            }
          ],
          "requires": [],
          "grants": [
            "F23",
            "demolition-date"
          ],
          "required": true
        },
        {
          "id": "p2-manager-exists",
          "label": "入口",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "腕章をつけた人が扉を確認している。管理人らしい。"
            }
          ],
          "requires": [],
          "grants": [
            "recognized-miyahara"
          ],
          "required": true
        }
      ],
      "think": [],
      "exit": {
        "label": "管理人室",
        "nextSceneId": "P2-05",
        "requires": [
          "F23",
          "demolition-date",
          "recognized-miyahara",
          "F24",
          "met-miyahara",
          "named-miyahara",
          "F25",
          "I04-sighting",
          "F26",
          "F27"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P2-05",
      "part": 2,
      "locationId": "building",
      "roomId": "building-manager-room",
      "sceneTime": "2026-10-08T13:30:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "机の横には、鍵札が並んでいた。古い日誌の上に、今日の予定表が重なる。"
        },
        {
          "speakerId": "miyahara",
          "text": "少し待ってください。先に、連絡をしてみます。"
        },
        {
          "speakerId": "narrator",
          "text": "宮原が直人の預けた番号へ電話する。取り次ぎを頼んだあと、本人からの返事を待つ。"
        }
      ],
      "people": [
        "miyahara"
      ],
      "required": [
        "p2-past-incident",
        "p2-journal",
        "p2-preserve-journal",
        "p2-document-permission",
        "p2-envelope"
      ],
      "ask": [
        {
          "id": "p2-past-incident",
          "personId": "miyahara",
          "label": "過去事故",
          "lines": [
            {
              "speakerId": "minato",
              "text": "三崎さんの事故について、覚えているか？"
            },
            {
              "speakerId": "miyahara",
              "text": "はい。二年前の十月です。ここの階段で。"
            },
            {
              "speakerId": "minato",
              "text": "三崎さんの、お名前は？"
            },
            {
              "speakerId": "miyahara",
              "text": "三崎健です。",
              "grants": [
                "named-misaki"
              ]
            }
          ],
          "requires": [
            "F18",
            "F27"
          ],
          "grants": [
            "F28",
            "named-misaki"
          ],
          "required": true
        },
        {
          "id": "p2-building-life",
          "personId": "miyahara",
          "label": "建物の日常",
          "lines": [
            {
              "speakerId": "miyahara",
              "text": "朝は、階段の音で誰が来たか分かるくらいでした。"
            },
            {
              "speakerId": "miyahara",
              "text": "高瀬君は急いで上がって、三崎さんは必ず挨拶して。私がいない時でも、管理人室へ一言。"
            },
            {
              "speakerId": "minato",
              "text": "長い付き合いだったんだな。"
            },
            {
              "speakerId": "miyahara",
              "text": "ええ。いなくなった人のことまで、建物と一緒に片づけていいのか。最近、そればかりで。"
            }
          ],
          "requires": [
            "F28"
          ],
          "grants": [
            "optional-building-life"
          ],
          "required": false
        }
      ],
      "speak": [
        {
          "id": "p2-preserve-journal",
          "personId": "miyahara",
          "label": "記録の保存",
          "lines": [
            {
              "speakerId": "minato",
              "text": "日誌は、警察が確認するまで残してもらえるか？"
            },
            {
              "speakerId": "miyahara",
              "text": "分かりました。これは捨てません。"
            }
          ],
          "requires": [
            "E01"
          ],
          "grants": [
            "F29"
          ],
          "required": true
        },
        {
          "id": "p2-document-permission",
          "personId": "miyahara",
          "label": "本人からの返答",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "電話が鳴る。宮原が直人へ伝言内容を確認。"
            },
            {
              "speakerId": "miyahara",
              "text": "預かった書類は、見せていいそうです。ご本人から佐伯さんへ電話すると。"
            },
            {
              "speakerId": "minato",
              "text": "分かった。ここで会っていることも伝えてくれたか？"
            },
            {
              "speakerId": "miyahara",
              "text": "はい。事務所の番号を渡しました。"
            }
          ],
          "requires": [
            "F29"
          ],
          "grants": [
            "F30"
          ],
          "required": true
        }
      ],
      "inspect": [
        {
          "id": "p2-journal",
          "personId": null,
          "label": "日誌",
          "lines": [
            {
              "speakerId": "minato",
              "text": "その日の記録を、見せてもらえるか？"
            },
            {
              "speakerId": "miyahara",
              "text": "残っています。処分の前でよかった。"
            },
            {
              "speakerId": "narrator",
              "text": "宮原が開いたページを読む。十月の日付の下に、黒田部長への旧事務室の鍵の貸出。返却欄は空白だった。"
            },
            {
              "speakerId": "minato",
              "text": "返却がないのは、どういう時だ。"
            },
            {
              "speakerId": "miyahara",
              "text": "遅くなると、翌朝返すこともありました。"
            },
            {
              "speakerId": "minato",
              "text": "この日の貸出は、覚えているか？"
            },
            {
              "speakerId": "miyahara",
              "text": "ええ。あの日のことは、忘れられません。"
            }
          ],
          "requires": [
            "F28"
          ],
          "grants": [
            "E01",
            "IT02"
          ],
          "required": true
        },
        {
          "id": "p2-envelope",
          "personId": null,
          "label": "預かった封筒",
          "lines": [
            {
              "speakerId": "miyahara",
              "text": "捨てないでほしいと、昨日預かりました。"
            },
            {
              "speakerId": "narrator",
              "text": "三崎の報告書の控えだった。負傷した社員について、人員不足と作業指示の確認を求めている。書き直した跡が多い。"
            },
            {
              "speakerId": "minato",
              "text": "会社の説明と、違う原因を確かめようとしたのか？"
            },
            {
              "speakerId": "miyahara",
              "text": "会社は、本人の不注意だと言っていました。"
            },
            {
              "speakerId": "minato",
              "text": "三崎さんの時も、同じ説明だった。"
            },
            {
              "speakerId": "miyahara",
              "text": "ええ。"
            }
          ],
          "requires": [
            "F30"
          ],
          "grants": [
            "E03",
            "IT03"
          ],
          "required": true
        }
      ],
      "think": [],
      "exit": {
        "label": "階段",
        "nextSceneId": "P2-06",
        "requires": [
          "F28",
          "named-misaki",
          "E01",
          "IT02",
          "F29",
          "F30",
          "E03",
          "IT03"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P2-06",
      "part": 2,
      "locationId": "building",
      "roomId": "building-stairs",
      "sceneTime": "2026-10-08T13:50:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "宮原に案内してもらう。下階の戸口から踊り場は見えるが、上の戸口の奥は壁と扉に隠れていた。"
        }
      ],
      "people": [
        "miyahara"
      ],
      "required": [
        "p2-lower-door",
        "p2-landing",
        "p2-upper-door",
        "p2-manager-position"
      ],
      "ask": [
        {
          "id": "p2-manager-position",
          "personId": "miyahara",
          "label": "当時の立ち位置",
          "lines": [
            {
              "speakerId": "minato",
              "text": "事故の時、どこにいた？"
            },
            {
              "speakerId": "miyahara",
              "text": "下の戸口です。物音がして、三崎さんが倒れていました。"
            },
            {
              "speakerId": "minato",
              "text": "物音の前に、何が見えた？"
            },
            {
              "speakerId": "miyahara",
              "text": "……顔は見ていません。"
            },
            {
              "speakerId": "minato",
              "text": "顔、か？"
            },
            {
              "speakerId": "miyahara",
              "text": "すみません。うまく思い出せなくて。"
            }
          ],
          "requires": [
            "p2-lower-door-known",
            "p2-landing-known",
            "p2-upper-door-known"
          ],
          "grants": [
            "F31",
            "stair-layout",
            "F32"
          ],
          "required": true
        }
      ],
      "speak": [],
      "inspect": [
        {
          "id": "p2-lower-door",
          "label": "下階の戸口",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "下階の戸口に立つと、踊り場が見える。"
            }
          ],
          "requires": [],
          "grants": [
            "p2-lower-door-known"
          ],
          "required": true
        },
        {
          "id": "p2-landing",
          "label": "踊り場",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "階段の途中に踊り場がある。"
            }
          ],
          "requires": [],
          "grants": [
            "p2-landing-known"
          ],
          "required": true
        },
        {
          "id": "p2-upper-door",
          "label": "上の戸口",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "上の戸口の奥は壁と扉の陰になる。"
            }
          ],
          "requires": [],
          "grants": [
            "p2-upper-door-known"
          ],
          "required": true
        }
      ],
      "think": [],
      "exit": {
        "label": "管理人室",
        "nextSceneId": "P2-07",
        "requires": [
          "p2-lower-door-known",
          "p2-landing-known",
          "p2-upper-door-known",
          "F31",
          "stair-layout",
          "F32"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P2-07",
      "part": 2,
      "locationId": "building",
      "roomId": "building-manager-room",
      "sceneTime": "2026-10-08T14:00:00",
      "intro": [],
      "people": [
        "miyahara"
      ],
      "required": [
        "p2-call-police"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p2-call-police",
          "personId": "okumura",
          "label": "奥村へ連絡",
          "lines": [
            {
              "speakerId": "minato",
              "text": "奥村さんへ連絡する。日誌と、過去の説明を確かめたい。"
            },
            {
              "speakerId": "narrator",
              "text": "電話をかけた。少しして、聞き慣れた低い声が返る。"
            },
            {
              "speakerId": "okumura",
              "text": "佐伯か？"
            },
            {
              "speakerId": "minato",
              "text": "妹の依頼で兄を捜している。成子坂共同ビルの事故につながった。"
            },
            {
              "speakerId": "okumura",
              "text": "何が分かった。"
            },
            {
              "speakerId": "minato",
              "text": "現場にいなかったと言う男の鍵の記録がある。日誌の写しを見てもらいたい。"
            },
            {
              "speakerId": "okumura",
              "text": "それだけで事件とは言えん。"
            },
            {
              "speakerId": "minato",
              "text": "ああ。だから当時、どう確認したのかを聞きたい。"
            },
            {
              "speakerId": "okumura",
              "text": "今なら署で時間を取れる。西新宿警察署の受付で、俺への用件と言え。"
            }
          ],
          "requires": [
            "E01",
            "F32"
          ],
          "grants": [
            "F33",
            "mentioned-okumura",
            "named-okumura"
          ],
          "required": true,
          "interaction": "phone",
          "remoteOnly": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "外に出る",
        "nextSceneId": "P2-08-EXT",
        "requires": [
          "F33",
          "mentioned-okumura",
          "named-okumura"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P2-08-EXT",
      "part": 2,
      "locationId": "police",
      "roomId": "police-exterior",
      "sceneTime": "2026-10-08T14:15:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "昼の通りに、署の標示が見えた。事件を見つけたから来たのではない。事件ではないとされた説明を、確かめに来た。"
        }
      ],
      "people": [],
      "required": [],
      "ask": [],
      "speak": [],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "受付",
        "nextSceneId": "P2-08-RECEPTION",
        "requires": []
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P2-08-RECEPTION",
      "part": 2,
      "locationId": "police",
      "roomId": "police-reception",
      "sceneTime": "2026-10-08T14:20:00",
      "intro": [],
      "people": [
        "police-reception"
      ],
      "required": [
        "p2-police-reception-exists",
        "p2-police-purpose"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p2-police-purpose",
          "personId": "police-reception",
          "label": "面会の用件",
          "lines": [
            {
              "speakerId": "minato",
              "text": "佐伯です。奥村さんと、先ほど電話で約束しました。"
            },
            {
              "speakerId": "police-reception",
              "text": "用件を伺えますか？"
            },
            {
              "speakerId": "minato",
              "text": "成子坂共同ビルの過去の事故について、記録の確認です。"
            },
            {
              "speakerId": "police-reception",
              "text": "確認します。こちらでお待ちください。"
            }
          ],
          "requires": [
            "F33",
            "recognized-police-reception"
          ],
          "grants": [
            "F34"
          ],
          "required": true
        }
      ],
      "inspect": [
        {
          "id": "p2-police-reception-exists",
          "label": "受付カウンター",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "対応している職員がいる。"
            }
          ],
          "requires": [],
          "grants": [
            "recognized-police-reception",
            "met-police-reception"
          ],
          "required": true
        }
      ],
      "think": [],
      "exit": {
        "label": "面会室",
        "nextSceneId": "P2-08",
        "requires": [
          "recognized-police-reception",
          "met-police-reception",
          "F34"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P2-08",
      "part": 2,
      "locationId": "police",
      "roomId": "police-meeting-room",
      "sceneTime": "2026-10-08T14:25:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "扉を開けると、奥村が手帳を閉じた。その横の若い刑事がこちらを見た。"
        },
        {
          "speakerId": "okumura",
          "text": "佐伯。座れ。",
          "grants": [
            "met-okumura"
          ]
        },
        {
          "speakerId": "minato",
          "text": "急に悪かった。"
        },
        {
          "speakerId": "okumura",
          "text": "呼んだのは俺だ。こっちは瀬川。"
        },
        {
          "speakerId": "segawa",
          "text": "瀬川亮介です。",
          "grants": [
            "mentioned-segawa",
            "met-segawa",
            "named-segawa"
          ]
        },
        {
          "speakerId": "minato",
          "text": "佐伯だ。よろしく。"
        }
      ],
      "people": [
        "okumura",
        "segawa"
      ],
      "required": [
        "p2-journal-okumura",
        "p2-police-incident",
        "p2-police-naoto-answer",
        "p2-police-next-contact"
      ],
      "ask": [
        {
          "id": "p2-police-incident",
          "personId": "okumura",
          "label": "当時の事故",
          "lines": [
            {
              "speakerId": "minato",
              "text": "当時は、どんな説明になった？"
            },
            {
              "speakerId": "okumura",
              "text": "三崎は階段で転落した。誰かに押されたという証言は得られていなかった。本人の不注意として処理された。"
            },
            {
              "speakerId": "okumura",
              "text": "記録全部を渡すわけにはいかん。今話した範囲を使え。"
            },
            {
              "speakerId": "minato",
              "text": "それでいい。"
            }
          ],
          "requires": [
            "F35"
          ],
          "grants": [
            "E02"
          ],
          "required": true
        },
        {
          "id": "p2-police-naoto-answer",
          "personId": "okumura",
          "label": "直人の当時の回答",
          "lines": [
            {
              "speakerId": "minato",
              "text": "高瀬は、何と答えていた。"
            },
            {
              "speakerId": "okumura",
              "text": "何も見ていない、だ。"
            },
            {
              "speakerId": "segawa",
              "text": "今、違う話が出るなら、なぜ当時は言わなかったのかも聞きます。"
            },
            {
              "speakerId": "minato",
              "text": "ああ。本人に会って確かめる。"
            }
          ],
          "requires": [
            "E02"
          ],
          "grants": [
            "F36"
          ],
          "required": true
        },
        {
          "id": "p2-segawa-boundary",
          "personId": "segawa",
          "label": "確認の進め方",
          "lines": [
            {
              "speakerId": "segawa",
              "text": "民間の調査で集めた話を、そのまま事実として使うわけではありません。"
            },
            {
              "speakerId": "minato",
              "text": "それでいい。見直してもらうために持ってきた。"
            },
            {
              "speakerId": "segawa",
              "text": "……原本と、本人の説明を確認します。"
            },
            {
              "speakerId": "okumura",
              "text": "線は引く。使える話まで捨てる必要はない。"
            }
          ],
          "requires": [
            "met-segawa"
          ],
          "grants": [
            "optional-segawa-boundary"
          ],
          "required": false
        }
      ],
      "speak": [
        {
          "id": "p2-journal-okumura",
          "personId": "okumura",
          "label": "日誌の写しを見せる",
          "lines": [
            {
              "speakerId": "minato",
              "text": "管理人の了承を得て写した。原本は残してもらっている。"
            },
            {
              "speakerId": "okumura",
              "text": "貸出はあるな。何時までいたかは、ここからは分からん。"
            },
            {
              "speakerId": "minato",
              "text": "黒田は、その日は現場にいなかったと言っている。"
            },
            {
              "speakerId": "segawa",
              "text": "原本と、貸した人の話も確認が必要です。"
            }
          ],
          "requires": [
            "IT02",
            "met-okumura"
          ],
          "grants": [
            "F35"
          ],
          "required": true,
          "interaction": "item-use",
          "itemId": "IT02"
        },
        {
          "id": "p2-police-next-contact",
          "personId": "okumura",
          "label": "兄への接触",
          "lines": [
            {
              "speakerId": "minato",
              "text": "管理人から、本人へ伝言を頼んである。折り返しがあれば会う。"
            },
            {
              "speakerId": "okumura",
              "text": "事情が聞けたら知らせろ。勝手に危ないところへ連れていくな。"
            },
            {
              "speakerId": "minato",
              "text": "分かった。"
            }
          ],
          "requires": [
            "F36"
          ],
          "grants": [
            "F37"
          ],
          "required": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "受付",
        "nextSceneId": "P2-08-EXIT",
        "requires": [
          "met-okumura",
          "met-segawa",
          "mentioned-segawa",
          "named-segawa",
          "F35",
          "E02",
          "F36",
          "F37"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P2-08-EXIT",
      "part": 2,
      "locationId": "police",
      "roomId": "police-reception",
      "sceneTime": "2026-10-08T14:50:00",
      "intro": [],
      "people": [
        "police-reception"
      ],
      "required": [],
      "ask": [],
      "speak": [],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "外に出る",
        "nextSceneId": "P2-09",
        "requires": []
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P2-09",
      "part": 2,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-08T15:10:00",
      "intro": [
        {
          "speakerId": "mio",
          "text": "お帰りなさい。あかりさんから、新しい連絡はありません。"
        },
        {
          "speakerId": "minato",
          "text": "兄を昨日見た人がいた。"
        },
        {
          "speakerId": "mio",
          "text": "まず、そのことをお知らせしましょう。今の無事まで確認できたわけではない、と添えて。"
        },
        {
          "speakerId": "minato",
          "text": "頼む。"
        },
        {
          "speakerId": "narrator",
          "text": "澪があかりへ電話する。昨日の目撃と、本人へ伝言を届けたことを伝える。"
        },
        {
          "speakerId": "mio",
          "text": "お声の力が、少し戻りました。でも、なぜ連絡をくれないのかと。",
          "grants": [
            "F38"
          ]
        },
        {
          "speakerId": "minato",
          "text": "それは、本人に聞く。"
        }
      ],
      "people": [
        "mio"
      ],
      "required": [
        "p2-company-report",
        "p2-building-report",
        "p2-police-report"
      ],
      "ask": [
        {
          "id": "p2-report-reading",
          "personId": "mio",
          "label": "報告書の読み方",
          "lines": [
            {
              "speakerId": "mio",
              "text": "三崎さんは、負傷した方の説明を何度も書き直しています。会社へ何を確かめてほしいか、届くように。"
            },
            {
              "speakerId": "minato",
              "text": "人を責めるための紙には見えないな。"
            },
            {
              "speakerId": "mio",
              "text": "はい。確認してほしい、という言葉が残っています。"
            }
          ],
          "requires": [
            "F40"
          ],
          "grants": [
            "optional-report-reading"
          ],
          "required": false
        }
      ],
      "speak": [
        {
          "id": "p2-company-report",
          "personId": "mio",
          "label": "会社で分かったこと",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "湊が休暇、面会、黒田の説明を報告する。"
            },
            {
              "speakerId": "mio",
              "text": "休みを取ったことは、妹さんに言わなかった。でも、黒田さんへは自分から会いたいと。"
            },
            {
              "speakerId": "minato",
              "text": "本当のことを話してほしい、と。"
            },
            {
              "speakerId": "mio",
              "text": "その言葉を、帰る前に妹さんにも説明するつもりだったのかもしれませんね。"
            },
            {
              "speakerId": "minato",
              "text": "まだ分からない。今は、実際に言った相手が分かったところだ。"
            }
          ],
          "requires": [
            "F38"
          ],
          "grants": [
            "F39"
          ],
          "required": true
        },
        {
          "id": "p2-building-report",
          "personId": "mio",
          "label": "ビルで見たもの",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "日誌の写し、控え、湊の手描きの位置メモを机へ置く。"
            },
            {
              "speakerId": "mio",
              "text": "ここは、佐伯さんが見た位置ですね。"
            },
            {
              "speakerId": "minato",
              "text": "ああ。管理人は下の戸口にいたと言った。"
            },
            {
              "speakerId": "mio",
              "text": "この『顔は見ていない』は、答えのままですか？"
            },
            {
              "speakerId": "minato",
              "text": "そのままだ。"
            },
            {
              "speakerId": "mio",
              "text": "『何も見ていない』には直さず残しましょう。誰だったかと、何が見えたかは、別の話です。"
            }
          ],
          "requires": [
            "F38"
          ],
          "grants": [
            "F40",
            "IT04"
          ],
          "required": true
        },
        {
          "id": "p2-police-report",
          "personId": "mio",
          "label": "警察での確認",
          "lines": [
            {
              "speakerId": "minato",
              "text": "当時、押されたという証言は出ていない。高瀬も何も見ていないと答えた。"
            },
            {
              "speakerId": "mio",
              "text": "今は、その方が真相を求めている。"
            },
            {
              "speakerId": "minato",
              "text": "日誌の原本は警察に確認してもらう。本人の話も、知らせる約束だ。"
            },
            {
              "speakerId": "mio",
              "text": "聞いたことと、こちらの見立てを分けてまとめます。"
            }
          ],
          "requires": [
            "F38"
          ],
          "grants": [
            "F41"
          ],
          "required": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P2-10",
        "requires": [
          "F38",
          "F39",
          "F40",
          "IT04",
          "F41"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P2-10",
      "part": 2,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-08T15:35:00",
      "intro": [],
      "people": [
        "mio"
      ],
      "required": [
        "p2-reasoning1"
      ],
      "ask": [],
      "speak": [],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P2-11",
        "requires": [
          "reason1-passed"
        ]
      },
      "ending": [],
      "organize": [
        {
          "id": "p2-reasoning1",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "兄が消えた朝から、黒田に会うまで。確認したことだけをつなぐ。"
            }
          ],
          "requires": [
            "F14",
            "F19",
            "F36",
            "F39",
            "F40",
            "F41"
          ],
          "grants": [
            "reason1-passed"
          ],
          "required": true,
          "questionSetId": "Q1",
          "questions": [
            {
              "id": "Q1-1",
              "prompt": "兄は出勤したのか？",
              "choices": [
                {
                  "id": "a",
                  "text": "通常勤務だった。"
                },
                {
                  "id": "b",
                  "text": "申請した休暇だった。"
                },
                {
                  "id": "c",
                  "text": "会社へ来たかは、一切分からない。"
                }
              ],
              "answer": "b",
              "requires": [
                "F14"
              ],
              "hint": "勤務記録の回答を見直そう。",
              "grants": [
                "reason1-q1-correct"
              ]
            },
            {
              "id": "Q1-2",
              "prompt": "黒田へ何を求めた？",
              "choices": [
                {
                  "id": "a",
                  "text": "給与の前借り。"
                },
                {
                  "id": "b",
                  "text": "過去事故の本当の説明。"
                },
                {
                  "id": "c",
                  "text": "取り壊しの延期。"
                }
              ],
              "answer": "b",
              "requires": [
                "F19"
              ],
              "hint": "面会で直人が使った言葉を確かめよう。",
              "grants": [
                "reason1-q2-correct"
              ]
            },
            {
              "id": "Q1-3",
              "prompt": "当時の回答と今の行動で、何が引っかかる？",
              "choices": [
                {
                  "id": "a",
                  "text": "兄の殺人が確定した。"
                },
                {
                  "id": "b",
                  "text": "何も見ていないと言った兄が、真相を求めている。"
                },
                {
                  "id": "c",
                  "text": "黒田の不在が証明済みだ。"
                }
              ],
              "answer": "b",
              "requires": [
                "F19",
                "F36"
              ],
              "hint": "当時の回答と、今回の要求を並べよう。",
              "grants": [
                "reason1-q3-correct"
              ]
            }
          ],
          "successLines": [
            {
              "speakerId": "narrator",
              "text": "高瀬は、何も見ていないと答えた。その男が今、本当のことを話してほしいと求めた。"
            },
            {
              "speakerId": "narrator",
              "text": "自分の回答を終わらせたいのか。相手の説明を変えたいのか。それは、本人に会わなければ分からない。"
            }
          ],
          "retainCorrectAnswers": true
        }
      ]
    },
    {
      "id": "P2-11",
      "part": 2,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-08T15:50:00",
      "intro": [],
      "people": [
        "mio"
      ],
      "required": [
        "p2-naoto-callback"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p2-naoto-callback",
          "personId": "naoto",
          "label": "折り返しの電話",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "15:50。電話が鳴った。澪が取る。"
            },
            {
              "speakerId": "mio",
              "text": "佐伯探偵事務所です。……高瀬直人さんですね。少々お待ちください。"
            },
            {
              "speakerId": "narrator",
              "text": "受話器がこちらへ向いた。"
            },
            {
              "speakerId": "naoto",
              "text": "宮原さんから聞きました。あかりは、そちらへ。"
            },
            {
              "speakerId": "minato",
              "text": "ああ。依頼を受けた。会って話せるか？"
            },
            {
              "speakerId": "naoto",
              "text": "……あのビルで。宮原さんがいる間なら。"
            },
            {
              "speakerId": "minato",
              "text": "四時半に行く。それでいいか？"
            },
            {
              "speakerId": "naoto",
              "text": "はい。入口で待ちます。"
            }
          ],
          "requires": [
            "reason1-passed"
          ],
          "grants": [
            "F42",
            "I04",
            "part2_completed"
          ],
          "required": true,
          "interaction": "phone",
          "remoteOnly": true,
          "triggerMode": "automatic-after-entry"
        }
      ],
      "inspect": [],
      "think": [],
      "organize": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P3-01",
        "requires": [
          "F42",
          "I04",
          "part2_completed"
        ]
      },
      "ending": [
        {
          "speakerId": "minato",
          "text": "四時半、成子坂共同ビルだ。"
        },
        {
          "speakerId": "mio",
          "text": "私は、あかりさんのご連絡を受けられるようにしています。お兄さんの声が聞けるなら、その場でつないでください。"
        },
        {
          "speakerId": "minato",
          "text": "分かった。宮原さんにも予定を伝える。"
        }
      ]
    },
    {
      "id": "P3-01",
      "part": 3,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-08T16:10:00",
      "intro": [
        {
          "speakerId": "mio",
          "text": "宮原さんにも、四時半と伝わっています。"
        },
        {
          "speakerId": "minato",
          "text": "兄の無事を確認したら、すぐ電話する。"
        },
        {
          "speakerId": "mio",
          "text": "はい。あかりさんにも、電話を受けられるようお伝えしました。"
        },
        {
          "speakerId": "minato",
          "text": "ここは頼む。"
        },
        {
          "speakerId": "mio",
          "text": "お兄さんが急いで話せなくても、連絡を待てます。まず、会ってきてください。"
        }
      ],
      "people": [
        "mio"
      ],
      "required": [
        "p3-depart"
      ],
      "ask": [
        {
          "id": "p3-mio-callback",
          "personId": "mio",
          "label": "先ほどの電話",
          "lines": [
            {
              "speakerId": "minato",
              "text": "高瀬の声、どう聞こえた。"
            },
            {
              "speakerId": "mio",
              "text": "言い出すまで、少し時間がありました。事務所に妹さんが来たか、確かめたかったように。"
            },
            {
              "speakerId": "minato",
              "text": "心配していないわけじゃなさそうだ。"
            },
            {
              "speakerId": "mio",
              "text": "はい。連絡しなかった理由は、お会いしてからですね。"
            }
          ],
          "requires": [],
          "grants": [
            "optional-mio-callback"
          ],
          "required": false
        }
      ],
      "speak": [
        {
          "id": "p3-narumi-request",
          "personId": "mio",
          "label": "情報屋への確認依頼",
          "lines": [
            {
              "speakerId": "minato",
              "text": "会社の外側の話を、鳴海に聞けるか？"
            },
            {
              "speakerId": "mio",
              "text": "人員と作業のことですね。断定できる情報かも、確認します。"
            }
          ],
          "requires": [],
          "grants": [
            "optional-narumi-request",
            "mentioned-narumi",
            "named-narumi"
          ],
          "required": false
        },
        {
          "id": "p3-narumi-call",
          "personId": "narumi",
          "label": "情報屋への電話",
          "lines": [
            {
              "speakerId": "mio",
              "text": "情報屋さん。今、お話しできますか？"
            },
            {
              "speakerId": "narumi",
              "text": "澪ちゃんからなら、いつでも。……仕事の電話ですよね、これ。"
            },
            {
              "speakerId": "mio",
              "text": "はい。東成ビルサービスについて、聞ける範囲で。"
            },
            {
              "speakerId": "narumi",
              "text": "人が減ったのに仕事は減らない、とは聞いてます。でも、噂のまま佐伯さんに渡したら怒られるんで。"
            },
            {
              "speakerId": "minato",
              "text": "聞こえているぞ。"
            },
            {
              "speakerId": "narumi",
              "text": "ほらね。裏が取れた分だけ、あとで。"
            },
            {
              "speakerId": "mio",
              "text": "お願いします。"
            }
          ],
          "requires": [
            "optional-narumi-request"
          ],
          "grants": [
            "narumi-rumor"
          ],
          "required": false,
          "interaction": "phone",
          "remoteOnly": true
        },
        {
          "id": "p3-depart",
          "personId": "mio",
          "label": "直人に会いに行く",
          "lines": [
            {
              "speakerId": "minato",
              "text": "会えたら、連絡する。"
            }
          ],
          "requires": [
            "F42"
          ],
          "grants": [
            "p3-departed"
          ],
          "required": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "外に出る",
        "nextSceneId": "P3-02",
        "requires": [
          "p3-departed"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P3-02",
      "part": 3,
      "locationId": "building",
      "roomId": "building-exterior",
      "sceneTime": "2026-10-08T16:30:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "約束の時間より少し前に、宮原が扉を開けた。その後ろに、写真と同じ顔の男がいる。"
        },
        {
          "speakerId": "miyahara",
          "text": "佐伯さん。高瀬君が来ています。"
        },
        {
          "speakerId": "minato",
          "text": "高瀬直人だな。"
        },
        {
          "speakerId": "naoto",
          "text": "はい。妹が……。",
          "grants": [
            "met-naoto",
            "named-naoto",
            "F43"
          ]
        },
        {
          "speakerId": "minato",
          "text": "依頼を受けた。まず、怪我はないか？"
        },
        {
          "speakerId": "naoto",
          "text": "大丈夫です。"
        }
      ],
      "people": [
        "miyahara",
        "naoto"
      ],
      "required": [
        "p3-naoto-call-consent"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p3-naoto-call-consent",
          "personId": "naoto",
          "label": "妹への連絡",
          "lines": [
            {
              "speakerId": "minato",
              "text": "無事だと、妹へ伝えられるか？"
            },
            {
              "speakerId": "naoto",
              "text": "場所は言わないでください。"
            },
            {
              "speakerId": "minato",
              "text": "こちらから現在地は言わない。声だけでも聞かせよう。"
            },
            {
              "speakerId": "narrator",
              "text": "直人は、入口のガラスを見た。通りを歩く人影が映るたびに目を動かす。"
            },
            {
              "speakerId": "naoto",
              "text": "……はい。"
            }
          ],
          "requires": [
            "F43"
          ],
          "grants": [
            "F44"
          ],
          "required": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "管理人室",
        "nextSceneId": "P3-03",
        "requires": [
          "F43",
          "met-naoto",
          "named-naoto",
          "F44"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P3-03",
      "part": 3,
      "locationId": "building",
      "roomId": "building-manager-room",
      "sceneTime": "2026-10-08T16:35:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "宮原が椅子を出し、仕事のため廊下へ出た。"
        }
      ],
      "people": [
        "naoto"
      ],
      "required": [
        "p3-safety-call"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p3-safety-call",
          "personId": "mio",
          "label": "妹へ無事を知らせる",
          "lines": [
            {
              "speakerId": "minato",
              "text": "事務所へつなぐ。澪から、妹へ知らせてもらう。"
            },
            {
              "speakerId": "mio",
              "text": "佐伯さん。お会いできましたか？"
            },
            {
              "speakerId": "minato",
              "text": "本人だ。怪我もない。あかりさんへつないでくれ。"
            },
            {
              "speakerId": "mio",
              "text": "はい。お待ちください。"
            },
            {
              "speakerId": "akari",
              "text": "お兄ちゃん？"
            },
            {
              "speakerId": "naoto",
              "text": "ああ。……ごめん。"
            },
            {
              "speakerId": "akari",
              "text": "帰ってこられるの？"
            },
            {
              "speakerId": "naoto",
              "text": "今、佐伯さんと話してる。ちゃんと話すから。"
            },
            {
              "speakerId": "akari",
              "text": "また、連絡くれる？"
            },
            {
              "speakerId": "naoto",
              "text": "する。今度は、俺から。"
            },
            {
              "speakerId": "akari",
              "text": "分かった。待ってる。"
            },
            {
              "speakerId": "narrator",
              "text": "通話が終わる。直人は電話を返す前に、袖で目元をこすった。"
            }
          ],
          "requires": [
            "F44"
          ],
          "grants": [
            "F45",
            "safety-reported"
          ],
          "required": true,
          "interaction": "phone",
          "remoteOnly": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P3-04",
        "requires": [
          "F45",
          "safety-reported"
        ]
      },
      "ending": [
        {
          "speakerId": "minato",
          "text": "澪。事情を聞く。何かあれば、こちらへ。"
        },
        {
          "speakerId": "mio",
          "text": "はい。私は事務所でお待ちしています。"
        }
      ],
      "organize": []
    },
    {
      "id": "P3-04",
      "part": 3,
      "locationId": "building",
      "roomId": "building-manager-room",
      "sceneTime": "2026-10-08T16:40:00",
      "intro": [],
      "people": [
        "naoto"
      ],
      "required": [
        "p3-meeting",
        "p3-witness",
        "p3-silence",
        "p3-now",
        "p3-threat",
        "p3-no-contact"
      ],
      "ask": [
        {
          "id": "p3-meeting",
          "personId": "naoto",
          "label": "黒田との面会",
          "lines": [
            {
              "speakerId": "minato",
              "text": "五日、黒田に何を話した？"
            },
            {
              "speakerId": "naoto",
              "text": "三崎さんのことです。あれは事故じゃないんじゃないかって。"
            },
            {
              "speakerId": "minato",
              "text": "そう考えたのは、何かを見たからか？"
            },
            {
              "speakerId": "naoto",
              "text": "……はい。"
            }
          ],
          "requires": [
            "F45"
          ],
          "grants": [
            "F46"
          ],
          "required": true
        },
        {
          "id": "p3-witness",
          "personId": "naoto",
          "label": "当日の目撃",
          "lines": [
            {
              "speakerId": "minato",
              "text": "事故の日、何を見た？"
            },
            {
              "speakerId": "naoto",
              "text": "倒れた三崎さんと、階段側から戻ってくる黒田さんです。"
            },
            {
              "speakerId": "minato",
              "text": "黒田の顔を見たんだな。"
            },
            {
              "speakerId": "naoto",
              "text": "はい。旧事務室の戸口で。手には三崎さんの書類を持っていました。"
            },
            {
              "speakerId": "minato",
              "text": "押すところは、見ていない。"
            },
            {
              "speakerId": "naoto",
              "text": "見ていません。でも、あの日いなかったなんて嘘です。"
            }
          ],
          "requires": [
            "F46"
          ],
          "grants": [
            "W01a",
            "naoto-witness"
          ],
          "required": true
        },
        {
          "id": "p3-silence",
          "personId": "naoto",
          "label": "黙った理由",
          "lines": [
            {
              "speakerId": "minato",
              "text": "当時、言わなかった理由を聞かせてくれ。"
            },
            {
              "speakerId": "naoto",
              "text": "余計なことを言えば仕事は続けられない、って。妹の学校はどうするんだと。"
            },
            {
              "speakerId": "minato",
              "text": "黒田に言われたのか？"
            },
            {
              "speakerId": "naoto",
              "text": "はい。"
            },
            {
              "speakerId": "naoto",
              "text": "両親がいなくなってから、俺が何とかしなきゃと思って。あかりには学校を続けてほしかった。"
            },
            {
              "speakerId": "minato",
              "text": "それで、何も見ていないと答えた。"
            },
            {
              "speakerId": "naoto",
              "text": "……はい。"
            },
            {
              "speakerId": "narrator",
              "text": "窓の外で車が通り過ぎた。直人は音が遠ざかるまで、次の言葉を出さなかった。"
            },
            {
              "speakerId": "naoto",
              "text": "答えたあとは、言い直せなくなりました。次の日も、また次の日も、仕事がある。普通に帰って、普通に食べて。"
            },
            {
              "speakerId": "naoto",
              "text": "でも、三崎さんは帰ってこない。"
            }
          ],
          "requires": [
            "W01a"
          ],
          "grants": [
            "W01b"
          ],
          "required": true
        },
        {
          "id": "p3-now",
          "personId": "naoto",
          "label": "今回動いた理由",
          "lines": [
            {
              "speakerId": "minato",
              "text": "なぜ、今になって話そうと思った。"
            },
            {
              "speakerId": "naoto",
              "text": "片づけで、三崎さんの控えが出てきたんです。負傷した人のことを、何度も書き直してあって。"
            },
            {
              "speakerId": "naoto",
              "text": "ここもなくなる。そのまま、本人が悪かったことで終わると思ったら……。"
            },
            {
              "speakerId": "naoto",
              "text": "黒田さんに、本当のことを話してくださいって。俺も話すからって。"
            }
          ],
          "requires": [
            "F46"
          ],
          "grants": [
            "F47"
          ],
          "required": true
        },
        {
          "id": "p3-threat",
          "personId": "naoto",
          "label": "面会の返答",
          "lines": [
            {
              "speakerId": "minato",
              "text": "黒田は、何と答えた？"
            },
            {
              "speakerId": "naoto",
              "text": "あかりの大学名を言いました。いつも帰る道も。妹が困ることになるぞ、って。"
            },
            {
              "speakerId": "narrator",
              "text": "直人は入口を見た。今も、言葉の続きを聞かれると思っている。"
            },
            {
              "speakerId": "minato",
              "text": "そこで帰れなくなったんだな。"
            },
            {
              "speakerId": "naoto",
              "text": "はい。家へ戻ったら、あかりのところへ来るんじゃないかと。"
            }
          ],
          "requires": [
            "F47"
          ],
          "grants": [
            "F48",
            "naoto-threat"
          ],
          "required": true
        },
        {
          "id": "p3-no-contact",
          "personId": "naoto",
          "label": "連絡を絶った理由",
          "lines": [
            {
              "speakerId": "minato",
              "text": "妹へ連絡しなかったのは、なぜだ？"
            },
            {
              "speakerId": "naoto",
              "text": "捜しに来ると思いました。黒田さんへ聞きに行くかもしれない。何も知らず待ってくれている方が、安全だと。"
            },
            {
              "speakerId": "minato",
              "text": "妹は、待つだけではいられなかった。"
            },
            {
              "speakerId": "naoto",
              "text": "……はい。"
            },
            {
              "speakerId": "naoto",
              "text": "話したら学校をやめる、と言うかもしれない。俺のために、そんなことを。"
            },
            {
              "speakerId": "minato",
              "text": "妹が何を言うかも、一人で決めていたんだな。"
            },
            {
              "speakerId": "naoto",
              "text": "守ってるつもりでした。"
            },
            {
              "speakerId": "minato",
              "text": "その気持ちは否定しない。でも、黙ったままでは妹は何も選べない。"
            },
            {
              "speakerId": "minato",
              "text": "三崎の話も、そのままになる。"
            },
            {
              "speakerId": "narrator",
              "text": "直人は両手を離した。握り直すまでに、少し時間があった。"
            }
          ],
          "requires": [
            "F48"
          ],
          "grants": [
            "F49"
          ],
          "required": true
        },
        {
          "id": "p3-hidden",
          "personId": "naoto",
          "label": "潜伏中の行動",
          "lines": [
            {
              "speakerId": "naoto",
              "text": "宿にいました。電話を切って。眠れなくて、またここへ戻って。何をすればいいか、分からなくなっていました。"
            },
            {
              "speakerId": "minato",
              "text": "一人で来るのは、もうやめよう。"
            },
            {
              "speakerId": "naoto",
              "text": "はい。電話も、切りません。"
            }
          ],
          "requires": [
            "F48"
          ],
          "grants": [
            "optional-hidden-time"
          ],
          "required": false
        },
        {
          "id": "p3-responsibility",
          "personId": "naoto",
          "label": "責任について",
          "lines": [
            {
              "speakerId": "naoto",
              "text": "黒田さんがやったなら、俺のせいじゃないって。何度も考えました。"
            },
            {
              "speakerId": "minato",
              "text": "殺したのは、殺した人間だ。あんたが黙ったことは、それとは別に残る。"
            },
            {
              "speakerId": "naoto",
              "text": "……分かっています。"
            }
          ],
          "requires": [
            "W01b"
          ],
          "grants": [
            "optional-responsibility"
          ],
          "required": false
        }
      ],
      "speak": [],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P3-05",
        "requires": [
          "F46",
          "W01a",
          "naoto-witness",
          "W01b",
          "F47",
          "F48",
          "naoto-threat",
          "F49"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P3-05",
      "part": 3,
      "locationId": "building",
      "roomId": "building-manager-room",
      "sceneTime": "2026-10-08T17:00:00",
      "intro": [],
      "people": [
        "naoto"
      ],
      "required": [
        "p3-testify",
        "p3-call-okumura",
        "p3-call-mio"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p3-testify",
          "personId": "naoto",
          "label": "これから話すこと",
          "lines": [
            {
              "speakerId": "naoto",
              "text": "今からでも、話せますか？"
            },
            {
              "speakerId": "minato",
              "text": "話せる。あんたが選ぶことだ。"
            },
            {
              "speakerId": "naoto",
              "text": "警察で話します。当時の答えも、訂正します。"
            },
            {
              "speakerId": "minato",
              "text": "奥村さんへ知らせる。妹のことも、相談しよう。"
            }
          ],
          "requires": [
            "W01a",
            "W01b",
            "F49"
          ],
          "grants": [
            "F50",
            "W01"
          ],
          "required": true
        },
        {
          "id": "p3-call-okumura",
          "personId": "okumura",
          "label": "奥村へ知らせる",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "湊が奥村へ、証言の訂正意思と妹への脅しを知らせる。"
            },
            {
              "speakerId": "okumura",
              "text": "本人を一人で帰すな。妹への連絡も、こちらで話を聞いてから進める。"
            },
            {
              "speakerId": "minato",
              "text": "分かった。どう動けばいい。"
            },
            {
              "speakerId": "okumura",
              "text": "車を手配する。入口で待てるようにしておけ。まず二人の話を聞く。"
            }
          ],
          "requires": [
            "F50"
          ],
          "grants": [
            "F51"
          ],
          "required": true,
          "interaction": "phone",
          "remoteOnly": true
        },
        {
          "id": "p3-call-mio",
          "personId": "mio",
          "label": "澪へ知らせる",
          "lines": [
            {
              "speakerId": "minato",
              "text": "兄は警察で話すと決めた。妹への脅しもあった。"
            },
            {
              "speakerId": "mio",
              "text": "分かりました。あかりさんへ、独りで相手を訪ねないようお伝えします。"
            },
            {
              "speakerId": "minato",
              "text": "詳しい事情は、奥村さんたちと本人から話す。今は無事だと、改めて。"
            },
            {
              "speakerId": "mio",
              "text": "はい。お兄さんの話を、私から先回りして決めつけません。"
            }
          ],
          "requires": [
            "F51"
          ],
          "grants": [
            "F52"
          ],
          "required": true,
          "interaction": "phone",
          "remoteOnly": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P3-06",
        "requires": [
          "F50",
          "W01",
          "F51",
          "F52"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P3-06",
      "part": 3,
      "locationId": "building",
      "roomId": "building-manager-room",
      "sceneTime": "2026-10-08T17:10:00",
      "intro": [],
      "people": [
        "naoto"
      ],
      "required": [
        "p3-map-naoto",
        "p3-doc-description",
        "p3-original-location"
      ],
      "ask": [
        {
          "id": "p3-doc-description",
          "personId": "naoto",
          "label": "手にあった書類",
          "lines": [
            {
              "speakerId": "minato",
              "text": "持っていた書類は、何で分かった。"
            },
            {
              "speakerId": "naoto",
              "text": "青い表紙です。三崎さんが出した報告書を、仕事で見たことがありました。"
            },
            {
              "speakerId": "minato",
              "text": "今回見つけた控えと、同じ内容か？"
            },
            {
              "speakerId": "naoto",
              "text": "はい。ただ、受け取った黒田さんの署名があるのは原本です。"
            }
          ],
          "requires": [
            "F53"
          ],
          "grants": [
            "F54"
          ],
          "required": true
        },
        {
          "id": "p3-original-location",
          "personId": "naoto",
          "label": "原本の保管先",
          "lines": [
            {
              "speakerId": "minato",
              "text": "その原本は、どこにある？"
            },
            {
              "speakerId": "naoto",
              "text": "旧事務室の、鍵のある棚です。社員の書類は、まだ処分していません。"
            },
            {
              "speakerId": "minato",
              "text": "俺が勝手に開けるわけにはいかない。奥村さんに確認してもらう。"
            }
          ],
          "requires": [
            "F54"
          ],
          "grants": [
            "F55"
          ],
          "required": true
        }
      ],
      "speak": [
        {
          "id": "p3-map-naoto",
          "personId": "naoto",
          "label": "現場図を見せる",
          "lines": [
            {
              "speakerId": "minato",
              "text": "これは昼に俺が見て、澪が清書した図だ。違うところがあれば言ってくれ。"
            },
            {
              "speakerId": "naoto",
              "text": "位置関係は、こうです。"
            },
            {
              "speakerId": "minato",
              "text": "どこで、黒田の顔を見た。"
            },
            {
              "speakerId": "naoto",
              "text": "ここです。廊下から来て、旧事務室の戸口で。階段の方から戻ってきました。"
            },
            {
              "speakerId": "minato",
              "text": "その位置を、記録する。"
            }
          ],
          "requires": [
            "IT04",
            "W01"
          ],
          "grants": [
            "F53"
          ],
          "required": true,
          "interaction": "item-use",
          "itemId": "IT04"
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P3-07",
        "requires": [
          "F53",
          "F54",
          "F55"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P3-07",
      "part": 3,
      "locationId": "building",
      "roomId": "building-manager-room",
      "sceneTime": "2026-10-08T17:20:00",
      "intro": [],
      "people": [
        "naoto"
      ],
      "required": [
        "p3-think",
        "p3-tomorrow-call"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p3-tomorrow-call",
          "personId": "okumura",
          "label": "翌朝の確認を頼む",
          "lines": [
            {
              "speakerId": "okumura",
              "text": "会社へ正式に確認する。明日の朝、十時にビルで会おう。"
            },
            {
              "speakerId": "minato",
              "text": "分かった。宮原さんにも伝えておく。"
            }
          ],
          "requires": [
            "F56"
          ],
          "grants": [
            "F57"
          ],
          "required": true,
          "interaction": "phone",
          "remoteOnly": true
        }
      ],
      "inspect": [],
      "think": [
        {
          "id": "p3-think",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "高瀬は、黒田の顔を見た。押すところは見ていない。"
            },
            {
              "speakerId": "narrator",
              "text": "宮原さんは、顔は見ていないと言った。どんな動作が見えたかは、まだ聞けていない。"
            },
            {
              "speakerId": "narrator",
              "text": "原本は、二人が接触したことを確かめる材料になる。そこにいたことと、殺したことを、一緒にしない。"
            }
          ],
          "requires": [
            "W01",
            "F53",
            "F54",
            "F55"
          ],
          "grants": [
            "F56"
          ],
          "required": true
        }
      ],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P3-08",
        "requires": [
          "F56",
          "F57"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P3-08",
      "part": 3,
      "locationId": "building",
      "roomId": "building-manager-room",
      "sceneTime": "2026-10-08T17:25:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "宮原が戻り、警察の車が近くへ来たと伝える。直人は鞄を持ち、俺を見る。"
        },
        {
          "speakerId": "naoto",
          "text": "妹には、あとで俺から話します。"
        },
        {
          "speakerId": "minato",
          "text": "ああ。"
        }
      ],
      "people": [
        "miyahara",
        "naoto"
      ],
      "required": [
        "p3-handover"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p3-handover",
          "personId": "naoto",
          "label": "引継ぎを確認する",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "宮原から警察の車の到着を聞き、直人を担当者へ引き継ぐことにした。"
            }
          ],
          "requires": [
            "F57",
            "F52"
          ],
          "grants": [
            "part3_completed"
          ],
          "required": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "外に出る",
        "nextSceneId": "P4-01",
        "requires": [
          "part3_completed"
        ]
      },
      "ending": [
        {
          "speakerId": "narrator",
          "text": "ビル前で直人を担当者へ引き継いだ。帰所したら、澪に今日の話を伝える。"
        }
      ],
      "organize": []
    },
    {
      "id": "P4-01",
      "part": 4,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-09T09:30:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "昨夜戻ってから、澪に直人の話を伝えた。机の上では、記録が別々の束になっている。"
        },
        {
          "speakerId": "mio",
          "text": "こちらが直人さんの説明です。宮原さんの答えとは、分けてあります。"
        },
        {
          "speakerId": "minato",
          "text": "ありがとう。今日は、原本と見えた動作を確かめる。"
        },
        {
          "speakerId": "mio",
          "text": "あかりさんは昨夜、お兄さんから電話があったそうです。今日は大学の予定を調整して、連絡を待つと。",
          "grants": [
            "F58"
          ]
        },
        {
          "speakerId": "minato",
          "text": "二人で話せたか？"
        },
        {
          "speakerId": "mio",
          "text": "短くですが。詳しい話は、お兄さんの説明が済んでから、と。"
        }
      ],
      "people": [
        "mio"
      ],
      "required": [],
      "ask": [],
      "speak": [],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "外に出る",
        "nextSceneId": "P4-01-BUILDING",
        "requires": [
          "F58"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P4-01-BUILDING",
      "part": 4,
      "locationId": "building",
      "roomId": "building-exterior",
      "sceneTime": "2026-10-09T10:00:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "宮原へ到着を告げると、奥村たちが来るまで待ってほしいと応じた。十時、警察の車が停まった。"
        },
        {
          "speakerId": "okumura",
          "text": "会社への確認は済んだ。管理人の立会いで、保管書類を見る。",
          "grants": [
            "F59"
          ]
        },
        {
          "speakerId": "minato",
          "text": "原本の場所は、高瀬が説明した棚だ。"
        },
        {
          "speakerId": "segawa",
          "text": "確認できています。"
        }
      ],
      "people": [
        "miyahara",
        "okumura",
        "segawa",
        "naoto"
      ],
      "required": [],
      "ask": [],
      "speak": [],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "旧事務室",
        "nextSceneId": "P4-02",
        "requires": [
          "F59"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P4-02",
      "part": 4,
      "locationId": "building",
      "roomId": "building-old-office",
      "sceneTime": "2026-10-09T10:05:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "宮原が鍵を開けた。"
        },
        {
          "speakerId": "narrator",
          "text": "机は片づいていたが、鍵のある棚には書類が残っていた。"
        },
        {
          "speakerId": "narrator",
          "text": "瀬川が確認する間、俺は触れずに待った。直人は棚の場所を示し、それ以上は手を出さなかった。"
        }
      ],
      "people": [
        "miyahara",
        "okumura",
        "segawa",
        "naoto"
      ],
      "required": [
        "p4-shelf",
        "p4-receipt",
        "p4-copy-segawa"
      ],
      "ask": [
        {
          "id": "p4-receipt",
          "personId": "segawa",
          "label": "受領の記録",
          "lines": [
            {
              "speakerId": "segawa",
              "text": "黒田征司の署名と、事件当日の日付があります。"
            },
            {
              "speakerId": "minato",
              "text": "その日に三崎と接触した、という記録だな。"
            },
            {
              "speakerId": "segawa",
              "text": "そうです。ただし、署名だけで転落の行為まで証明はできません。"
            },
            {
              "speakerId": "minato",
              "text": "ああ。"
            }
          ],
          "requires": [
            "F60"
          ],
          "grants": [
            "E04a"
          ],
          "required": true
        },
        {
          "id": "p4-misaki-memory",
          "personId": "naoto",
          "label": "三崎の仕事",
          "lines": [
            {
              "speakerId": "naoto",
              "text": "三崎さんは、現場で困っている人の話を聞いてくれました。会社へ言うなら、一緒に書こうって。"
            },
            {
              "speakerId": "minato",
              "text": "報告書も、そうやって書いたのか？"
            },
            {
              "speakerId": "naoto",
              "text": "はい。怪我をした人の話が、自分の言葉のまま届くように。"
            }
          ],
          "requires": [],
          "grants": [
            "optional-misaki-memory"
          ],
          "required": false
        }
      ],
      "speak": [
        {
          "id": "p4-copy-segawa",
          "personId": "segawa",
          "label": "控えを照合する",
          "lines": [
            {
              "speakerId": "minato",
              "text": "宮原さんから、本人の了承を得て借りた控えだ。"
            },
            {
              "speakerId": "segawa",
              "text": "本文は一致します。書き直した箇所も。"
            },
            {
              "speakerId": "okumura",
              "text": "原本はこっちで保管する。内容の確認に使う写しを残せ。"
            }
          ],
          "requires": [
            "IT03",
            "E04a"
          ],
          "grants": [
            "E04",
            "IT05"
          ],
          "required": true,
          "interaction": "item-use",
          "itemId": "IT03"
        }
      ],
      "inspect": [
        {
          "id": "p4-shelf",
          "personId": null,
          "label": "保管棚",
          "lines": [
            {
              "speakerId": "segawa",
              "text": "ありました。三崎さんの報告書です。"
            },
            {
              "speakerId": "okumura",
              "text": "受領欄を確認しろ。"
            }
          ],
          "requires": [
            "F59"
          ],
          "grants": [
            "F60"
          ],
          "required": true
        }
      ],
      "think": [],
      "exit": {
        "label": "管理人室",
        "nextSceneId": "P4-03",
        "requires": [
          "F60",
          "E04a",
          "E04",
          "IT05"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P4-03",
      "part": 4,
      "locationId": "building",
      "roomId": "building-manager-room",
      "sceneTime": "2026-10-09T10:25:00",
      "intro": [
        {
          "speakerId": "okumura",
          "text": "昨日の話を、もう一度聞きたい。分からないところを埋める必要はない。"
        },
        {
          "speakerId": "miyahara",
          "text": "はい。"
        }
      ],
      "people": [
        "okumura",
        "miyahara"
      ],
      "required": [
        "p4-no-face",
        "p4-push",
        "p4-exit-route",
        "p4-manager-silence"
      ],
      "ask": [
        {
          "id": "p4-no-face",
          "personId": "miyahara",
          "label": "顔が見えなかったこと",
          "lines": [
            {
              "speakerId": "minato",
              "text": "昨日、顔は見ていないと言ったな。"
            },
            {
              "speakerId": "miyahara",
              "text": "ええ。戸の陰になって。"
            },
            {
              "speakerId": "minato",
              "text": "誰だったかは、今は聞かない。顔以外に見えたものを話せるか？"
            },
            {
              "speakerId": "miyahara",
              "text": "……三崎さんの背中に、両手が。肩より下です。"
            }
          ],
          "requires": [
            "E04"
          ],
          "grants": [
            "F61"
          ],
          "required": true
        },
        {
          "id": "p4-push",
          "personId": "miyahara",
          "label": "手の動き",
          "lines": [
            {
              "speakerId": "minato",
              "text": "その手は、どう動いた？"
            },
            {
              "speakerId": "miyahara",
              "text": "押しました。体が前へ出て、その人は手を離した。三崎さんは階段へ落ちました。"
            },
            {
              "speakerId": "okumura",
              "text": "支えようとしていた動きではないんだな。"
            },
            {
              "speakerId": "miyahara",
              "text": "はい。そこは、覚えています。"
            }
          ],
          "requires": [
            "F61"
          ],
          "grants": [
            "W02a"
          ],
          "required": true
        },
        {
          "id": "p4-exit-route",
          "personId": "miyahara",
          "label": "転落のあとの動き",
          "lines": [
            {
              "speakerId": "minato",
              "text": "その人物は、どちらへ動いた？"
            },
            {
              "speakerId": "miyahara",
              "text": "上の踊り場へ戻りました。灰色の上着が、旧事務室の戸口へ。"
            },
            {
              "speakerId": "minato",
              "text": "そこで見失ったのか？"
            },
            {
              "speakerId": "miyahara",
              "text": "ええ。そのすぐあと、高瀬君が廊下の方から来ました。"
            }
          ],
          "requires": [
            "W02a"
          ],
          "grants": [
            "W02b"
          ],
          "required": true
        },
        {
          "id": "p4-manager-silence",
          "personId": "miyahara",
          "label": "話さなかった理由",
          "lines": [
            {
              "speakerId": "minato",
              "text": "当時は、なぜ話せなかった。"
            },
            {
              "speakerId": "miyahara",
              "text": "顔を見ていない私が、人を殺人犯にしたらと思って。黒田さんにも、事故で騒いだら管理の責任を問われると。"
            },
            {
              "speakerId": "miyahara",
              "text": "誰かに聞かれるたび、音だけ聞いた、と答えました。最初の答えから、戻れなくなって。"
            },
            {
              "speakerId": "okumura",
              "text": "今話した動作は、顔を知らなくても説明できる。"
            },
            {
              "speakerId": "miyahara",
              "text": "……はい。誰かを決めつけることと、見たことを話すのを、一緒にしていました。"
            }
          ],
          "requires": [
            "W02a"
          ],
          "grants": [
            "W02",
            "F62"
          ],
          "required": true
        }
      ],
      "speak": [],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "階段",
        "nextSceneId": "P4-04",
        "requires": [
          "F61",
          "W02a",
          "W02b",
          "W02",
          "F62"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P4-04",
      "part": 4,
      "locationId": "building",
      "roomId": "building-stairs",
      "sceneTime": "2026-10-09T10:50:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "奥村が瀬川と直人を呼ぶ。独立して聞いた説明を持って、実際の位置を確かめる。"
        }
      ],
      "people": [
        "okumura",
        "segawa",
        "miyahara",
        "naoto"
      ],
      "required": [
        "p4-map-miyahara",
        "p4-map-naoto",
        "p4-next-check"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p4-map-miyahara",
          "personId": "miyahara",
          "label": "現場図で位置を確かめる",
          "lines": [
            {
              "speakerId": "minato",
              "text": "昼に見た位置を描いている。違うところがあれば、そこから直してくれ。"
            },
            {
              "speakerId": "miyahara",
              "text": "私は下の戸口です。ここから、三崎さんが押されて、相手が上へ戻るのを見ました。"
            }
          ],
          "requires": [
            "IT04",
            "W02"
          ],
          "grants": [
            "F63"
          ],
          "required": true,
          "interaction": "item-use",
          "itemId": "IT04"
        },
        {
          "id": "p4-map-naoto",
          "personId": "naoto",
          "label": "現場図で位置を確かめる",
          "lines": [
            {
              "speakerId": "naoto",
              "text": "俺は廊下から来ました。ここで、戸口へ戻った黒田さんの顔を見ました。"
            },
            {
              "speakerId": "segawa",
              "text": "間の時間が抜けていないか、確認します。宮原さんは戸口まで人物を追っていたんですね。"
            },
            {
              "speakerId": "miyahara",
              "text": "はい。そこで見失って、すぐ高瀬君が来ました。"
            },
            {
              "speakerId": "minato",
              "text": "服の色だけじゃない。移動先と、直後に見た顔。接触を記す原本もある。"
            }
          ],
          "requires": [
            "IT04",
            "F63"
          ],
          "grants": [
            "I05",
            "F64"
          ],
          "required": true,
          "interaction": "item-use",
          "itemId": "IT04"
        },
        {
          "id": "p4-next-check",
          "personId": "okumura",
          "label": "次の確認",
          "lines": [
            {
              "speakerId": "okumura",
              "text": "黒田にも説明を求める。署で、本人の話を聞く。"
            },
            {
              "speakerId": "minato",
              "text": "来てもらうのか？"
            },
            {
              "speakerId": "okumura",
              "text": "こちらから連絡する。お前の見立ても、確認してからだ。"
            }
          ],
          "requires": [
            "F64"
          ],
          "grants": [
            "F65"
          ],
          "required": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "管理人室",
        "nextSceneId": "P4-05",
        "requires": [
          "F63",
          "I05",
          "F64",
          "F65"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P4-05",
      "part": 4,
      "locationId": "building",
      "roomId": "building-manager-room",
      "sceneTime": "2026-10-09T11:10:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "窓際の机へ、図と写しを広げる。二人の説明は別の紙に残したままにする。"
        },
        {
          "speakerId": "minato",
          "text": "確認したところまで、つなぐ。"
        },
        {
          "speakerId": "okumura",
          "text": "推測で足すなよ。"
        }
      ],
      "people": [
        "okumura",
        "segawa"
      ],
      "required": [
        "p4-reasoning2",
        "p4-kuroda-appointment",
        "p4-mio-progress-call"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p4-kuroda-appointment",
          "personId": "okumura",
          "label": "黒田への連絡を確認する",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "奥村が黒田に連絡。事情の説明を求め、来署に応じる返事を得る。"
            },
            {
              "speakerId": "okumura",
              "text": "午後一時に、署へ来る。面会室で話を聞く。"
            },
            {
              "speakerId": "minato",
              "text": "俺も説明に立ち会っていいか？"
            },
            {
              "speakerId": "okumura",
              "text": "まず記録を持ってこい。話せる範囲で同席させる。"
            }
          ],
          "requires": [
            "F66"
          ],
          "grants": [
            "F67"
          ],
          "required": true
        },
        {
          "id": "p4-mio-progress-call",
          "personId": "mio",
          "label": "澪へ報告",
          "lines": [
            {
              "speakerId": "minato",
              "text": "原本と二人の話は確認できた。これから署へ行く。"
            },
            {
              "speakerId": "mio",
              "text": "こちらの記録も、渡せる形にしてあります。"
            },
            {
              "speakerId": "minato",
              "text": "今日持っている写しを先に渡す。清書は帰ってから頼む。"
            },
            {
              "speakerId": "mio",
              "text": "はい。あかりさんへは、確認が進んでいることまでお伝えします。"
            }
          ],
          "requires": [
            "F67"
          ],
          "grants": [
            "F68"
          ],
          "required": true,
          "interaction": "phone",
          "remoteOnly": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "外に出る",
        "nextSceneId": "P4-06-EXT",
        "requires": [
          "F66",
          "reason2-passed",
          "F67",
          "F68"
        ]
      },
      "ending": [],
      "organize": [
        {
          "id": "p4-reasoning2",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "確認したところまでをつなぐ。推測で足りない部分を埋めない。"
            }
          ],
          "requires": [
            "E01",
            "E02",
            "E03",
            "W01",
            "E04",
            "W02",
            "I05",
            "F65"
          ],
          "grants": [
            "F66",
            "reason2-passed"
          ],
          "required": true,
          "questionSetId": "Q2",
          "questions": [
            {
              "id": "Q2-1",
              "prompt": "黒田の不在の説明に反するものは？",
              "choices": [
                {
                  "id": "a",
                  "text": "鍵の貸出だけで、殺人が確定する。"
                },
                {
                  "id": "b",
                  "text": "鍵の日誌・受領原本・直人の顔の目撃。"
                },
                {
                  "id": "c",
                  "text": "人員削減の噂。"
                }
              ],
              "answer": "b",
              "requires": [
                "E01",
                "E04",
                "W01"
              ],
              "hint": "一つの記録ではなく、独立した情報を組み合わせよう。",
              "grants": [
                "reason2-q1-correct"
              ]
            },
            {
              "id": "Q2-2",
              "prompt": "不注意による転落の説明を崩すものは？",
              "choices": [
                {
                  "id": "a",
                  "text": "報告書の内容。"
                },
                {
                  "id": "b",
                  "text": "宮原が見た、背中を押す動作。"
                },
                {
                  "id": "c",
                  "text": "直人が連絡しなかったこと。"
                }
              ],
              "answer": "b",
              "requires": [
                "W02"
              ],
              "hint": "動機の話と、実際の動作を分けよう。",
              "grants": [
                "reason2-q2-correct"
              ]
            },
            {
              "id": "Q2-3",
              "prompt": "押した人物を黒田へ結ぶものは？",
              "choices": [
                {
                  "id": "a",
                  "text": "上着の色だけ。"
                },
                {
                  "id": "b",
                  "text": "直人が押すところを見た。"
                },
                {
                  "id": "c",
                  "text": "退出先と直後の人物目撃、当日の接触の文書。"
                }
              ],
              "answer": "c",
              "requires": [
                "I05",
                "E04",
                "W01",
                "W02"
              ],
              "hint": "誰が顔を見て、誰が動作を見たか。現場図を確かめよう。",
              "grants": [
                "reason2-q3-correct"
              ]
            }
          ],
          "successLines": [
            {
              "speakerId": "narrator",
              "text": "高瀬は顔を見た。宮原さんは、押す動作を見た。"
            },
            {
              "speakerId": "narrator",
              "text": "言えなかった理由は違う。その答えが重なって、三崎が一人で落ちたという説明を残してしまった。"
            },
            {
              "speakerId": "narrator",
              "text": "今は、見たところまでを話した。そこを、記録と場所で確かめた。"
            }
          ],
          "retainCorrectAnswers": true
        }
      ]
    },
    {
      "id": "P4-06-EXT",
      "part": 4,
      "locationId": "police",
      "roomId": "police-exterior",
      "sceneTime": "2026-10-09T12:00:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "署へ戻った。今度は、当時の説明を確かめた記録を持っている。"
        }
      ],
      "people": [],
      "required": [],
      "ask": [],
      "speak": [],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "受付",
        "nextSceneId": "P4-06-RECEPTION",
        "requires": []
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P4-06-RECEPTION",
      "part": 4,
      "locationId": "police",
      "roomId": "police-reception",
      "sceneTime": "2026-10-09T12:05:00",
      "intro": [],
      "people": [
        "police-reception"
      ],
      "required": [
        "p4-police-purpose"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p4-police-purpose",
          "personId": "police-reception",
          "label": "面会の用件",
          "lines": [
            {
              "speakerId": "minato",
              "text": "佐伯です。奥村さんへ、確認した記録を届けに来ました。"
            },
            {
              "speakerId": "police-reception",
              "text": "お話は伺っています。面会室へご案内します。"
            }
          ],
          "requires": [
            "met-police-reception"
          ],
          "grants": [
            "F69"
          ],
          "required": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "面会室",
        "nextSceneId": "P4-06",
        "requires": [
          "F69"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P4-06",
      "part": 4,
      "locationId": "police",
      "roomId": "police-meeting-room",
      "sceneTime": "2026-10-09T12:10:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "面会室へ案内された。奥村と瀬川が書類を置く。"
        }
      ],
      "people": [
        "okumura",
        "segawa"
      ],
      "required": [
        "p4-map-submit",
        "p4-attendance-boundary"
      ],
      "ask": [
        {
          "id": "p4-attendance-boundary",
          "personId": "okumura",
          "label": "同席の範囲",
          "lines": [
            {
              "speakerId": "okumura",
              "text": "黒田への確認は俺が進める。お前の聞いた話が必要になったら答えろ。"
            },
            {
              "speakerId": "minato",
              "text": "ああ。"
            },
            {
              "speakerId": "segawa",
              "text": "直人さんの訂正の話も、こちらで確認しています。"
            }
          ],
          "requires": [
            "F70"
          ],
          "grants": [
            "F71"
          ],
          "required": true
        }
      ],
      "speak": [
        {
          "id": "p4-map-submit",
          "personId": "segawa",
          "label": "更新した現場図を渡す",
          "lines": [
            {
              "speakerId": "segawa",
              "text": "二人の説明は別に残してください。この図は、位置を確認する資料として扱います。"
            },
            {
              "speakerId": "minato",
              "text": "分かっている。元の言葉も、一緒に渡す。"
            }
          ],
          "requires": [
            "IT04",
            "F69"
          ],
          "grants": [
            "F70"
          ],
          "required": true,
          "interaction": "item-use",
          "itemId": "IT04"
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P4-07",
        "requires": [
          "F70",
          "F71"
        ]
      },
      "ending": [
        {
          "speakerId": "narrator",
          "text": "書類を確認して待った。午後一時、受付から黒田の到着の連絡が入った。"
        }
      ],
      "organize": []
    },
    {
      "id": "P4-07",
      "part": 4,
      "locationId": "police",
      "roomId": "police-meeting-room",
      "sceneTime": "2026-10-09T13:00:00",
      "intro": [
        {
          "speakerId": "narrator",
          "text": "奥村が迎え、黒田を面会室へ案内した。俺は席を立って待つ。"
        },
        {
          "speakerId": "kuroda",
          "text": "会社の方でも、説明したはずですが。"
        },
        {
          "speakerId": "okumura",
          "text": "確認したいことが増えた。座ってくれ。"
        }
      ],
      "people": [
        "okumura",
        "segawa",
        "kuroda"
      ],
      "required": [
        "p4-kuroda-contact",
        "p4-kuroda-absence",
        "p4-kuroda-act"
      ],
      "ask": [
        {
          "id": "p4-kuroda-contact",
          "personId": "kuroda",
          "label": "当日の接触",
          "lines": [
            {
              "speakerId": "okumura",
              "text": "三崎と、その日に話したのか？"
            },
            {
              "speakerId": "kuroda",
              "text": "二年も前のことです。記憶だけでは。"
            },
            {
              "speakerId": "okumura",
              "text": "日誌と受領原本を確認した。接触の記録がある。"
            },
            {
              "speakerId": "kuroda",
              "text": "日付など、あとからでも……。"
            },
            {
              "speakerId": "minato",
              "text": "日誌を書いたのは宮原さんだ。控えを残したのは三崎だ。高瀬の話だけで集まったものじゃない。"
            },
            {
              "speakerId": "kuroda",
              "text": "高瀬君は、自分も嘘をついたと認めているんでしょう。"
            },
            {
              "speakerId": "minato",
              "text": "認めている。だから別の記録と証言で確かめた。"
            },
            {
              "speakerId": "okumura",
              "text": "三崎と話したのか？"
            },
            {
              "speakerId": "kuroda",
              "text": "……話はしました。"
            }
          ],
          "requires": [
            "F71"
          ],
          "grants": [
            "F72"
          ],
          "required": true
        },
        {
          "id": "p4-kuroda-absence",
          "personId": "kuroda",
          "label": "不在の説明",
          "lines": [
            {
              "speakerId": "okumura",
              "text": "なぜ、現場にはいなかったと言った。"
            },
            {
              "speakerId": "kuroda",
              "text": "騒ぎを避けたかった。それだけです。"
            },
            {
              "speakerId": "minato",
              "text": "三崎にも、騒ぐなと言ったのか？"
            },
            {
              "speakerId": "kuroda",
              "text": "会社が困れば、困るのは社員です。彼には分からなかった。"
            },
            {
              "speakerId": "minato",
              "text": "負傷した社員は、もう困っていた。"
            },
            {
              "speakerId": "narrator",
              "text": "黒田は紙の端をそろえる。何も書き足せない指が、同じ場所をなぞった。"
            }
          ],
          "requires": [
            "F72"
          ],
          "grants": [
            "F73"
          ],
          "required": true
        },
        {
          "id": "p4-kuroda-act",
          "personId": "kuroda",
          "label": "転落時の行為",
          "lines": [
            {
              "speakerId": "okumura",
              "text": "宮原さんは背中を両手で押す動作を見ている。その人物が戻った戸口で、高瀬がお前の顔を見た。そこを説明しろ。"
            },
            {
              "speakerId": "kuroda",
              "text": "帰れと言ったんです。聞かなかった。"
            },
            {
              "speakerId": "kuroda",
              "text": "戻ってきて、また話そうとして。俺は……。"
            },
            {
              "speakerId": "okumura",
              "text": "続けろ。"
            },
            {
              "speakerId": "kuroda",
              "text": "……押しました。"
            }
          ],
          "requires": [
            "F73"
          ],
          "grants": [
            "W03"
          ],
          "required": true
        }
      ],
      "speak": [],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P4-08",
        "requires": [
          "F72",
          "F73",
          "W03"
        ]
      },
      "ending": [
        {
          "speakerId": "okumura",
          "text": "ここから先は、こちらで確認する。"
        },
        {
          "speakerId": "minato",
          "text": "ああ。"
        }
      ],
      "organize": []
    },
    {
      "id": "P4-08",
      "part": 4,
      "locationId": "police",
      "roomId": "police-meeting-room",
      "sceneTime": "2026-10-09T13:35:00",
      "intro": [],
      "people": [
        "okumura",
        "segawa"
      ],
      "required": [
        "p4-police-handover"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p4-police-handover",
          "personId": "okumura",
          "label": "記録の引継ぎ",
          "lines": [
            {
              "speakerId": "segawa",
              "text": "高瀬さんにも、当時の説明を改めて聞きます。"
            },
            {
              "speakerId": "minato",
              "text": "本人も、そのつもりだ。"
            },
            {
              "speakerId": "okumura",
              "text": "記録は置いていけ。清書した分があれば、あとで。"
            },
            {
              "speakerId": "minato",
              "text": "澪がまとめている。帰ってから渡す。"
            },
            {
              "speakerId": "segawa",
              "text": "確認したことと、聞いた説明は分けてください。"
            },
            {
              "speakerId": "minato",
              "text": "そこは、澪に任せてある。"
            }
          ],
          "requires": [
            "W03"
          ],
          "grants": [
            "F74",
            "investigation_completed"
          ],
          "required": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "受付",
        "nextSceneId": "P4-08-EXIT",
        "requires": [
          "F74",
          "investigation_completed"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P4-08-EXIT",
      "part": 4,
      "locationId": "police",
      "roomId": "police-reception",
      "sceneTime": "2026-10-09T13:45:00",
      "intro": [],
      "people": [
        "police-reception"
      ],
      "required": [],
      "ask": [],
      "speak": [],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "外に出る",
        "nextSceneId": "P4-08-OFFICE",
        "requires": []
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P4-08-OFFICE",
      "part": 4,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-09T14:10:00",
      "intro": [],
      "people": [
        "mio"
      ],
      "required": [
        "p4-office-handover"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p4-office-handover",
          "personId": "mio",
          "label": "今日の記録をまとめる",
          "lines": [
            {
              "speakerId": "mio",
              "text": "お帰りなさい。"
            },
            {
              "speakerId": "minato",
              "text": "説明は聞けた。残りの確認は奥村さんたちが進める。"
            },
            {
              "speakerId": "mio",
              "text": "こちらの記録を、持参された分と合わせます。"
            },
            {
              "speakerId": "minato",
              "text": "頼む。"
            },
            {
              "speakerId": "mio",
              "text": "コーヒーは、少しあとにしましょうか？"
            },
            {
              "speakerId": "minato",
              "text": "ああ。今度は、先に片づける。"
            }
          ],
          "requires": [
            "F74"
          ],
          "grants": [
            "F75"
          ],
          "required": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P4-09",
        "requires": [
          "F75"
        ]
      },
      "ending": [
        {
          "speakerId": "narrator",
          "text": "清書した記録の提出方法を奥村へ確認し、渡した。"
        },
        {
          "speakerId": "narrator",
          "text": "その後の文書・証言・現場の確認と聴取を経て、黒田は逮捕された。三崎が一人で落ちたという説明は、もう続かない。"
        }
      ],
      "organize": []
    },
    {
      "id": "P4-09",
      "part": 4,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-12T16:30:00",
      "intro": [],
      "people": [
        "mio"
      ],
      "required": [
        "p4-siblings-arrive"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p4-siblings-arrive",
          "personId": "mio",
          "label": "二人を迎える",
          "lines": [
            {
              "speakerId": "mio",
              "text": "お二人が、もうすぐいらっしゃいます。昨夜、あかりさんからお電話がありました。"
            },
            {
              "speakerId": "minato",
              "text": "直人も一緒か？"
            },
            {
              "speakerId": "mio",
              "text": "はい。兄からも、お礼と、これからのことを話したいと。"
            },
            {
              "speakerId": "narrator",
              "text": "インターホンが鳴る。澪が扉へ向かい、兄妹を迎える。依頼時と同じ音が、今度は二人分の足音につながった。"
            }
          ],
          "requires": [
            "F75"
          ],
          "grants": [
            "F76"
          ],
          "required": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P4-10",
        "requires": [
          "F76"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P4-10",
      "part": 4,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-12T16:40:00",
      "intro": [],
      "people": [
        "mio",
        "akari",
        "naoto"
      ],
      "required": [
        "p4-siblings-talk"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p4-siblings-talk",
          "personId": "akari",
          "label": "二人の話を聞く",
          "lines": [
            {
              "speakerId": "akari",
              "text": "仕事がなくなるかもしれないって、ずっと思ってたの？"
            },
            {
              "speakerId": "naoto",
              "text": "ああ。"
            },
            {
              "speakerId": "akari",
              "text": "私の学校のことも？"
            },
            {
              "speakerId": "naoto",
              "text": "続けてほしかった。父さんたちも、そう思ってたはずだから。"
            },
            {
              "speakerId": "akari",
              "text": "私、普通に通ってた。お兄ちゃんがそんなこと考えてるって、知らないで。"
            },
            {
              "speakerId": "narrator",
              "text": "声が細くなった。直人は、カップの手前を見ていた。"
            },
            {
              "speakerId": "akari",
              "text": "お金の話をしても、大丈夫って言うから。私、それで。"
            },
            {
              "speakerId": "naoto",
              "text": "大丈夫って言ったのは俺だ。"
            },
            {
              "speakerId": "naoto",
              "text": "黙るって決めたのも。あかりが学校へ行ったからじゃない。"
            },
            {
              "speakerId": "akari",
              "text": "分かってる。でも、話してほしかった。"
            },
            {
              "speakerId": "akari",
              "text": "私が何を言うか、聞いてほしかった。"
            },
            {
              "speakerId": "naoto",
              "text": "……ごめん。"
            },
            {
              "speakerId": "akari",
              "text": "いなくなった時、私、何かしたのかなって。帰りたくなくなったのかなって。"
            },
            {
              "speakerId": "naoto",
              "text": "違う。そんなことは。"
            },
            {
              "speakerId": "akari",
              "text": "うん。でも、分からなかった。"
            },
            {
              "speakerId": "narrator",
              "text": "直人の手が開く。握り込んだ指が、少しずつほどけた。"
            },
            {
              "speakerId": "naoto",
              "text": "警察で話すことも、仕事のことも、まだある。前と同じには戻れない。"
            },
            {
              "speakerId": "akari",
              "text": "一緒に考えよう。"
            },
            {
              "speakerId": "naoto",
              "text": "……ああ。"
            },
            {
              "speakerId": "akari",
              "text": "今日は、帰ってくる？"
            },
            {
              "speakerId": "naoto",
              "text": "帰る。"
            },
            {
              "speakerId": "narrator",
              "text": "あかりは涙を拭き、もう一度うなずいた。"
            }
          ],
          "requires": [
            "F76"
          ],
          "grants": [
            "F77"
          ],
          "required": true
        },
        {
          "id": "p4-return-route",
          "personId": "akari",
          "label": "帰り道",
          "lines": [
            {
              "speakerId": "akari",
              "text": "今日は、一緒に帰ります。途中で買い物も。"
            },
            {
              "speakerId": "minato",
              "text": "二人で決めたんだな。"
            },
            {
              "speakerId": "akari",
              "text": "はい。"
            }
          ],
          "requires": [
            "F77"
          ],
          "grants": [
            "optional-return-route"
          ],
          "required": false
        },
        {
          "id": "p4-naoto-future",
          "personId": "naoto",
          "label": "これから",
          "lines": [
            {
              "speakerId": "naoto",
              "text": "当時の答えを訂正したら終わり、とは思っていません。"
            },
            {
              "speakerId": "minato",
              "text": "話したことを、これからも引き受ける。それでいい。"
            },
            {
              "speakerId": "naoto",
              "text": "はい。"
            }
          ],
          "requires": [
            "F77"
          ],
          "grants": [
            "optional-naoto-future"
          ],
          "required": false
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": "P4-11",
        "requires": [
          "F77"
        ]
      },
      "ending": [],
      "organize": []
    },
    {
      "id": "P4-11",
      "part": 4,
      "locationId": "office",
      "roomId": "office",
      "sceneTime": "2026-10-12T17:05:00",
      "intro": [],
      "people": [
        "mio"
      ],
      "required": [
        "p4-epilogue"
      ],
      "ask": [],
      "speak": [
        {
          "id": "p4-epilogue",
          "personId": "mio",
          "label": "日常へ戻る",
          "lines": [
            {
              "speakerId": "narrator",
              "text": "兄妹が帰った。澪が残ったカップを集める。"
            },
            {
              "speakerId": "mio",
              "text": "お茶、ほとんど冷めてしまいました。"
            },
            {
              "speakerId": "minato",
              "text": "話せたなら、いい。"
            },
            {
              "speakerId": "mio",
              "text": "はい。"
            },
            {
              "speakerId": "narrator",
              "text": "今度は俺の前へ、コーヒーが置かれた。"
            },
            {
              "speakerId": "narrator",
              "text": "黙っていた年月は消えない。三崎が帰ってくるわけでもない。"
            },
            {
              "speakerId": "narrator",
              "text": "直人は、自分の言葉を訂正した。これから何度も、その日に戻ることになるだろう。"
            },
            {
              "speakerId": "narrator",
              "text": "今夜は、兄妹が同じ家へ帰る。これからのことを、二人で話せる。"
            },
            {
              "speakerId": "mio",
              "text": "お疲れさまでした、佐伯さん。"
            },
            {
              "speakerId": "minato",
              "text": "ああ。澪も。"
            },
            {
              "speakerId": "narrator",
              "text": "机の端に、閉じた帳簿があった。カップを置いて、俺はそれを開く。"
            }
          ],
          "requires": [
            "F77"
          ],
          "grants": [
            "F78",
            "part4_completed"
          ],
          "required": true
        }
      ],
      "inspect": [],
      "think": [],
      "exit": {
        "label": "次へ",
        "nextSceneId": null,
        "requires": [
          "F78",
          "part4_completed"
        ]
      },
      "ending": [],
      "organize": []
    }
  ]
} satisfies RevisionData
