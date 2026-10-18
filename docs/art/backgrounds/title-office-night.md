# タイトル画面専用・夜の探偵事務所

2026-10-18のユーザー依頼により制作。新規生成保留の例外は今回のタイトル専用背景1枚に限定する。

成果: [title-office-night-01.png](drafts/title-office-night-01.png)。扉絵と同じ1672×941。文字・ロゴ・メニュー・人物なし。ゲームへの接続・正式採用は未実施。既存の事務所背景とReactコードは変更していない。

## 参照と整合性

- `src/data/presentation.ts` から現行の事務所背景を確認し、`src/assets/backgrounds/office-day.png` と `office-evening.png` を目視確認。
- `docs/art/backgrounds/README.md` の「左の書棚・机・ソファ、中央窓、右の書類棚・入口」を優先。
- 添付画像は雰囲気と中央のタイトル・メニュー配置の参考のみ。添付の机・照明配置は現行背景と異なるため、制作前に報告し、既存背景の配置を維持した。
- 同じ室内の窓寄りにわずかに寄った専用フレーミング。茶色の窓枠・ブラインド、左の書棚と執務机・照明・ソファ、右の書類棚・植物・コート掛け・傘立て・額・入口、床とラグを照合。未確認の壁・窓・扉や家具を追加していない。
- 夜の青灰色と左の机上灯を基調に低彩度で描画。中央の窓・壁・床は暗く抑え、ロゴを上中央、メニューを中央下に重ねる想定。実際の文字サイズ・色に対する視認性はタイトル画面実装時に確認する。

## 制作・検証

内蔵image_genを1回使用。入力1は現行office-evening.png（構造と画風の正本）、入力2はユーザー添付の写真1.jpg（雰囲気・文字領域の参考）。完成画像を目視照合し、PNGヘッダーで1672×941を確認。既存事務所3画像のSHA-256が制作前後で一致。

ゲームコード・依存関係の変更がないため、npm ci・回帰テスト・ビルドは未実行。タイトル画面への実装・ブラウザー検証は今回の対象外。

## 生成プロンプト

Use case: illustration-story. Produce exactly ONE dedicated title-screen BACKGROUND for Japanese detective game, empty nighttime detective office, wide 16:9, output 1672 x 941 pixels matching the game's cover. INPUT IMAGE 1 (existing office evening) is the AUTHORITATIVE ROOM GEOMETRY, furniture identities and placement, architecture and semi-realistic painterly low-saturation visual style. INPUT IMAGE 2 (user title mockup) is ONLY a reference for quiet nocturnal hardboiled mood and central title/menu legibility; NEVER copy its room layout, desk placement or lamp placement, and do NOT reproduce any text. Dedicated title framing: a modest push-in / slightly tighter view toward the EXISTING broad central window from the same front-of-room side, retaining the same spatial relationships, no reversed angle. Preserve the established LEFT tall wooden file-filled bookcase with trailing plant, LEFT large wooden executive desk and black office chair with papers, laptop, coffee and adjustable dark/brass task lamp on desk, LEFT foreground dark leather sofa and low coffee table; broad brown wood framed window and horizontal blinds on rear central wall; RIGHT existing low dark filing cabinets with plants, coat stand and dark coat, umbrella holder, framed monochrome city picture and existing brown wood door with frosted glass at far right. Same blue-gray walls, wood trim and worn glossy wood floor, blue-gray rug. Do not move furniture to center, do not invent walls, windows or doors or change room structure. Keep desk lamp on LEFT with desk exactly as original. Night time only, restrained cool blue-gray ambient city lights through SAME window and SAME ordinary midrise buildings, limited warm pool from existing desk lamp, lights off elsewhere, still and contemplative, semi-realistic environmental painting matching image1, not anime character art and not a photograph. Crucial central overlay safe area x32%-68% y16%-78%: use naturally dark, quiet, low contrast window/blinds and plain shaded floor/wall, gently soften distant detail and subordinate blind contrast, no bright building lights, no bright reflection, no focal object or harsh light in the center. Preserve architecture rather than creating a blank artificial panel; attractive readable title background even without text. No people or silhouettes, no new props, no rain added, no telephone added, no smoke, no readable text anywhere including papers, no logos, no title, no menu, no watermark. Produce just one finished image.
