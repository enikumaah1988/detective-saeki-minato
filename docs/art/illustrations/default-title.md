# デフォルト扉絵（2026-10-18）

今回のユーザー依頼により、新規生成保留の例外として扉絵1枚だけを制作・接続。正式採用の最終判断はユーザーが行う。

画像正本: `src/assets/images/illustrations/default-title.png`。内蔵 image_gen を1回使用。参照はユーザー添付の「写真1.jpg」（構図・雰囲気）と現行 `characters/minato/full/neutral.png`（人物・画風）。生成画像は1672×941、文字なし。再生成・代替素材の使用なし。

参照仕様: 素材制作ガイド、minato/profile.md の最新基準、READMEの導入→扉絵→日常と部間8箇所の構成。38歳・眼鏡・うねる黒髪・無精髭・白シャツ・緩い黒ネクタイと劇画調を維持。

React側で「探偵 佐伯湊」「DETECTIVE SAEKI MINATO」「第1話 灰色の証言」を右側へ重ね、既存の部名も小さく残す。専用画像はノード指定→話別レジストリ→共通画像の順。専用画像の読込失敗時も共通画像へ戻す。既存の進行、メッセージ、セーブ形式は維持。

## 生成プロンプト

Use case: illustration-story. Create exactly ONE new 16:9 landscape default key visual for Japanese detective game. Input image 1 is composition/mood reference ONLY: seated detective on LEFT in nighttime office, desk coffee foreground, city windows, right side open for typography. Input image 2 is the CANONICAL character identity and hand-drawn gekiga rendering reference. Preserve image 2's Japanese man age38, softly wavy black hair falling near brows, thin dark rectangular GLASSES, light stubble, lean face/body, charcoal jacket, white shirt and loose black tie. Match image 2's mature detailed hand-drawn ink and restrained painterly texture, not photorealistic. He sits thoughtfully on LEFT half of frame, hand near face holding a slim electronic cigarette, faint curling vapor, calm hardboiled gaze. Night detective office with warm desk lamp left, dark coffee mug and papers in foreground, cool blue gray urban skyline through windows. Follow image1's balanced cinematic composition and quiet mood. RIGHT 43 percent is uncluttered dark soft-focus city window negative space for React title overlay, particularly x58-94% y36-67%. No additional people. No text whatsoever, no letters, no logos, no episode names, no watermark, no lettering on papers or wall. Single finished wide illustration only.

## 検証

- `node --test --test-isolation=none tests/*.test.mjs`: 132成功・失敗0・ブラウザー61件スキップ。初回は既存依存キャッシュへのアクセス制限で失敗したため、制限外で同一コマンドを再実行し成功。
- `npm run build`: 型チェックとビルド成功。500kB超のチャンク警告あり。
- `chapterIllustrationBrowser.test.mjs`: Chromium 1920×1080・1366×768の2件成功。全8扉絵、タイトル右配置、画像のロード、失敗時のデフォルト復帰、保存からの復帰と進行を確認。両サイズのスクリーンショットを目視確認。
- 既存の依存関係を使用。npm ciは再実行していない。Firefox/Safariは未検証。
