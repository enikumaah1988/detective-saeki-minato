# 探偵 佐伯湊 / Detective Saeki Minato

## 概要

「探偵 佐伯湊 / Detective Saeki Minato」は、現代を舞台にした探偵アドベンチャーゲーム（ADV）の個人開発プロジェクトです。現在は、ローカルシナリオを使った最小 ADV の会話・選択肢分岐を実装しています。

React + TypeScript + Vite の最小構成を導入済みです。バックエンドは未実装で、将来の API 連携に向けたディレクトリを用意しています。

## 実装済みの最小 ADV

- 背景・キャラクターのプレースホルダー表示
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

シナリオの型は `src/types/scenario.ts`、仮データは `src/data/scenario/demo.ts` にあります。`src/features/story/progression.ts` が進行を判定し、`StoryPlayer.tsx` が React 標準の状態管理と表示を担当します。未使用ディレクトリは `.gitkeep` で保持しています。

シナリオは開始ノード ID とノード一覧を持ち、`dialogue`（会話）、`choice`（選択肢）、`end`（終了）を区別します。会話の `next` と選択肢ごとの `next` で遷移先を指定します。表示コンポーネントはシナリオを props で受け取ります。

Node.js 24 で進行・分岐のテストを実行できます。

```bash
node --test tests/story.test.mjs
```

## 今後の検討

将来的に Android / iOS への展開と Backend API 連携を検討しています。現時点では Backend と API 通信処理は未実装です。モバイル対応、ルーティング、状態管理などの追加技術は、必要になった段階で選定します。
