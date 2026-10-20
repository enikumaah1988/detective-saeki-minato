# ドキュメントの入口

目的に合う正本だけを選んで読む。ここは現行仕様・制作資料・履歴の入口であり、全資料の一括読み込みリストではない。

| 分野 | 最初に読む文書 | 適用範囲 |
| --- | --- | --- |
| 01 ゲーム仕様 | [PC UI](01-game-design/pc-ui.md)、[操作・会話](01-game-design/actions.md)、[保存・設定の操作](01-game-design/save-and-settings.md)、[タイトル](01-game-design/title-screen.md)、[移動](01-game-design/map.md) | プレイヤーに見える表示・操作 |
| 02 物語 | [物語資料](02-story/README.md)、[Episode 01の適用範囲](02-story/episode-01/README.md) | 事件・場面・原稿・話別の進行条件 |
| 03 人物 | [人物設定と採否](03-characters/人物設定.md) | 作品共通の人物像・口調・呼称・関係。相談稿は未採用部分を含む |
| 04 作画・素材 | [作画資料への入口](04-art/README.md)、[表情指定](04-art/character-expressions.md) | 作画・画像・向き・制作スクリプト・取り込みmanifest。ゲーム用画像はsrc/assets配下 |
| 05 技術設計 | [状態とシナリオ](05-architecture/state-and-scenario.md)、[保存データ](05-architecture/save-data.md) | 共通の状態遷移・データ契約・保存互換 |
| 06 開発 | [環境と起動](06-development/development-setup.md)、[検証](06-development/verification.md)、[担当・依頼](06-development/workflow.md)、[現状](06-development/production-status.md)、[ロードマップ](06-development/roadmap.md) | 開発手順・現在状態・優先順位 |
| 07 重要判断 | [AI開発方式の変遷](07-decisions/ai-development.md) | 長期的な判断理由。現行手順は06、実装許可はAGENTS.mdと依頼を確認 |
| 99 履歴 | [履歴・保留資料](99-archive/README.md) | 旧仕様、作業当時の結果、未整理資料。現行仕様を上書きしない |

## 正本の読み分け

- 新しい現行仕様の参照先は上表。日付付きの追加修正資料を順番に読む運用から、分野別の正本を読む構成へ整理した。各正本の末尾に統合元を示す。
- 制作原稿・採用済み仕様・実装状況は別の軸。コードだけで人物設定・物語・素材の正式採用を決めない。暫定値と未採用案は明記したまま維持する。
- Episode 01はver0.04の第1部・第2部接続と、ver0.03の第3～4部を保持する。JSONは原稿と同じ02-story/episode-01へ移動したが、意味内容・版の適用範囲は変更していない。
- 配置整理の根拠と承認範囲は[Issue #198](https://github.com/enikumaah1988/detective-saeki-minato/issues/198)。Phase 2-AはMarkdown整理、2-Bは素材・JSON・制作ツール、3は運用ルール整備。後続工程への自動着手を意味しない。
- リポジトリ共通の作業・承認ルールは[AGENTS.md](../AGENTS.md)。今回は移動した参照パスだけを修正し、運用ルールの変更は行わない。
