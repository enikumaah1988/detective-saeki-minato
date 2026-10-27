# 作画・画像・素材の入口

この分類は作画・画風・衣装・人物の向き・画像仕様・素材管理を扱う。人物像・口調・関係は[03 人物](../03-characters/人物設定.md)、物語上の演出意図は[02 物語](../02-story/README.md)を参照する。

## 現行の参照先

- [30シーン稿の追加場所・人物](episode-01-30-scene-additions.md)：追加7人の通常修正版と4背景をゲームへ接続。湊・澪を画風基準とし、生成条件・profile・確認ページを管理。藤井・沙織は登場未追加の準備素材。表情差分は後続。

- [素材制作ガイドと人物profile](production-guide.md)、[人物ごとの資料](characters)。原文には制作当時の状態を含む。画風採用、個別画像の最終採用、ゲーム組み込みを区別する。
- [表情切り替えの指定方法](character-expressions.md)。既存画像の明示指定を使い、台詞から感情を自動推測しない。配置・表示条件は変更しない。
- [最新画風の取り込み](character-refresh-2026-10-13.md)、[86素材manifest](manifests/imported-character-assets.json)、[追加素材manifest](manifests/imported-revision-assets.json)。生成条件・原本・ハッシュを保持する。
- [人物表示の引継ぎ](character-display-handoff.md)、[向きの履歴と新画風への注意](character-orientation-handoff-summary.md)。旧画風の向きの観察を新素材の保証に使わない。反転で衣装・時計・バッグの左右を変えない。
- [背景](backgrounds/README.md)、[扉絵](illustrations/README.md)、[持ち物](items/README.md)、[地図と出典](maps/geographic/README.md)。完成素材の採用と試作・検証は別管理。

## 所在と管理責任

- 制作資料・試作・生成条件・検証記録はこの04-artに配置する。人物別の仕様と採用状態は各profile、背景・扉絵・持ち物・地図は各分野の入口を確認する。従来の素材ガイドは[production-guide](production-guide.md)に保持した。そこにある日付付きの状態は制作当時の記録として読む。
- ゲームが読み込む画像の正本は`src/assets/images/`（背景・人物・挿絵・UI等を用途別に分類）。この整理で画像を再生成・再圧縮・再採用していない。制作資料とゲーム画像の異なる用途を維持する。
- 取り込み先・ハッシュ・由来・採用状態は[人物manifest](manifests/imported-character-assets.json)と[追加素材manifest](manifests/imported-revision-assets.json)。旧背景の生成条件は[旧プロンプト](backgrounds/legacy-background-prompts.json)に保持する。パスは原則リポジトリ基準、素材内の短いファイル名は対応スクリプトの解決方法に従う。
- 生成・書き出し・検証スクリプトは関連素材と同居させる。画像の出力・既存JSONの上書き・ファイル移動を行うものもあるため、配置確認のために無条件実行しない。外部の生成原本や旧作業環境を必要とする手順も含む。
- 絶対パスは当時の制作元、記録されたSHA-256は当時の内容の識別子として保持する。`migration-manifest.json`等の旧記録と現在の素材の一致は別途確認する。リンク修復したMarkdownの現行ハッシュで過去のハッシュを上書きしない。
- シナリオJSON・取り込み記録・Free Action参照一覧は[02-story/episode-01](../02-story/episode-01/README.md)。物語・人物設定の採否を素材側だけで更新しない。

Phase 2-Bでは既存構造を保って配置・参照・LFS設定を更新した。履歴、drafts、外部原本の記録は一括削除していない。Phase 3の運用ルール整備は別工程。

人物・背景・イベントCGの新規生成は既存ルールどおり保留。資料を読めるようにしたことは制作再開の許可ではない。
