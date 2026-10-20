# 作画・画像・素材の入口

この分類は作画・画風・衣装・人物の向き・画像仕様・素材管理を扱う。人物像・口調・関係は[03 人物](../03-characters/人物設定.md)、物語上の演出意図は[02 物語](../02-story/README.md)を参照する。

## 現行の参照先

- [素材制作ガイドと人物profile](../art/README.md)、[人物ごとの資料](../art/characters)。原文には制作当時の状態を含む。画風採用、個別画像の最終採用、ゲーム組み込みを区別する。
- [表情切り替えの指定方法](character-expressions.md)。既存画像の明示指定を使い、台詞から感情を自動推測しない。配置・表示条件は変更しない。
- [最新画風の取り込み](../character-refresh-2026-10-13.md)、[86素材manifest](../imported-character-assets.json)、[追加素材manifest](../imported-revision-assets.json)。生成条件・原本・ハッシュを保持する。
- [人物表示の引継ぎ](../art/character-display-handoff.md)、[向きの履歴と新画風への注意](../character-orientation-handoff.md)。旧画風の向きの観察を新素材の保証に使わない。反転で衣装・時計・バッグの左右を変えない。
- [背景](../art/backgrounds/README.md)、[扉絵](../art/illustrations/README.md)、[持ち物](../art/items/README.md)、[地図と出典](../art/maps/geographic/README.md)。完成素材の採用と試作・検証は別管理。

## Phase 2-Aの境界

既存のart配下、画像、LFS対象、JSON、制作スクリプトは移動していない。この入口だけを番号付き分類へ置き、実体へのリンクは旧パスを維持する。画像・JSON・ツール・LFS設定を一体で整理するのは、2-Aレビュー・マージ後に着手判断するPhase 2-B。

人物・背景・イベントCGの新規生成は既存ルールどおり保留。資料を読めるようにしたことは制作再開の許可ではない。
