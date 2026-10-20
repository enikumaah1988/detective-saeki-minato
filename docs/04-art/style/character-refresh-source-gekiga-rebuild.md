# 全キャラクター：劇画調の再制作

2026-10-13。ユーザー採用のテイストで、人物別に必要な既存表情と未制作分を一式制作。組み込みimage_gen使用。画風採用済み。今回の個別画像・確認シートの最終確認とゲーム内表示は未実施。

| 人物 | 全身 | 腰上表情 | 確認資料 |
|---|---|---|---|
| 佐伯 湊 | 1 | 7：neutral, smile, serious, surprised, irritated, pained, relieved | [確認シート](../characters/minato/drafts/gekiga-sheet-01.png) |
| 相澤 澪 | 1 | 8：neutral, smile, amused, serious, surprised, worried, pained, relieved | [確認シート](../characters/mio/drafts/gekiga-sheet-01.png) |
| 鳴海 ユウ | 1 | 8：neutral, amused, playful, smirk, serious, surprised, cool, wary | [確認シート](../characters/narumi/drafts/gekiga-sheet-01.png) |
| 奥村 修一 | 1 | 7：neutral, smile, serious, surprised, stern, pained, relieved | [確認シート](../characters/okumura/drafts/gekiga-sheet-01.png) |
| 瀬川 亮介 | 1 | 8：neutral, smile, serious, surprised, skeptical, irritated, reluctant, relieved | [確認シート](../characters/segawa/drafts/gekiga-sheet-01.png) |
| 高瀬 あかり | 1 | 8：neutral, smile, serious, surprised, worried, sad, relieved, determined | [確認シート](../characters/akari/drafts/gekiga-sheet-01.png) |
| 高瀬 直人 | 1 | 8：neutral, smile, serious, surprised, worried, pained, relieved, remorseful | [確認シート](../characters/naoto/drafts/gekiga-sheet-01.png) |
| 三原 沙織 | 1 | 8：neutral, smile, serious, surprised, worried, pained, relieved, confused | [確認シート](../characters/saori/drafts/gekiga-sheet-01.png) |
| 黒田 征司 | 1 | 6：neutral, smile, serious, confused, worried, pained | [確認シート](../characters/kuroda/drafts/gekiga-sheet-01.png) |
| 宮原 文雄 | 1 | 7：neutral, smile, serious, worried, pained, surprised, relieved | [確認シート](../characters/miyahara/drafts/gekiga-sheet-01.png) |
| 三崎 健 | 写真用肖像1 | 会話差分なし | [肖像](../../../src/assets/images/characters/misaki/portrait/neutral.png) |

計86素材：全身10・腰上75・肖像1。既存8人の62腰上を再制作し、黒田6・宮原7の未制作13腰上を追加。主要5人の採用済み全身試作を使用、他5人の全身と三崎の肖像を新規作画。人物別の素材パスを維持。

## 保存と由来
ゲーム素材はsrc/assets/images/characters/<id>/full/neutral.pngとwaist/<key>.png。三崎はportrait/neutral.png。同一PNGの二重管理をしない。主要5人の試作はゲーム素材正本へ移し、リンクを更新。原本はgenerated_imagesに保持。旧版はGit b749657、11924ee以前から参照できる。新確認シートは背景付き1920×1080、左全身・右4×2最大8表情。実際の個別素材を縮小合成しており、別の顔を生成していない。

[制作対象](gekiga-rebuild-plan.json) / [各プロンプト・原本・検証記録](rebuild-records) / [全86素材の検証](gekiga-rebuild-validation.json) / [書出し](save-rebuild-asset.py) / [確認シート作成](finalize-rebuild.py)。

## 確認範囲・残る調整
生成結果を目視し、顔・衣装・表情・所作・全身の収まりを確認。必要キー、共通寸法、RGBA、立ち絵の四隅と肖像の上側2隅の透明、ハッシュ、全86点の重複なしを照合済み。原本全キャンバスを等比調整し、表情ごとの輪郭再フィット・左右反転・後付け画風フィルターを使っていない。

実身長・頭の大きさ合わせは既存ART-01のバックログ。靴の光沢、若手の整った顔、半透明の縁・全身周辺のにじみ、切替時の微差は調整候補。UI確認・個別採用は未完了。直人は今回、画面右向きに近い顔になっており、旧左向きの配置へ単純反転しない。正面湊・右向きあかり等の追加角度と挿絵は今回の通常・表情一式とは別の後続制作。過去の角度候補や挿絵は旧画風資料。

## 後続制作
共通画風と最新の全身・waist/neutral.pngを優先する。旧sheet.pngは人物識別・所作の履歴で、塗りの基準にしない。新シート確認後に採用sheet.pngを更新する。黒田・宮原・三崎の未承認属性、直人・沙織のストーリー同期待ち、湊の非公開情報を勝手に確定しない。ゲームコード・ストーリーは変更していない。
