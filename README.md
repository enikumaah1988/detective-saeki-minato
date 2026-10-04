# 探偵 佐伯湊 / Detective Saeki Minato

## 概要

「探偵 佐伯湊 / Detective Saeki Minato」は、現代を舞台にした探偵アドベンチャーゲーム（ADV）の個人開発プロジェクトです。現在は、ローカルシナリオを使った最小 ADV の会話・選択肢分岐を実装しています。

React + TypeScript + Vite の最小構成を導入済みです。バックエンドは未実装で、将来の API 連携に向けたディレクトリを用意しています。

## 実装済みの最小 ADV

- 検証用 SVG による背景・立ち絵表示と、画像未設定・読み込み失敗時のプレースホルダー表示
- 話者名とセリフの表示、「次へ」ボタンでの会話進行
- 2つの選択肢による会話分岐、終了後の「最初から」操作
- 型付きのローカルシナリオデータと UI・進行ロジックの分離

起動すると、動作確認用の仮シーンを表示します。本編「灰色の証言」の正式シナリオではありません。選択肢を選ぶまでは会話が進まず、選択後に異なる2セリフを経て終了します。

Backend / API 通信、セーブ・ロード、音声・BGM・SE、Android / iOS 対応は未実装です。

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

`npm run dev` で起動すると、事務所背景と佐伯湊の `normal` を表示します。会話を進めて「話を聞こう」を選ぶと `serious` に切り替わります。「先にコーヒーを頼む」では `normal` を維持し、相澤澪は `normal` を表示します。

画像読み込み失敗を目視確認する場合は、ブラウザーの開発者ツールで SVG リクエストをブロックし、キャッシュを無効にして再読み込みしてください。失敗した画像だけが非表示となり、背景の代替色・人物名・表情・会話操作を維持します。確認後はブロックを解除して再読み込みしてください。製品コードには検証専用の切替機能を追加していません。

未登録 ID・未登録表情・画像未設定は `tests/presentation.test.mjs` と `tests/stage.test.mjs` で確認しています。

## ADV の現在状態

`GameState`（`src/types/gameState.ts`）は `scenarioId` と `nodeId` のみを保持します。背景・キャラクター・表情・話者・選択肢・終了状態は現在ノードから導出し、重複して保存しません。

`src/features/story/state.ts` に初期化、現在ノードの導出、`advance`・`choose`・`reset` の状態遷移を集約しています。次ノードの判定自体は既存の `progression.ts` が担当します。シナリオを切り替える際は、その ID を StoryPlayer の `key` に指定して初期化します。

ゲーム状態は `JSON.stringify(gameState)` でシリアライズできます。同じシナリオ定義があれば現在画面を再現できますが、分岐の履歴は保持していません。セーブデータの検証は実装済みで、シナリオ改訂により参照先が削除された場合は復元を拒否します。現時点では永続化・セーブ・ロード・バックログは未実装です。

## セーブデータ形式と検証

`SaveData`（`src/types/saveData.ts`）は `GameState` とは別型で、現在は `{ version: 1, scenarioId, nodeId }` の最小形式です。表示情報や画像、React 固有の値は保存しません。

`src/features/story/saveData.ts` の `createSaveData(state)` が変換を行います。`restoreSaveData(input, scenarios)` は未知データを、形式・対応 version・シナリオ ID・ノード ID の順に検証します。`parseSaveData(json, scenarios)` は JSON の解析失敗も扱います。シナリオ一覧は呼び出し側で渡し、余分な項目は復元状態へ引き継ぎません。

成功は `{ ok: true, state }`、失敗は `{ ok: false, reason }` を返します。理由コードは `invalid-format`・`unsupported-version`・`unknown-scenario`・`unknown-node` です。失敗時の自動移動・リセットは行いません。

現時点では version 1 のみ対応しています。将来のバージョン移行、永続化先、セーブ／ロード UI は未実装です。

## 今後の検討

将来的に Android / iOS への展開と Backend API 連携を検討しています。現時点では Backend と API 通信処理は未実装です。モバイル対応、ルーティング、状態管理などの追加技術は、必要になった段階で選定します。
