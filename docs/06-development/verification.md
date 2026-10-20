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

由来：既存ルートREADME、AGENTS.mdの検証節、[旧開発タスクの型](../project-management/開発タスクの型.md)、現行ci.yml。検証の新しい承認ルールを追加する文書ではない。
