# EXP-001 Issue駆動型AI開発の検証

状態: 実施済み
作成日: 2026-10-09
実施日: 2026-10-10
関連: [開発方式の変遷](../../07-decisions/ai-development.md)、[GitHub Issue #2](https://github.com/enikumaah1988/detective-saeki-minato/issues/2)

## 目的
人間が詳細な実装プロンプトを毎回作らず、CodexがGitHub Issueと既存仕様から作業を進められるか確認する。

## 仮説
目的、対象範囲、仕様書リンク、受入条件が明確なIssueを与えれば、Codexは実装方針の調査、実装、テスト、PR作成まで自律的に進められる。

## 方法
Issue #2の受入条件に沿って、指定worktree experiment/exp-001 の状態、AGENTS.md、Free Action仕様、進行ロジック、既存テストを確認した。0件時の復帰処理と境界テストが既に実装済みかを検査し、重複するコード・テストを追加せず、Issue駆動実験の測定結果をこの記録へ残す方針とした。

## 結果

- Issue URL: https://github.com/enikumaah1988/detective-saeki-minato/issues/2
- PR URL: https://github.com/enikumaah1988/detective-saeki-minato/pull/3
- 開始・終了: 2026-10-10、開始時刻未計測／完了時刻未計測
- 人間の追加指示回数: 0
- 実行許可の追加確認: 7回（指定worktreeへのnpm ci、テスト、build。worktreeが書き込み許可範囲外だったため）
- Codexが自律完了した工程: Issue・仕様・コード・テスト調査、既存実装の受入条件照合、依存導入、全Nodeテスト、型チェック・build、実験記録更新、PR作成
- 実装修正: なし。Issueの対象機能と境界テストがすでに受入条件を満たしていたため、重複変更を避けた。
- Nodeテスト: `node --test --test-isolation=none tests/*.test.mjs` — 76件中69件成功、失敗0件、7件スキップ。Playwright/Chromiumを指定するブラウザーテストが未設定のためスキップ。
- ビルド: `npm run build` — TypeScript型チェックとVite build成功。
- ブラウザーテスト: 未実行（Issue受入条件の必須確認ではなく、外部Playwright/Chromium環境をこのworktreeでは設定していない）。
- 変更範囲: この実験記録のみ。ゲーム仕様・GameState・SaveData version 2は変更なし。
- レビュー修正回数: 0

## 受入条件との対応

- Free Actionで選択可能項目が0件の場合、シナリオ定義の`empty`が唯一の復帰手段として表示され、指定会話へ遷移することを `tests/playback.test.mjs` と `tests/pcBrowser.test.mjs` で確認。
- 選択可能項目が残る間のcontinue拒否、復帰先の欠落検出を同じ進行テストで確認。
- 条件変更後、遷移後、同じノードへ再訪した後の古い選択入力拒否を `tests/playback.test.mjs` で確認。
- 仕様・SaveData形式に変更なし。

## 結果と考察

仮説を支持する結果となった。Issueの目的と対象が明確だったため、現行実装を再調査して重複修正が不要と判断し、既存テストを受入条件へ対応付けて検証できた。PRで調査根拠・スキップ範囲をレビュー可能にする。

作業を妨げた要因は、指定worktreeが実行環境の通常書き込み許可範囲外だったこと。依存導入とViteテスト・buildでは追加の実行許可が必要となった。これは仕様判断による追加指示ではなく、環境権限の承認である。

## 次回の改善

作業開始時に選択worktreeの書き込み権限と、ブラウザーテスト環境の有無を確認する。Issueの条件を既存テストへ対応付ける調査を、実装修正より先に行う手順は有効だった。
