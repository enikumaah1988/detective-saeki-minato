# Windows開発の案内

2026-10-11、ユーザー承認によりUI作業環境をWindowsへ集約。

| 用途 | フォルダ | ブランチ |
| --- | --- | --- |
| UI・必要なシステム変更 | ../saeki-ui-windows | work/ui-windows |
| キャラクター・素材制作 | ../saeki-talk-issue5 | art/main-characters |
| 旧UIスナップショット | ../saeki-ui-work | master（今後の作業先にしない） |
| 全体の進捗・統合判断 | このmanagementフォルダ | ローカル管理資料 |

新規UIフォルダはGitHubから独立cloneし、取得時点のorigin/main（34c36df）から作成。既存の素材作業とWSLフォルダは保持。UI用ブランチは未push、コミットは未作成。

## 起動・検証

プロジェクトのルートでPowerShellから実行する。

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\management\windows-ui.ps1 dev
```

http://127.0.0.1:5186 を開く。終了はCtrl+C。既存サーバーとの競合を避けるためUI用は5186を使用。上記のExecutionPolicy指定はその起動プロセスだけに適用する。

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\management\windows-ui.ps1 build
powershell -NoProfile -ExecutionPolicy Bypass -File .\management\windows-ui.ps1 test
```

依存再取得は同じコマンドの末尾をinstallにする。既存のCodex同梱Node v24.19.0と、management/toolsに取得したnpm v12.2.0を使用する。グローバルのNode/npm設定は変更していない。将来通常のNode/npmへ切り替える場合はUIフォルダでnpm ci / npm run dev / npm run buildを使用できる。

## 検証結果

- npm ci成功、ロックファイル変更なし。
- TypeScript型チェック・Vite本番ビルド成功。
- Nodeテスト98件: 成功74、失敗0、スキップ24。
- スキップ24件は外部Playwright/Chromiumを要するブラウザーテスト。Chromium未導入のためブラウザー画面・プレイは未確認。
- サンドボックス内の実行ではファイル参照制限が発生。通常権限で再実行し上記成功を確認。

## 次回の作業

### 2026-10-11 追加検証

- management/tools/playwright-browsersへ検証用Chromiumを導入し、Windowsでブラウザー24件を含む全98件成功、失敗・スキップ0を確認。
- 型チェック・ビルドを通常権限で再確認し成功。両PC解像度の実ブラウザー自動操作で新規開始から第1部終了まで通過。撮影画像も目視確認した。人間による通しプレイとは区別する。
- 詳細・再現スクリプト・ログ・画像は`ui-check-2026-10-11/確認結果.md`を参照。
- 上の「ブラウザー24件スキップ」は移行直後の記録。追加検証により確認済みとなったが、他ブラウザー・スマホは未検証。

UIを依頼する際は「saeki-ui-windowsで作業」と指定する。素材は従来どおりsaeki-talk-issue5。各機能の目的・完了条件を決めてから変更し、コミット・PR単位で統合する。

人物素材の取り込みは別タスクとし、neutral/normal対応、人物登録、表示位置・サイズを確認する。フォルダ全体の上書きは行わない。WSLの既存LocalStorageセーブはブラウザーのオリジンに依存するため、自動移行を確認したとは扱わない。
