# 第1話 ver0.03 場面・進行対応表

2026-10-12。JSONから生成。必須と任意、追加話題の取得条件、出口の必要情報を併記する。人物・アイテム・推理・画像の詳細は進行と組込仕様、挿絵と背景差分を参照。

## 全場面

| 場面ID | 部 | 日時 | 建物／部屋 | その場の人物候補 | 進行先／出口 | 出口の必要情報 |
|---|---|---|---|---|---|---|
| P1-01 | 1 | 10-08 10:40 | office/office | mio | 次へ → P1-02 | F00, met-mio, named-mio |
| P1-02 | 1 | 10-08 10:55 | office/office | mio, akari | 次へ → P1-03 | met-akari, named-akari, mentioned-naoto, named-naoto, brother-profile |
| P1-03 | 1 | 10-08 11:00 | office/office | akari, mio | 次へ → P1-04 | F01, F02, morning, F03, contact, F04, F05, workplace, F06a, F06, police-consulted |
| P1-04 | 1 | 10-08 11:30 | office/office | mio, akari | 次へ → P1-05 | F07, I01 |
| P1-05 | 1 | 10-08 11:35 | office/office | akari, mio | 次へ → P1-06 | F08, request_accepted, IT01, search-photo, F09, akari-contact |
| P1-06 | 1 | 10-08 11:55 | office/office | mio | 次へ → P2-01 | F10, F11, mentioned-company-reception, F12, part1_completed |
| P2-01 | 2 | 10-08 12:00 | office/office | mio | 外に出る → P2-02-EXT | p2-departed |
| P2-02-EXT | 2 | 10-08 12:20 | company/company-exterior | なし | 受付 → P2-02 | なし |
| P2-02 | 2 | 10-08 12:25 | company/company-reception | company-reception | 応接室 → P2-03 | recognized-company-reception, met-company-reception, F13, F14, F15, I02, mentioned-kuroda, known-kuroda-title, F16 |
| P2-03 | 2 | 10-08 12:45 | company/company-lounge | kuroda | 受付 → P2-03-EXIT | met-kuroda, named-kuroda, F17, F18, mentioned-misaki, F19, F20, I03, F21, F22, mentioned-miyahara |
| P2-03-EXIT | 2 | 10-08 13:05 | company/company-reception | company-reception | 外に出る → P2-04 | なし |
| P2-04 | 2 | 10-08 13:20 | building/building-exterior | miyahara | 管理人室 → P2-05 | F23, demolition-date, recognized-miyahara, F24, met-miyahara, named-miyahara, F25, I04-sighting, F26, F27 |
| P2-05 | 2 | 10-08 13:30 | building/building-manager-room | miyahara | 階段 → P2-06 | F28, named-misaki, E01, IT02, F29, F30, E03, IT03 |
| P2-06 | 2 | 10-08 13:50 | building/building-stairs | miyahara | 管理人室 → P2-07 | p2-lower-door-known, p2-landing-known, p2-upper-door-known, F31, stair-layout, F32 |
| P2-07 | 2 | 10-08 14:00 | building/building-manager-room | miyahara | 外に出る → P2-08-EXT | F33, mentioned-okumura, named-okumura |
| P2-08-EXT | 2 | 10-08 14:15 | police/police-exterior | なし | 受付 → P2-08-RECEPTION | なし |
| P2-08-RECEPTION | 2 | 10-08 14:20 | police/police-reception | police-reception | 面会室 → P2-08 | recognized-police-reception, met-police-reception, F34 |
| P2-08 | 2 | 10-08 14:25 | police/police-meeting-room | okumura, segawa | 受付 → P2-08-EXIT | met-okumura, met-segawa, mentioned-segawa, named-segawa, F35, E02, F36, F37 |
| P2-08-EXIT | 2 | 10-08 14:50 | police/police-reception | police-reception | 外に出る → P2-09 | なし |
| P2-09 | 2 | 10-08 15:10 | office/office | mio | 次へ → P2-10 | F38, F39, F40, IT04, F41 |
| P2-10 | 2 | 10-08 15:35 | office/office | mio | 次へ → P2-11 | reason1-passed |
| P2-11 | 2 | 10-08 15:50 | office/office | mio | 次へ → P3-01 | F42, I04, part2_completed |
| P3-01 | 3 | 10-08 16:10 | office/office | mio | 外に出る → P3-02 | p3-departed |
| P3-02 | 3 | 10-08 16:30 | building/building-exterior | miyahara, naoto | 管理人室 → P3-03 | F43, met-naoto, named-naoto, F44 |
| P3-03 | 3 | 10-08 16:35 | building/building-manager-room | naoto | 次へ → P3-04 | F45, safety-reported |
| P3-04 | 3 | 10-08 16:40 | building/building-manager-room | naoto | 次へ → P3-05 | F46, W01a, naoto-witness, W01b, F47, F48, naoto-threat, F49 |
| P3-05 | 3 | 10-08 17:00 | building/building-manager-room | naoto | 次へ → P3-06 | F50, W01, F51, F52 |
| P3-06 | 3 | 10-08 17:10 | building/building-manager-room | naoto | 次へ → P3-07 | F53, F54, F55 |
| P3-07 | 3 | 10-08 17:20 | building/building-manager-room | naoto | 次へ → P3-08 | F56, F57 |
| P3-08 | 3 | 10-08 17:25 | building/building-manager-room | miyahara, naoto | 外に出る → P4-01 | part3_completed |
| P4-01 | 4 | 10-09 09:30 | office/office | mio | 外に出る → P4-01-BUILDING | F58 |
| P4-01-BUILDING | 4 | 10-09 10:00 | building/building-exterior | miyahara, okumura, segawa, naoto | 旧事務室 → P4-02 | F59 |
| P4-02 | 4 | 10-09 10:05 | building/building-old-office | miyahara, okumura, segawa, naoto | 管理人室 → P4-03 | F60, E04a, E04, IT05 |
| P4-03 | 4 | 10-09 10:25 | building/building-manager-room | okumura, miyahara | 階段 → P4-04 | F61, W02a, W02b, W02, F62 |
| P4-04 | 4 | 10-09 10:50 | building/building-stairs | okumura, segawa, miyahara, naoto | 管理人室 → P4-05 | F63, I05, F64, F65 |
| P4-05 | 4 | 10-09 11:10 | building/building-manager-room | okumura, segawa | 外に出る → P4-06-EXT | F66, reason2-passed, F67, F68 |
| P4-06-EXT | 4 | 10-09 12:00 | police/police-exterior | なし | 受付 → P4-06-RECEPTION | なし |
| P4-06-RECEPTION | 4 | 10-09 12:05 | police/police-reception | police-reception | 面会室 → P4-06 | F69 |
| P4-06 | 4 | 10-09 12:10 | police/police-meeting-room | okumura, segawa | 次へ → P4-07 | F70, F71 |
| P4-07 | 4 | 10-09 13:00 | police/police-meeting-room | okumura, segawa, kuroda | 次へ → P4-08 | F72, F73, W03 |
| P4-08 | 4 | 10-09 13:35 | police/police-meeting-room | okumura, segawa | 受付 → P4-08-EXIT | F74, investigation_completed |
| P4-08-EXIT | 4 | 10-09 13:45 | police/police-reception | police-reception | 外に出る → P4-08-OFFICE | なし |
| P4-08-OFFICE | 4 | 10-09 14:10 | office/office | mio | 次へ → P4-09 | F75 |
| P4-09 | 4 | 10-12 16:30 | office/office | mio | 次へ → P4-10 | F76 |
| P4-10 | 4 | 10-12 16:40 | office/office | mio, akari, naoto | 次へ → P4-11 | F77 |
| P4-11 | 4 | 10-12 17:05 | office/office | mio | 次へ → 終了 | F78, part4_completed |

## 話題・調査・推理

| 場面 | 操作ID | 種別／相手 | 話題 | 必須／任意 | 開放条件 | 完了時の取得 |
|---|---|---|---|---|---|---|
| P1-01 | p1-schedule | speak／mio | 今日の予定 | 任意 | なし | optional-schedule |
| P1-01 | p1-coffee | speak／mio | コーヒー | 任意 | なし | optional-coffee |
| P1-01 | p1-ledger | inspect | 帳簿を開く | 必須 | なし | F00, met-mio, named-mio |
| P1-02 | p1-visitor | speak／akari | 相談を聞く | 必須 | なし | met-akari, named-akari, mentioned-naoto, named-naoto, brother-profile |
| P1-03 | p1-missing | ask／akari | 帰らなくなった日 | 必須 | なし | F01 |
| P1-03 | p1-morning | ask／akari | 最後の朝 | 必須 | なし | F02, morning |
| P1-03 | p1-contact | ask／akari | 連絡 | 必須 | なし | F03, contact |
| P1-03 | p1-workplace | ask／akari | 勤務先 | 必須 | なし | F04 |
| P1-03 | p1-company-answer | ask／akari | 会社へ聞いたこと | 必須 | F04 | F05, workplace |
| P1-03 | p1-searched | ask／akari | ほかに捜したところ | 必須 | F03 | F06a |
| P1-03 | p1-police | ask／akari | 警察への相談 | 必須 | F06a | F06, police-consulted |
| P1-03 | p1-age | ask／akari | 兄の年齢 | 任意 | なし | known-naoto-age |
| P1-03 | p1-daily | ask／akari | 普段の連絡 | 任意 | F03 | naoto-daily |
| P1-03 | p1-family | ask／akari | 一緒に暮らす家族 | 任意 | なし | akari-family |
| P1-04 | p1-think | think | 考える | 必須 | F01, F02, F03, F04, F05, F06 | F07, I01 |
| P1-05 | p1-photo | ask／akari | 兄の写真 | 必須 | F08 | IT01, search-photo |
| P1-05 | p1-client-contact | ask／akari | 連絡先 | 必須 | IT01 | F09, akari-contact |
| P1-05 | p1-accept | speak／akari | 調査の進め方 | 必須 | F07 | F08, request_accepted |
| P1-05 | p1-return-home | speak／akari | 帰ってきたら | 任意 | F09 | optional-return-home |
| P1-06 | p1-company-call | speak／mio | 会社への連絡 | 必須 | F10 | F11, mentioned-company-reception |
| P1-06 | p1-mio-role | speak／mio | 留守中の対応 | 必須 | F11 | F12, part1_completed |
| P1-06 | p1-client-mood | speak／mio | あかりの様子 | 任意 | F11 | optional-client-mood |
| P1-06 | p1-inspect-photo | inspect | 机の写真 | 必須 | IT01 | F10 |
| P2-01 | p2-depart | speak／mio | 会社へ向かう | 必須 | F12 | p2-departed |
| P2-02-EXT | p2-company-sign | inspect | 会社の表示 | 任意 | なし | company-address-confirmed |
| P2-02 | p2-work-record | ask／company-reception | 勤務の記録 | 必須 | F13 | F14 |
| P2-02 | p2-appointment | ask／company-reception | 当日の予定 | 必須 | F14 | F15, I02, mentioned-kuroda, known-kuroda-title |
| P2-02 | p2-old-office | ask／company-reception | 古い事務所 | 任意 | F15 | optional-old-office |
| P2-02 | p2-reception-purpose | speak／company-reception | 訪問の用件 | 必須 | recognized-company-reception | F13 |
| P2-02 | p2-arrange-kuroda | speak／company-reception | 部長への取次ぎ | 必須 | F15 | F16 |
| P2-02 | p2-reception-exists | inspect | 受付カウンター | 必須 | なし | recognized-company-reception, met-company-reception |
| P2-03 | p2-kuroda-meeting | ask／kuroda | 直人との面会 | 必須 | F17 | F18, mentioned-misaki |
| P2-03 | p2-naoto-demand | ask／kuroda | 直人が求めたこと | 必須 | F18 | F19 |
| P2-03 | p2-accident-explanation | ask／kuroda | 当時の説明 | 必須 | F18 | F20, I03 |
| P2-03 | p2-after-meeting | ask／kuroda | 面会後の行き先 | 必須 | F19 | F21 |
| P2-03 | p2-building-work | ask／kuroda | ビルの片づけ | 必須 | F18 | F22, mentioned-miyahara |
| P2-03 | p2-misaki-work | ask／kuroda | 三崎の仕事 | 任意 | F18 | optional-misaki-work |
| P2-03 | p2-photo-kuroda | item-use／kuroda | 直人の写真を見せる | 必須 | IT01, met-kuroda | F17 |
| P2-04 | p2-naoto-sighting | ask／miyahara | 昨日の様子 | 必須 | F25 | F26 |
| P2-04 | p2-manager-introduce | speak／miyahara | 訪問の用件 | 必須 | recognized-miyahara | F24, met-miyahara, named-miyahara |
| P2-04 | p2-photo-miyahara | item-use／miyahara | 直人の写真を見せる | 必須 | IT01, F24 | F25, I04-sighting |
| P2-04 | p2-relay-contact | speak／miyahara | 連絡を届ける | 必須 | F25 | F27 |
| P2-04 | p2-demolition | inspect | 掲示 | 必須 | なし | F23, demolition-date |
| P2-04 | p2-manager-exists | inspect | 入口 | 必須 | なし | recognized-miyahara |
| P2-05 | p2-past-incident | ask／miyahara | 過去事故 | 必須 | F18, F27 | F28, named-misaki |
| P2-05 | p2-building-life | ask／miyahara | 建物の日常 | 任意 | F28 | optional-building-life |
| P2-05 | p2-preserve-journal | speak／miyahara | 記録の保存 | 必須 | E01 | F29 |
| P2-05 | p2-document-permission | speak／miyahara | 本人からの返答 | 必須 | F29 | F30 |
| P2-05 | p2-journal | inspect | 日誌 | 必須 | F28 | E01, IT02 |
| P2-05 | p2-envelope | inspect | 預かった封筒 | 必須 | F30 | E03, IT03 |
| P2-06 | p2-manager-position | ask／miyahara | 当時の立ち位置 | 必須 | p2-lower-door-known, p2-landing-known, p2-upper-door-known | F31, stair-layout, F32 |
| P2-06 | p2-lower-door | inspect | 下階の戸口 | 必須 | なし | p2-lower-door-known |
| P2-06 | p2-landing | inspect | 踊り場 | 必須 | なし | p2-landing-known |
| P2-06 | p2-upper-door | inspect | 上の戸口 | 必須 | なし | p2-upper-door-known |
| P2-07 | p2-call-police | phone／okumura | 奥村へ連絡 | 必須 | E01, F32 | F33, mentioned-okumura, named-okumura |
| P2-08-RECEPTION | p2-police-purpose | speak／police-reception | 面会の用件 | 必須 | F33, recognized-police-reception | F34 |
| P2-08-RECEPTION | p2-police-reception-exists | inspect | 受付カウンター | 必須 | なし | recognized-police-reception, met-police-reception |
| P2-08 | p2-police-incident | ask／okumura | 当時の事故 | 必須 | F35 | E02 |
| P2-08 | p2-police-naoto-answer | ask／okumura | 直人の当時の回答 | 必須 | E02 | F36 |
| P2-08 | p2-segawa-boundary | ask／segawa | 確認の進め方 | 任意 | met-segawa | optional-segawa-boundary |
| P2-08 | p2-journal-okumura | item-use／okumura | 日誌の写しを見せる | 必須 | IT02, met-okumura | F35 |
| P2-08 | p2-police-next-contact | speak／okumura | 兄への接触 | 必須 | F36 | F37 |
| P2-09 | p2-report-reading | ask／mio | 報告書の読み方 | 任意 | F40 | optional-report-reading |
| P2-09 | p2-company-report | speak／mio | 会社で分かったこと | 必須 | F38 | F39 |
| P2-09 | p2-building-report | speak／mio | ビルで見たもの | 必須 | F38 | F40, IT04 |
| P2-09 | p2-police-report | speak／mio | 警察での確認 | 必須 | F38 | F41 |
| P2-10 | p2-reasoning1 | organize | Q1 | 必須 | F14, F19, F36, F39, F40, F41 | reason1-passed |
| P2-11 | p2-naoto-callback | phone／naoto | 折り返しの電話 | 必須 | reason1-passed | F42, I04, part2_completed |
| P3-01 | p3-mio-callback | ask／mio | 先ほどの電話 | 任意 | なし | optional-mio-callback |
| P3-01 | p3-narumi-request | speak／mio | 情報屋への確認依頼 | 任意 | なし | optional-narumi-request, mentioned-narumi, named-narumi |
| P3-01 | p3-narumi-call | phone／narumi | 情報屋への電話 | 任意 | optional-narumi-request | narumi-rumor |
| P3-01 | p3-depart | speak／mio | 直人に会いに行く | 必須 | F42 | p3-departed |
| P3-02 | p3-naoto-call-consent | speak／naoto | 妹への連絡 | 必須 | F43 | F44 |
| P3-03 | p3-safety-call | phone／mio | 妹へ無事を知らせる | 必須 | F44 | F45, safety-reported |
| P3-04 | p3-meeting | ask／naoto | 黒田との面会 | 必須 | F45 | F46 |
| P3-04 | p3-witness | ask／naoto | 当日の目撃 | 必須 | F46 | W01a, naoto-witness |
| P3-04 | p3-silence | ask／naoto | 黙った理由 | 必須 | W01a | W01b |
| P3-04 | p3-now | ask／naoto | 今回動いた理由 | 必須 | F46 | F47 |
| P3-04 | p3-threat | ask／naoto | 面会の返答 | 必須 | F47 | F48, naoto-threat |
| P3-04 | p3-no-contact | ask／naoto | 連絡を絶った理由 | 必須 | F48 | F49 |
| P3-04 | p3-hidden | ask／naoto | 潜伏中の行動 | 任意 | F48 | optional-hidden-time |
| P3-04 | p3-responsibility | ask／naoto | 責任について | 任意 | W01b | optional-responsibility |
| P3-05 | p3-testify | speak／naoto | これから話すこと | 必須 | W01a, W01b, F49 | F50, W01 |
| P3-05 | p3-call-okumura | phone／okumura | 奥村へ知らせる | 必須 | F50 | F51 |
| P3-05 | p3-call-mio | phone／mio | 澪へ知らせる | 必須 | F51 | F52 |
| P3-06 | p3-doc-description | ask／naoto | 手にあった書類 | 必須 | F53 | F54 |
| P3-06 | p3-original-location | ask／naoto | 原本の保管先 | 必須 | F54 | F55 |
| P3-06 | p3-map-naoto | item-use／naoto | 現場図を見せる | 必須 | IT04, W01 | F53 |
| P3-07 | p3-tomorrow-call | phone／okumura | 翌朝の確認を頼む | 必須 | F56 | F57 |
| P3-07 | p3-think | think | 考える | 必須 | W01, F53, F54, F55 | F56 |
| P3-08 | p3-handover | speak／naoto | 引継ぎを確認する | 必須 | F57, F52 | part3_completed |
| P4-02 | p4-receipt | ask／segawa | 受領の記録 | 必須 | F60 | E04a |
| P4-02 | p4-misaki-memory | ask／naoto | 三崎の仕事 | 任意 | なし | optional-misaki-memory |
| P4-02 | p4-copy-segawa | item-use／segawa | 控えを照合する | 必須 | IT03, E04a | E04, IT05 |
| P4-02 | p4-shelf | inspect | 保管棚 | 必須 | F59 | F60 |
| P4-03 | p4-no-face | ask／miyahara | 顔が見えなかったこと | 必須 | E04 | F61 |
| P4-03 | p4-push | ask／miyahara | 手の動き | 必須 | F61 | W02a |
| P4-03 | p4-exit-route | ask／miyahara | 転落のあとの動き | 必須 | W02a | W02b |
| P4-03 | p4-manager-silence | ask／miyahara | 話さなかった理由 | 必須 | W02a | W02, F62 |
| P4-04 | p4-map-miyahara | item-use／miyahara | 現場図で位置を確かめる | 必須 | IT04, W02 | F63 |
| P4-04 | p4-map-naoto | item-use／naoto | 現場図で位置を確かめる | 必須 | IT04, F63 | I05, F64 |
| P4-04 | p4-next-check | speak／okumura | 次の確認 | 必須 | F64 | F65 |
| P4-05 | p4-kuroda-appointment | speak／okumura | 黒田への連絡を確認する | 必須 | F66 | F67 |
| P4-05 | p4-mio-progress-call | phone／mio | 澪へ報告 | 必須 | F67 | F68 |
| P4-05 | p4-reasoning2 | organize | Q2 | 必須 | E01, E02, E03, W01, E04, W02, I05, F65 | F66, reason2-passed |
| P4-06-RECEPTION | p4-police-purpose | speak／police-reception | 面会の用件 | 必須 | met-police-reception | F69 |
| P4-06 | p4-attendance-boundary | ask／okumura | 同席の範囲 | 必須 | F70 | F71 |
| P4-06 | p4-map-submit | item-use／segawa | 更新した現場図を渡す | 必須 | IT04, F69 | F70 |
| P4-07 | p4-kuroda-contact | ask／kuroda | 当日の接触 | 必須 | F71 | F72 |
| P4-07 | p4-kuroda-absence | ask／kuroda | 不在の説明 | 必須 | F72 | F73 |
| P4-07 | p4-kuroda-act | ask／kuroda | 転落時の行為 | 必須 | F73 | W03 |
| P4-08 | p4-police-handover | speak／okumura | 記録の引継ぎ | 必須 | W03 | F74, investigation_completed |
| P4-08-OFFICE | p4-office-handover | speak／mio | 今日の記録をまとめる | 必須 | F74 | F75 |
| P4-09 | p4-siblings-arrive | speak／mio | 二人を迎える | 必須 | F75 | F76 |
| P4-10 | p4-siblings-talk | speak／akari | 二人の話を聞く | 必須 | F76 | F77 |
| P4-10 | p4-return-route | speak／akari | 帰り道 | 任意 | F77 | optional-return-route |
| P4-10 | p4-naoto-future | speak／naoto | これから | 任意 | F77 | optional-naoto-future |
| P4-11 | p4-epilogue | speak／mio | 日常へ戻る | 必須 | F77 | F78, part4_completed |

## 入室・名乗りの行で付与

| 場面 | 行 | 付与 |
|---|---|---|
| P1-02/p1-visitor | akari：高瀬あかりです。 | met-akari, named-akari |
| P1-02/p1-visitor | akari：高瀬直人です。 | mentioned-naoto, named-naoto, brother-profile |
| P2-02/p2-appointment | company-reception：黒田部長へ、面会を頼んでいました。 | mentioned-kuroda, known-kuroda-title |
| P2-03 intro | kuroda：業務部長の黒田征司です。 | met-kuroda, named-kuroda |
| P2-03/p2-kuroda-meeting | kuroda：成子坂共同ビルで、三崎という社員が亡くなった件です。 | mentioned-misaki |
| P2-04/p2-manager-introduce | miyahara：宮原です。ここを管理しています。 | met-miyahara, mentioned-miyahara |
| P2-04/p2-manager-introduce | narrator：渡された管理連絡票には、宮原文雄とあった。 | named-miyahara |
| P2-05/p2-past-incident | miyahara：三崎健です。 | named-misaki |
| P2-08 intro | okumura：佐伯。座れ。 | met-okumura |
| P2-08 intro | segawa：瀬川亮介です。 | mentioned-segawa, met-segawa, named-segawa |
| P2-09 intro | mio：お声の力が、少し戻りました。でも、なぜ連絡をくれないのかと。 | F38 |
| P3-02 intro | naoto：はい。妹が……。 | met-naoto, named-naoto, F43 |
| P4-01 intro | mio：あかりさんは昨夜、お兄さんから電話があったそうです。今日は大学の予定を調整して、連絡を待つと。 | F58 |
| P4-01-BUILDING intro | okumura：会社への確認は済んだ。管理人の立会いで、保管書類を見る。 | F59 |
