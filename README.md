# 探偵 佐伯湊 / Detective Saeki Minato

現代日本の探偵ADV。React・TypeScript・Viteを使用する。

現在のEpisode 01は**「消された記録」全30シーン**。通常のNEW GAMEから開始する。旧稿「灰色の証言」と第1部限定版の保存はCONTINUEから元のシナリオを再開できる。保存データを新稿へ自動変換・削除しない。

仕様・原稿・人物・素材・技術・開発手順は[ドキュメントの共通入口](docs/README.md)から必要な分野を選ぶ。[制作状態](docs/06-development/production-status.md)では実装済み・正式採用・未確認を区別し、[物語資料](docs/02-story/README.md)では現行30シーンと旧稿ver0.04／ver0.03の適用範囲を示す。

## 起動

Node.js・npmとGit LFS対象を取得した環境で、Windowsは` .\start-local.cmd `、Linuxは`sh ./start-local.sh`。初回は依存関係を導入する。ブラウザーで http://127.0.0.1:5187/ を開き、停止はWindowsで` .\start-local.cmd -Action stop `、Linuxで`sh ./start-local.sh stop`。状態確認は同じコマンドの`stop`を`status`に変える。起動コマンド終了後もサーバーはバックグラウンドで動作する。ポート指定やWSL環境は[開発環境](docs/06-development/development-setup.md)、テスト・Lint・ビルド・ブラウザー設定は[検証手順](docs/06-development/verification.md)を参照する。

通常はタイトル画面からNEW GAME／CONTINUE／SETTINGSを使用する。開発サーバーの`?dev=1`だけ本編直行とDEV確認を表示する。本編では会話窓・背景・人物クリックまたはEnterで文章を送り、文字送り中は全文表示、読了後は次ページまたは次の会話へ進む。[操作](docs/01-game-design/actions.md)と[保存](docs/01-game-design/save-and-settings.md)を参照する。

全編のローカルE2Eは`npm ci`、`npm run test:e2e:install`、`npm run test:e2e`。専用Viteを127.0.0.1:5290で起動し、PCとスマホ横画面のChromiumを検証する。既存テストとの違い・修正PRへの依存・失敗証跡は[検証手順](docs/06-development/verification.md#episode01-ローカルe2eplaywright-test)を参照する。

## 作業ルールと履歴

リポジトリの配置は次のとおり。仕様・制作資料と、本編のコード・素材をそれぞれの入口から辿る。

| 場所 | 内容 |
| --- | --- |
| [src/](src) | ゲーム本編のコード・シナリオ・ゲーム用素材 |
| [docs/](docs/README.md) | 仕様・原稿・人物・作画・開発資料 |
| [tests/](tests) | ゲームと保存互換性などの自動検証 |
| [tools/](tools) | 起動・Lint・配布確認などの開発用ツール |
| [.github/](.github) | CI・Issueテンプレート |

本編未接続の[演出試作](docs/04-art/prototypes/motion-study/README.md)は作画資料内、旧納品入口の[素材引継ぎ記録](docs/99-archive/art/delivery-handoff-2026-10-13.md)は履歴資料内に保持する。実行時に生成するログ・ビルド・一時出力はGitの管理対象にしない。

共通ルールは[AGENTS.md](AGENTS.md)。整理前の実装説明・検証時点・素材引継ぎの記録は[旧README](docs/99-archive/development/README-before-phase2a.md)に保持する。過去のブランチ状態を現在のmainの状態と混同しない。
