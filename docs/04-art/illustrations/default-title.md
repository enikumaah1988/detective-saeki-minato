# デフォルト扉絵（2026-10-18）

今回のユーザー依頼により、新規生成保留の例外として扉絵1枚だけを制作・接続。正式採用の最終判断はユーザーが行う。

画像正本: `src/assets/images/illustrations/default-title.png`。初回は内蔵 image_gen を1回使用。参照はユーザー添付の「写真1.jpg」（構図・雰囲気）と現行 `characters/minato/full/neutral.png`（人物・画風）。生成画像は1672×941、文字なし。後続のユーザー指摘により、内蔵image_genで1回だけ手元を編集し、ゲーム内の持ち物 `items/electronic-cigarette.png` と同じ黒いポッド型電子タバコへ修正。紙巻きの白い筒・火種・立ち上る煙を除去し、構図・顔・眼鏡・衣装・夜景を維持。

参照仕様: 素材制作ガイド、minato/profile.md の最新基準、READMEの導入→扉絵→日常と部間8箇所の構成。38歳・眼鏡・うねる黒髪・無精髭・白シャツ・緩い黒ネクタイと劇画調を維持。

React側で「探偵 佐伯湊」「DETECTIVE SAEKI MINATO」「第1話 灰色の証言」を右側へ重ね、既存の部名も小さく残す。専用画像はノード指定→話別レジストリ→共通画像の順。専用画像の読込失敗時も共通画像へ戻す。扉絵中はメッセージウィンドウ・履歴ボタンを表示せず、部名の重複を会話履歴にも残さない。画面クリックまたはEnterで1ノード進み、メニュー中は停止。通常会話へ戻ると会話欄と履歴ボタンも戻る。セーブ形式は維持。

## 生成プロンプト

Use case: illustration-story. Create exactly ONE new 16:9 landscape default key visual for Japanese detective game. Input image 1 is composition/mood reference ONLY: seated detective on LEFT in nighttime office, desk coffee foreground, city windows, right side open for typography. Input image 2 is the CANONICAL character identity and hand-drawn gekiga rendering reference. Preserve image 2's Japanese man age38, softly wavy black hair falling near brows, thin dark rectangular GLASSES, light stubble, lean face/body, charcoal jacket, white shirt and loose black tie. Match image 2's mature detailed hand-drawn ink and restrained painterly texture, not photorealistic. He sits thoughtfully on LEFT half of frame, hand near face holding a slim electronic cigarette, faint curling vapor, calm hardboiled gaze. Night detective office with warm desk lamp left, dark coffee mug and papers in foreground, cool blue gray urban skyline through windows. Follow image1's balanced cinematic composition and quiet mood. RIGHT 43 percent is uncluttered dark soft-focus city window negative space for React title overlay, particularly x58-94% y36-67%. No additional people. No text whatsoever, no letters, no logos, no episode names, no watermark, no lettering on papers or wall. Single finished wide illustration only.

## 検証

後続修正の編集プロンプト:

Edit image 1 (game cover) with one precise correction only. Replace the tiny white burning PAPER CIGARETTE held beside the man's face with the clearly recognizable BLACK ELECTRONIC CIGARETTE / POD VAPE DEVICE from reference image 2. It must be a short substantial dark graphite rectangular body with rounded edges, a dark tapered mouthpiece and small circular button, approximately palm length, visibly thicker than a paper cigarette. He naturally holds the device near his lips; adjust only the fingers locally as necessary. NO white paper tube, NO tobacco stick, NO burning ember, NO ash, NO combustion smoke. Remove the existing curling smoke above his hand; if any vapor remains make it minimal near his mouth. Keep EVERYTHING ELSE as identical as possible: same 16:9 framing, canvas, man's exact face, glasses, wavy hair, expression, suit and loose tie, seated pose, desk, coffee, lighting, city window, right-side empty space, same mature ink/painterly gekiga style. NO text, logos or watermarks. Produce exactly one edited cover.

- `node --test --test-isolation=none tests/*.test.mjs`: 132成功・失敗0・ブラウザー61件スキップ。初回は既存依存キャッシュへのアクセス制限で失敗したため、制限外で同一コマンドを再実行し成功。
- `npm run build`: 型チェックとビルド成功。500kB超のチャンク警告あり。
- `chapterIllustrationBrowser.test.mjs`: Chromium 1920×1080・1366×768の2件成功。全8扉絵、タイトル右配置、画像のロード、失敗時のデフォルト復帰、保存からの復帰と進行を確認。両サイズのスクリーンショットを目視確認。
- 既存の依存関係を使用。npm ciは再実行していない。Firefox/Safariは未検証。

### 電子タバコ・会話欄非表示の追加修正

- 回帰132件成功、失敗0、ブラウザー61件スキップ。型チェック・本番ビルド成功。
- 扉絵ブラウザー2件成功（1920/1366幅）。全8箇所で会話欄・履歴非表示、クリック/Enterで次の1ノードへ進行、MENU中の進行停止、通常会話での会話欄・履歴復帰を確認。連続するOUT→IN扉絵も対象。両サイズを目視確認。
- 既存ツールバーブラウザー2件成功。
- 追加実行した `reviewInteractionBrowser.test.mjs` の2件は、Free Actionへ復元した後に非表示の「タバコを吸う」ボタンを待機してタイムアウト。現行のツールバー表示条件とテストの対象画面が合っていない。今回の対象外として、ゲームの表示条件と当該テストは変更していない。
