# 検証手順とCI

ゲームの既存チェックを使用する。実行結果は当該PRへ記録し、文書内の過去件数を今回の成功と扱わない。

~~~sh
npm ci
node --test --test-isolation=none tests/*.test.mjs
npm ci --prefix tools/lint
npm run lint
npm run build
~~~

- lint依存は[tools/lint](../../tools/lint/README.md)でゲーム用TypeScriptから分離する。警告上限を引き上げて隠さない。
- ブラウザーは外部Playwright／Chromiumが必要。SAEKI_PLAYWRIGHT_PATHにモジュール、SAEKI_PART1_URLに本編URL、SAEKI_BASE_URLに旧デモURL（?scenario=gray-testimony-part1-demo付き）を指定する。各テストの通常タイトル／DEV直行の前提を確認する。未設定のブラウザー項目はスキップであり確認済みではない。
- PCの主な確認サイズは1920×1080・1366×768。Firefox／Safari・スマホの実機保証と区別する。人の所要時間・難易度・没入感は自動完走だけでは確認できない。
- ブラウザーサーバーはロジックテストと別のViteキャッシュを使い、終了時は自分が開始したものだけを止める。環境固有の[Windows設定](../../tools/windows-vite.config.mjs)を一般環境へ無条件に適用しない。
- 文書整理ではMarkdownリンク・相対パス・参照・非対象ファイルの保持を確認し、影響に応じた既存テストを選ぶ。アプリ挙動を変えない文書変更でゲームのビルドや全ブラウザーを省略した場合は、その理由をPRに記す。

既存[GitHub Actions](../../.github/workflows/ci.yml)はPRとmainへのpushで、LFS取得、Node 24、npm ci、Nodeテスト、分離lint、型チェック・ビルドを実行する。CIが成功しても、環境未指定でスキップされたブラウザーを確認済みとしない。

## 配布用ビルドの確認

Git LFS素材・依存関係と外部Playwright／Chromiumを用意し、`SAEKI_PLAYWRIGHT_PATH`を設定して`npm run test:distribution`を実行する。Chromiumの格納先を既定から変えた環境では`PLAYWRIGHT_BROWSERS_PATH`も指定する。このコマンドは型チェックと本番ビルド後、`dist`だけを一時的な静的HTTPサーバー（127.0.0.1・空きポート）で配信し、終了時にブラウザーとサーバーを閉じる。開発サーバーの起動や`SAEKI_PART1_URL`の設定は不要。

- 全配布画像・フォントのHTTP取得、Content-Type・ファイルヘッダー・LFSポインター混入を検査する。
- Chromiumの1366×768でタイトル画像、新規開始、会話進行、画面操作によるSAVE、再読み込み後のCONTINUE、保存位置・履歴・音量設定の維持を確認する。`?dev=1`でもDEV操作が表示されないこと、ブラウザー例外・HTTPエラーがないことも検査する。
- 明示コマンドはPlaywright未設定、Chromium未導入、ビルド失敗、検証失敗で非ゼロ終了する。通常のNodeテスト一括実行ではPlaywright未設定時にこのブラウザー項目をスキップする。既存CIは外部ブラウザー未設定のため配布ブラウザー検証を保証しない。

手動確認は`npm run build`後に`npm run preview -- --host 127.0.0.1`で表示されたHTTP URLを開く。サーバー停止はCtrl+C。配布物は`dist`全体であり、現行設定の配置先はHTTPサイトのルート（`/`）。`file://`でHTMLを直接開く方式は対象外。サブディレクトリ配信は現行の既定設定で保証せず、配信先に合わせたViteのbase設定と再ビルド・別検証を要する。

この確認は配布物からの基本起動と保存復帰を対象とし、全シナリオ完走、全画像の目視品質、音素材の再生、Firefox／Safari・スマホ実機・外部ホスティング固有の設定まで確認済みとは扱わない。

由来：既存ルートREADME、AGENTS.mdの検証節、[旧開発タスクの型](../project-management/開発タスクの型.md)、現行ci.yml。検証の新しい承認ルールを追加する文書ではない。
