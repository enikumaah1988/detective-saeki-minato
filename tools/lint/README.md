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

## 品質ゲートと既存警告の解消

CIのLintは必須ステップで、エラー・警告とも0件を要求する（`--max-warnings 0`）。
StoryPlayerに限定していたrefs・set-state-in-effectの警告扱いは撤廃し、全対象で推奨のエラー設定を使う。
警告上限の引き上げや規則の無効化で新しい問題を回避しない。

導入時は63ファイルで13エラー・3警告があり、日本語表示文字列とrestによるプロパティ除去の許可、通常関数useItemの名称修正後に5警告を残していた。次の修正で解消した。

- SaveControls: Effect開始時にフォーカス復帰先を取得し、cleanupでは接続中の同じ要素に戻す。
- StoryPlayer: DEVプレビューの新しい要求だけを、前回のpropと比較して描画確定前に反映する。Effectによる追加更新をなくし、同じ要求で閉じた画面が再表示されないようにする。
- StoryPlayer: dispatchをuseCallbackで定義し、キーボードEffectの依存に含めて最新の状態を使用する。
- InvestigationRecords: ボタンのrefはEffect内で読み取り、描画中には読み取らない。明示したDEVプレビューの呼出元を優先する。
- SystemDialog: initialFocusは初回表示用の指定として保持し、後続のprop変更でダイアログを再表示しない。

回帰確認には既存の入力・保存復元・記録テストと、tests/hooksLifecycleBrowser.test.mjsを使う。
後者はREADME記載の外部Playwright環境と開発サーバーを要し、StrictModeでプレビューの再要求、閉じた後の通常記録、MENU・ダイアログのフォーカス復帰、Enter入力と保存・復元を検証する。
tests/fixtures/hooksLifecycle.tsxは検証用で、本番アプリからは参照しない。

## 参照

- [typescript-eslint公式設定](https://typescript-eslint.io/getting-started/)
- [typescript-eslint対応バージョン](https://typescript-eslint.io/users/dependency-versions/)
- [React公式Hooks規則](https://react.dev/reference/eslint-plugin-react-hooks)
- [React公式・props変更時の一部状態の調整](https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
- [Fast Refresh規則](https://github.com/ArnaudBarre/eslint-plugin-react-refresh)
