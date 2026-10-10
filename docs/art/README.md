# 素材制作ガイド
更新日：2026-10-11。画像と人物仕様を一か所で管理する。

## 正本
- 人物プロフィール・採用状態：src/assets/images/characters/<id>/profile.md。
- 試作・確認シート・生成条件：同階層の drafts/。
- 正式ゲーム画像：同階層の neutral.png、smile.png 等。現在は未制作。
- [制作手順](character-workflow.md)、[人物テンプレート](character-template.md)、[表情辞書](expression-framework.md)。
- [最新シート一覧](expression-review.md)。

## 配置と運用
画像ルートは src/assets/images/。characters、backgrounds、maps、items、cutins、illustrations、ui を必要に応じ追加する。不要な空フォルダを量産しない。
人物フォルダに profile.md と drafts/。背景等も場所・素材ごとに仕様と drafts/ を置ける。
同一画像の正式採用時は drafts/ から移動・命名し、コピーを二重に維持しない。過去の正式版はGitの履歴で追う。
確認シートは個別立ち絵とは用途が異なるため drafts/ に残す。
主要5人の試作を移行済み。ゲーム実装、シナリオ、デモ用SVG・cutinは変更していない。
既存コードの src/assets/characters 等への参照は維持。正式素材の組み込み時に対応表を更新する。
production/ は管理対象として廃止。sources/ は読取専用。
history/ は移行前MDの履歴で更新しない。旧配置・未制作・未採用の記述より現行プロフィールを優先する。
migration-manifest.json は移行画像・生成条件のSHA-256。全件一致を確認した。

## Git
制作ごとに art/<内容> の短期ブランチを作り、画像と仕様を一緒にPRへ出す。確認後mainへ統合。mainへの直接コミット・自己マージはしない。
人物PNGはGit LFS管理。取得環境にも git lfs install と git lfs pull が必要。
非公開設定は内部制作資料。公開資料や生成プロンプトへ流用しない。このリポジトリは移行時点でprivate。
