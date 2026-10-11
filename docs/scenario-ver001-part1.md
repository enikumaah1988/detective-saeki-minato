# ver0.01 第1部の実装対応

基点: `3ed0b93bc95bab52a0b9a3476afdede16120df0d`。専用ブランチ `scenario/ver001-part1`。原稿正本は saeki-story/outputs/story の「第1話_シナリオ初稿_ver0.01.md」「ver0.01_事件設定と進行.md」「第1話_現行設定.md」。参照元、sources、他checkoutは編集していない。

## 原稿・ノード・情報の対応

|原稿|ノード|取得と出口|
|---|---|---|
|1 帰らなかった兄・来訪|opening-1〜4|あかりの自己紹介後、office-menuへ|
|1 最後の朝、連絡、勤務先|inquiry-1〜13|最後の読了操作でI01とmorning-contact-work取得|
|1 任意／兄の普段|daily-1〜3|daily既読と補助情報naoto-daily|
|1 任意／家族|family-1〜3|family既読と補助情報akari-family|
|2 確認したことと推測の整理|organize|I01必須。不足時はoffice-menuへ|
|2 警察相談、料金、依頼受諾|accept-1〜14|最後の読了でrequest_accepted、search-photo取得|
|2 会社への確認|departure → destinations → company-arrival-1|I01とsearch-photoで移動を解放。移動先一覧の戻るは取得なし|
|3 休暇記録と面会申込み|company-1〜12|読了でI02とleave-and-appointment取得|
|3 確認後の会話|company-followup-1〜3|休暇と妹の認識を区別|
|第1部出口|part1-exit → part1-complete → part2-boundary|I01・I02の両方が必須。完了フラグ後、第2部未実装境界へ|

ノードの正確な範囲・台詞は src/data/scenario/episode1Part1.ts を参照。上記範囲は原稿とのまとまりを示す。聞く項目は「最後の朝・連絡・勤務先」を一続きにし、原稿の必須台詞の順序を維持した。任意2項目は消化不要。I01取得後は採用UIの考える単独表示になるため、任意項目は取得前に選べる。

## 実装用補足

原稿の事件事実・動機は追加していない。次の補足を明示して区別する。

- I01取得会話末の勤務先・兄の名前／年齢／担当は原稿の［調査］注記を地の文へ表示したもの。
- カップの調査は原稿冒頭の観察文を再表示するだけ。新情報を取得しない。
- organizeの完了文は原稿の［調査／整理］指示を表示するもの。不足時の案内は実装補足。
- 依頼受諾後、写真と連絡先を預かる要求の読了をsearch-photoの取得時点にした。原稿の捜索用写真の扱いに従う。受け渡しを明示する独立台詞が必要ならストーリー担当へ戻す。
- 原稿内の演出指示「数字はプレイヤーには示さない」「担当の個別立ち絵は必須にしない」は本文へ表示しない。
- 到着・第1部完了・未実装境界、不足情報から戻る案内、喫煙ヒントは最小の実装補足。喫煙ヒントは新事実・取得・進行を生まない。
- 初稿にない大学生活・飲み物の追加会話は創作せず残件。家族会話は初稿にあるものを実装。

## 共通処理と作品データの境界

作品データ: 会話、ノード遷移、条件と更新、場所と人物配置、表情ID、調査記録、ヒント、実装する自由行動コマンド。TypeScriptで維持し、既存Scenario/Condition/StateUpdateを使う。

共通処理: 条件評価、選択と読了更新、重複防止、保存・復元、シーン復元、表示。SaveData version 2の形式は変更なし。本編は別scenarioIdのため旧デモのセーブと混同しない。

- state.ts/scene.tsのminato固定配置判断を外し、シーンの左右明示と重複位置検証へ。旧デモの湊単独も左を明示した。旧Stageの表示互換は維持するが、無指定位置は人物IDによらず右を既定にする。
- 自由行動ノードのimplementedCommandsで移動を有効化する。旧デモは既存の既定値を維持。移動先は通常choice、到着はdialogue、背景はsceneIdで復元する。DEV移動モックの状態・地図は本編へ接続しない。
- Scenario.recordsをStoryPlayerから渡す。新本編を共通調査処理のscenarioId分岐へ登録しない。旧APIのデモ記録既定値は互換のため維持。
- Appはcatalogから開始作品とDEV選択を解決する。`?scenario=gray-testimony-part1-demo`で従来デモの回帰確認ができる。

## 素材と担当への残件

素材checkoutの docs/art/README.md / neutral-review.md を参照。あかりの個別画像は未制作、主要人物のneutral画像は採用待ち。新画像は取り込まない。normalは既存UI画像の登録を維持し、neutralへ自動置換しない。

昼前事務所は既存office-afternoonの仮使用、会社は画像なし仮背景、あかりは名前付き仮表示。澪は事務所の声で登場するが、2人表示制限により湊とあかりを表示する。会社は湊と澪、事務担当は声のみ。正式背景・あかり・写真画像・表情演出・音響は後続担当へ。3人同時表示、新しい移動演出、大きなUI変更は未実装。

第2〜4部、推理3択、写真への提示コマンド、複数セーブ、実測プレイ時間は対象外。第2部本文をプレイできると主張しない。


## Windows検証環境

通常のnpm buildは当初Windows sandboxのnative realpathでEPERMになった。vite.config.tsはWindowsだけpreserveSymlinksを指定し、ReactのSSR外部解決を明示した。これにより通常のnpm run buildが成功した。依存パッケージや保存形式の変更はない。

外部Playwrightの本編通しテストは tests/episode1Part1Browser.test.mjs。SAEKI_PART1_URLを本編URL、従来のブラウザー回帰ではSAEKI_BASE_URLを `?scenario=gray-testimony-part1-demo` 付きURLにする。Chromiumのパスは既存管理環境を指定する。sandbox環境では起動とブラウザ検証を同じ親プロセス内にまとめ、検証サーバーのcacheDirをロジックテストと分ける必要があった。

既存テストは検証内容を変えず tests/viteServer.mjs に設定読込を集約した。Windowsのみnative loaderを使い、他OSは元の既定値を維持する。DEV記録プレビューのスクリーンショット保存先は固定 `/tmp` からworkへ変更した。

