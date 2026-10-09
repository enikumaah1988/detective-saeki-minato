# 探偵 佐伯湊 / Detective Saeki Minato

## 概要

「探偵 佐伯湊 / Detective Saeki Minato」は、現代を舞台にした探偵アドベンチャーゲーム（ADV）の個人開発プロジェクトです。現在は、ローカルシナリオを使った最小 ADV の会話・選択肢分岐を実装しています。

React + TypeScript + Vite の最小構成を導入済みです。バックエンドは未実装で、将来の API 連携に向けたディレクトリを用意しています。

## 実装済みの最小 ADV

- 検証用 SVG による背景・立ち絵表示と、画像未設定・読み込み失敗時のプレースホルダー表示
- 話者名とセリフの表示、「次へ」ボタンでの会話進行
- 2つの選択肢による会話分岐、終了後の「最初から」操作
- 型付きのローカルシナリオデータと UI・進行ロジックの分離

起動すると第1話「灰色の証言」第1部「依頼」を通して遊べる仮シナリオを表示します。正式シナリオではありません。画面上部で従来の会話・分岐仮シーンにも切り替えられます。切替時は初期化され、ロードは保存したシーンを選んで実行してください。

LocalStorage による1スロットのセーブ／ロード・削除を実装しています。Backend / API 通信、音声・BGM・SE、Android / iOS 対応は未実装です。

## 技術スタック

- React
- TypeScript
- Vite
- npm

## 前提環境・セットアップ

- Node.js LTS / npm（Vite の要件: Node.js 20.19 以上の 20 系、または 22.12 以上）
- Git
- 現在の開発環境: Windows 11 + WSL2 + Ubuntu 26.04

WSL / Ubuntu のターミナルで、リポジトリのルートから依存パッケージをインストールします。

```bash
cd ~/workspace/detective-saeki-minato
npm ci
```

ローカル開発環境の構築手順は [docs/development-setup.md](docs/development-setup.md) を参照してください。

## 開発・ビルド

開発サーバーを起動します。アクセス先はターミナルに表示されます。

```bash
npm run dev
```

TypeScript の型チェックと本番用ビルドを実行します。成果物は `dist/` に出力されます。

```bash
npm run build
```

ビルド後の成果物をローカルで確認します。

```bash
npm run preview
```

## ディレクトリ構成

```text
.
├── docs/                 # 開発環境の構築手順
├── src/
│   ├── app/              # アプリケーションのルート（App.tsx）
│   ├── components/       # 共通 UI コンポーネント
│   ├── features/
│   │   └── story/        # ストーリー機能
│   ├── pages/            # 画面
│   ├── services/
│   │   └── api/          # 将来の API アクセス層（通信処理は未実装）
│   ├── data/
│   │   └── scenario/     # シナリオデータ
│   ├── assets/
│   │   ├── backgrounds/ # 背景素材
│   │   ├── characters/  # キャラクター素材
│   │   ├── ui/          # UI 素材
│   │   └── audio/       # 音声素材
│   ├── types/            # 共通の型
│   └── main.tsx          # アプリケーションのエントリーポイント
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

シナリオの型は `src/types/scenario.ts`、仮データは `src/data/scenario/demo.ts` にあります。`src/features/story/progression.ts` が進行を判定し、`state.ts` がゲーム状態の初期化・遷移を担当し、`StoryPlayer.tsx` は React の `useReducer` を通して UI イベントを渡し、現在ノードを表示します。未使用ディレクトリは `.gitkeep` で保持しています。

シナリオは開始ノード ID とノード一覧を持ち、`dialogue`（会話）、`choice`（選択肢）、`end`（終了）を区別します。会話の `next` と選択肢ごとの `next` で遷移先を指定します。表示コンポーネントはシナリオを props で受け取ります。

Node.js 24 で進行・分岐のテストを実行できます。

```bash
node --test tests/*.test.mjs
```

## ID ベースの表示定義

シナリオの `stage` は `backgroundId`・`characterId`・`expression` を持ち、会話の `speakerId` から話者名を解決します。画像パスや人物の表示名はシナリオに記載しません。

`src/data/presentation.ts` に背景定義（ID・表示名・任意の `imageSrc`）とキャラクター定義（ID・表示名・表情一覧）を分離しています。各表情も ID・表示名・任意の `imageSrc` を持ちます。話者名はキャラクター定義から解決します。

現在は検証用 SVG を表示します。本番用ビジュアルではありません。`src/assets/backgrounds/office-afternoon.svg` と、`src/assets/characters/minato/`・`mio/` の画像を定義側で `new URL(..., import.meta.url).href` により参照しています。本番画像への差し替えも定義側の `imageSrc` だけで行え、シナリオ変更は不要です。

未登録の ID は代替名で表示します。画像が未設定または読み込みに失敗した場合も、背景・人物名・表情の表示を保持します。表情 ID は画面、背景・人物 ID は DOM の `data-*` 属性でも確認できます。

## 仮画像の確認方法

会話・分岐の仮シーンを選ぶと、事務所背景と佐伯湊の `normal` を表示します。会話を進めて「話を聞こう」を選ぶと `serious` に切り替わります。「先にコーヒーを頼む」では `normal` を維持し、相澤澪は `normal` を表示します。

画像読み込み失敗を目視確認する場合は、ブラウザーの開発者ツールで SVG リクエストをブロックし、キャッシュを無効にして再読み込みしてください。失敗した画像だけが非表示となり、背景の代替色・人物名・表情・会話操作を維持します。確認後はブロックを解除して再読み込みしてください。製品コードには検証専用の切替機能を追加していません。

未登録 ID・未登録表情・画像未設定は `tests/presentation.test.mjs` と `tests/stage.test.mjs` で確認しています。

## ADV の現在状態

`GameState`（`src/types/gameState.ts`）は `scenarioId`・`nodeId` に加え、`flags`・`heardTopics`・`inspectedTargets`・`acquiredInformation` を保持します。背景・キャラクター・表情・話者・選択肢・終了状態は現在ノードから導出し、重複して保存しません。

`src/features/story/state.ts` に初期化、現在ノードの導出、`advance`・`choose`・`reset` の状態遷移を集約しています。次ノードの判定自体は既存の `progression.ts` が担当します。シナリオを切り替える際は、その ID を StoryPlayer の `key` に指定して初期化します。

ゲーム状態は JSON 化できます。同じシナリオ定義があれば現在画面と話題・調査の進捗を再現できますが、会話全文の履歴は保持していません。セーブデータの検証は実装済みで、シナリオ改訂により参照先が削除された場合は復元を拒否します。LocalStorage への永続化と検証済み状態の復元を実装しています。バックログは未実装です。

## セーブデータ形式と検証

`SaveData`（`src/types/saveData.ts`）は `GameState` とは別型で、現在は version 2 で、シナリオ ID・ノード ID と4つの進捗項目を保存します。version 1 は進捗項目を空として復元します。表示情報や画像、React 固有の値は保存しません。

`src/features/story/saveData.ts` の `createSaveData(state)` が変換を行います。`restoreSaveData(input, scenarios)` は未知データを、形式・対応 version・シナリオ ID・ノード ID の順に検証します。`parseSaveData(json, scenarios)` は JSON の解析失敗も扱います。シナリオ一覧は呼び出し側で渡し、余分な項目は復元状態へ引き継ぎません。

成功は `{ ok: true, state }`、失敗は `{ ok: false, reason }` を返します。理由コードは `invalid-format`・`unsupported-version`・`unknown-scenario`・`unknown-node` です。失敗時の自動移動・リセットは行いません。

version 1・2 の読み込みに対応し、新規保存は version 2 です。進捗項目の型も検証し、ID 配列の重複を除去します。専用のセーブ／ロード画面は未実装です。

## LocalStorage のセーブ／ロード

画面左上の「メニュー」を開いて「セーブ」で現在位置を保存し、「ロード」で保存時点へ戻ります。ページ再読み込み後は初期画面から始まり、「ロード」を押すと復元できます。「セーブデータ削除」は保存データだけを削除し、現在の会話は変更しません。

保存キーは既存データを読み込むため `detective-saeki-minato.save.v1` を維持しています（キーの名前とデータ内 version は別です）。1スロットのみです。セーブは上書きされます。保存対象は version 付きの現在位置と進捗状態で、ロード時に既存の形式・version・参照先検証を通します。成功・保存なし・読み込み失敗・削除結果を画面に表示し、失敗時は現在位置を維持します。

`src/features/story/storage.ts` が保存・取得・検証・削除、`SaveControls.tsx` が操作とメッセージ、reducer の `restore` action が状態反映を担当します。ブラウザーの保存機能が拒否された場合や容量不足も失敗結果として扱います。

同じブラウザー・同じオリジン（ホストとポートを含む）でのみデータを共有します。ブラウザーデータの削除によってセーブも消えます。複数スロット、クラウド同期、オートセーブは未実装です。

動作確認は「会話を進める → セーブ → さらに進める → ロード → 保存位置へ戻る → 再読み込み → ロード → 削除 → ロードで保存データなし」の順で行えます。

## 第1部「依頼」の通し方

新規開始から「次へ」で事務所の日常・依頼人の来訪・依頼提示を読み、自由行動へ進みます。「聞く」で「兄について」「失踪について」「最近の兄について」「過去の事故について」を聞き終え、「考える」を選ぶと判断・依頼受諾・第1部完了へ進めます。その後の「次へ」で第2部開始用の仮ノードへ到達します。手動の状態変更は不要です。

「見る／調べる」の依頼人・兄の写真は補助調査です。情報不足での思考は自由行動へ戻り、途中セーブ・ロードでも継続できます。本番の台詞と第2部本編は未実装です。

## 自由行動の最小ループ

「聞く」から話題、「見る／調べる」から調査対象を選び、結果の会話で「次へ」を押すと状態更新を適用して自由行動メニューへ戻ります。「戻る」だけでは進捗を更新しません。「兄について」を聞くと `brother`・`brother_profile` を記録し、「最近の兄について」が表示可能になります。写真の調査は `photo`・`photo_date` とフラグを記録します。

仮データは `src/data/scenario/freeActionDemo.ts` にあります。通常の `dialogue`・`choice` に `topic`・`inspect` を追加し、会話や選択肢の `updates` に `setFlag`・`addHeardTopic`・`addInspectedTarget`・`addInformation` を指定できます。ID の追加は重複しません。

選択肢の任意の `condition` は `flag`・`heardTopic`・`inspectedTarget`・`hasInformation`・`hasAllInformation` の単一条件です。`freeAction.ts` が GameState から表示対象を導出し、reducer も未解放の選択を拒否します。解放済み話題の重複状態や汎用 AND/OR 式は持ちません。

「考える」は `acquiredInformation` を参照する `think` ノードで実装しています。情報なしは材料不足、一部取得は確認済み・不足情報を整理してメニューへ戻り、`brother_profile`・`disappearance_timing`・`last_known_activity`・`past_accident` が揃うと「単なる失踪ではない」と判断して依頼受諾シーンへ進みます。情報の総数だけでは受諾できません。

必須情報は「兄について」「失踪について」「最近の兄について」「過去の事故について」で取得します。「過去の事故について」は最近の兄の話を聞くと表示されます。思考内容と遷移先は仮シナリオで定義し、`thinking.ts` で現在状態から表示会話を導出します。複雑な推理・正解選択・ゲームオーバーは実装していません。

## 今後の検討

将来的に Android / iOS への展開と Backend API 連携を検討しています。現時点では Backend と API 通信処理は未実装です。モバイル対応、ルーティング、状態管理などの追加技術は、必要になった段階で選定します。

## UI の基本構成

背景をゲーム領域いっぱいに表示し、人物と下部の濃色・半透明の会話ウィンドウを重ねています。通常会話はクリック／タップ、またはフォーカス後の Enter／Space で進行します。右下の小さな送り記号が目印です。「考える」は背景を軽く暗くし、佐伯の内心として表示します。

自由行動の「聞く・調べる・考える」と話題・調査一覧は画面右側の専用領域に縦型表示します。操作中は下部の大きな選択パネルを出さず、背景を残します。条件付きで解放された未読項目は NEW、実行済みは既読／調査済みと表示し、再選択できます。NEW 通知の履歴は別途保存しません。

保存操作はゲーム画面左上の MENU にまとめています。開発用シーン切替はゲーム領域の下の DEV 欄へ分離し、常時タイトルや素材名のラベルは本編から外しています。画像未設定・失敗時の代替表示は維持しています。

人物は CSS の左・中央・右配置クラスで位置調整できる構造です。右側コマンドが出ている時は人物を左へ寄せます。人数を制御するエンジンは追加していません。本番画像投入後の人物サイズ・背景の切り抜き・会話とのバランスは未調整です。

UI の配色・MENU とコマンドの密度・文字とアイコンのサイズは `reference/ui/ui-reference.png` を参考にしています。参考画像を実装用アセットとして使用していません。人物・背景・衣装・画風は取り込んでいません。

PC版UIは1920×1080・16:9を基準に、画面内へ同比率で縮小します。会話は文字送り中の操作で全文表示し、次の操作で進みます。自由行動の既存3操作は短い選択表示後に遷移します。「調査記録」「タバコを吸う」「整理する」「移動」は現時点では未実装の無効表示で、ゲーム内日時も未設定です。表示寸法は `src/features/story/story.css` のCSS変数、文字送り速度は `DialogueWindow.tsx`、選択表示時間は `CommandButton.tsx` で調整できます。
