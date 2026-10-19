# ESLint・React Hooks検査

リポジトリルートから `npm ci --prefix tools/lint`、`npm run lint` を実行する。
通常のゲーム用依存は従来どおりルートの `npm ci` で導入する。CIは両方を導入する。

## 互換性と対象

typescript-eslint 8.71.2のTypeScript対応範囲は `>=4.8.4 <6.1.0`。
ゲーム用TypeScript 7.0.2を変更せず、Lint用TypeScript 6.0.3とツールをこのディレクトリの独立したpackage.json・lockfileで管理する。
peer依存を無視するインストールは行わない。型情報を使う追加規則は未導入で、ゲームの型チェックは引き続きルートの `tsc --noEmit` が担う。
将来、双方が同じTypeScriptを正式にサポートしたら依存の統合を検討する。更新時は両lockfileで `npm ci` と検証を行う。

対象は `src/**/*.{ts,tsx}`（DEV・シナリオを含む）、`vite.config.ts`、Lint設定自身。
既存のNodeテスト・制作スクリプト・試作は今回のLint範囲外で、既存テストの実行は継続する。
ESLint recommended、typescript-eslint recommended、React Hooks flat recommendedを使用する。
日本語の全角空白は文字列・テンプレート内のみ許可し、未使用変数はrest構文で除外するプロパティのみ許可する。
anyや通常の未使用変数、Hooks呼び出し順の検査は無効化しない。整形用規則・Prettierは導入しない。

Fast Refreshは開発中の更新境界を検査するもので、ゲーム進行の正しさを保証する規則ではない。
既存のクラスコンポーネントやコンポーネントと補助関数の混在exportの整理を伴うため、今回はプラグイン導入を見送る。

## 初回結果と段階的な解消

設定調整前は63ファイルで13エラー・3警告。

| 分類 | 指摘 | 対応 |
| --- | --- | --- |
| 要確認 | rules-of-hooks 2件 | 通常の操作関数useItemの名前による誤認。handleUseItemへ名称のみ変更 |
| 意図した表記・構文 | no-irregular-whitespace 5件、no-unused-vars 4件 | 日本語表示文字列とrestによるプロパティ除去を許可。表示・データは変更しない |
| 改善候補 | exhaustive-deps 3件 | 以下の既存警告として残す |
| 改善候補 | set-state-in-effect 1件、refs 1件 | StoryPlayerのみ警告へ変更。他のファイルは推奨エラー設定を維持 |

確認済みの実行時の重大不具合はない。残る警告は次の5件で、動作変更を伴う一括修正を避ける。

- SaveControls: cleanup内のdetails.current参照。Effect開始時の要素を保持する案を、メニュー終了とフォーカス復帰のテスト付きで検討する。
- StoryPlayer: DEVプレビュー用Effectの同期setState。プレビュー状態の責務を整理し、開閉と一時停止を検証する。
- StoryPlayer: キーボードEffectのdispatch依存。関数の安定化またはEffect内への処理移動を検討し、連打・履歴・復元を検証する。
- StoryPlayer: 描画時のrecordsButton.current参照。イベント時の参照取得等へ変更し、記録画面からのフォーカス復帰を検証する。
- SystemDialog: initialFocus依存。初期値として扱うか変更に追従するかを明確にし、ダイアログの再表示・閉じる操作を検証する。

CIのLintは必須ステップで、エラーまたは警告6件以上で失敗する（`--max-warnings 5`）。
警告は出力され続ける。これは総数の上限であり、同数の別の警告への置き換わりまでは検出しないためレビューでも確認する。
上記を小さなPRで解消するたび上限を減らし、最後にStoryPlayerの2規則を推奨のエラーへ戻し、上限0とする。

## 参照

- [typescript-eslint公式設定](https://typescript-eslint.io/getting-started/)
- [typescript-eslint対応バージョン](https://typescript-eslint.io/users/dependency-versions/)
- [React公式Hooks規則](https://react.dev/reference/eslint-plugin-react-hooks)
- [Fast Refresh規則](https://github.com/ArnaudBarre/eslint-plugin-react-refresh)
