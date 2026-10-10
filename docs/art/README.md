# 素材制作ガイド
更新日：2026-10-11。

## 制作資料の正本
- 人物仕様・採用状況：docs/art/characters/<id>/profile.md。
- 採用した設定資料：同階層の sheet.png と sheet-prompt.md。採用が確定したら作成する。
- 未採用・比較用の試作と生成条件：同階層の drafts/。
- [制作手順](character-workflow.md)、[人物テンプレート](character-template.md)、[表情辞書](expression-framework.md)。
- [最新シート一覧](expression-review.md)。

## ゲーム素材
実際にゲームで使う画像のみ src/assets/images/ に配置する。
characters/<id>/neutral.png、smile.png 等を基本とし、backgrounds、maps、items、cutins、illustrations、ui は必要に応じて追加する。
現在、制作した個別透過全身素材は未完成。既存デモ素材とその実装上の参照は変更していない。

## 設定資料シートの運用
1. 試作中の確認シートは drafts/ に保存する。
2. 設定資料として採用されたら sheet.png へ移動し、対応する生成条件を sheet-prompt.md に移す。コピーは残さない。
3. profile.md に「設定資料として採用」「ゲーム素材は制作中」など用途別の状態を記録する。
4. ゲーム画像は profile.md と採用シートを参照して新たに制作する。確認シートの切り抜きを完成素材と扱わない。
5. sheet.png の更新時は旧版をGitの履歴で追う。必要になった場合だけ sheets/ に分ける。
現行5人の確認シートは採用未確定のため drafts/ に保持。sheet.png が存在すると仮定しない。
同一画像を二か所にコピーして維持しない。人物仕様も profile.md を唯一の現行正本にする。

## 履歴・Git
history/ は移行前の判断履歴で更新しない。旧状態より現行プロフィールと本ガイドを優先する。
migration-manifest.json は移行した画像・生成条件の現在の保存先とSHA-256。移行時に全件一致を確認。
production/ は廃止。sources/ は読取専用。
制作は art/<内容> の短期ブランチで行い、画像と仕様を同じPRへ出す。mainへ直接コミット・自己マージしない。
制作資料PNGとゲームPNGはGit LFS管理。取得環境にも git lfs install と git lfs pull が必要。
非公開設定を公開資料や生成プロンプトへ流用しない。移行時点のGitHubリポジトリはprivate。
