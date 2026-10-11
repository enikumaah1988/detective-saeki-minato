# 会話用腰上素材：確認用候補

2026-10-11。主要5人、通常を含む38枚。全員透過PNG1024×1024。寸法は制作上の仮案、個別画像は採用待ち。
採用設定資料と全身通常を参照して腰上通常を描き、人物ごとの腰上通常から各表情を制作。手を含む腰上を会話用にし、全身通常5枚は別用途として残す。

| 人物 | 枚数 | 明るい背景 | 暗い背景 | 生成記録 |
|---|---:|---|---|---|
| 湊 | 7 | [一覧](characters/minato/waist-review.png) | [一覧](characters/minato/waist-review-dark.png) | [条件](characters/minato/waist-prompts.json) |
| 澪 | 8 | [一覧](characters/mio/waist-review.png) | [一覧](characters/mio/waist-review-dark.png) | [条件](characters/mio/waist-prompts.json) |
| 鳴海 | 8 | [一覧](characters/narumi/waist-review.png) | [一覧](characters/narumi/waist-review-dark.png) | [条件](characters/narumi/waist-prompts.json) |
| 奥村 | 7 | [一覧](characters/okumura/waist-review.png) | [一覧](characters/okumura/waist-review-dark.png) | [条件](characters/okumura/waist-prompts.json) |
| 瀬川 | 8 | [一覧](characters/segawa/waist-review.png) | [一覧](characters/segawa/waist-review-dark.png) | [条件](characters/segawa/waist-prompts.json) |

## 保存・検証

- ゲーム候補：src/assets/images/characters/<id>/waist/<key>.png。全身通常：full/neutral.png。画像を制作資料へ二重コピーしない。
- 各確認一覧は1920×1080、最大8枚、背景付き。既存の採用設定資料sheet.pngとは用途を分ける。
- 全38枚の寸法、透明・不透明ピクセル、透明な四隅、輪郭範囲、SHA-256を[検証記録](waist-validation.json)へ保存。
- 書き出しは原本キャンバス全体を960px四方に収め、1024px四方の中央へ配置。顔のサイズを変えて手を収める調整はしない。
- 明暗背景で輪郭と手の収まりを目視確認。表情による顔の位置・衣服のしわには生成上の微差がある。
- 全身通常の移動前後でSHA-256一致を確認。ゲームコード・ストーリーは変更せず、ゲーム内切り替えとUIの重なりは未検証。
- 画像・資料のみの変更のためロジックテスト・ビルドは未実行。正式採用とゲーム内表示は後続確認。

## 個別画像

### 湊

- [neutral](../../src/assets/images/characters/minato/waist/neutral.png)
- [smile](../../src/assets/images/characters/minato/waist/smile.png)
- [serious](../../src/assets/images/characters/minato/waist/serious.png)
- [surprised](../../src/assets/images/characters/minato/waist/surprised.png)
- [irritated](../../src/assets/images/characters/minato/waist/irritated.png)
- [pained](../../src/assets/images/characters/minato/waist/pained.png)
- [relieved](../../src/assets/images/characters/minato/waist/relieved.png)

### 澪

- [neutral](../../src/assets/images/characters/mio/waist/neutral.png)
- [smile](../../src/assets/images/characters/mio/waist/smile.png)
- [amused](../../src/assets/images/characters/mio/waist/amused.png)
- [serious](../../src/assets/images/characters/mio/waist/serious.png)
- [surprised](../../src/assets/images/characters/mio/waist/surprised.png)
- [worried](../../src/assets/images/characters/mio/waist/worried.png)
- [pained](../../src/assets/images/characters/mio/waist/pained.png)
- [relieved](../../src/assets/images/characters/mio/waist/relieved.png)

### 鳴海

- [neutral](../../src/assets/images/characters/narumi/waist/neutral.png)
- [amused](../../src/assets/images/characters/narumi/waist/amused.png)
- [playful](../../src/assets/images/characters/narumi/waist/playful.png)
- [smirk](../../src/assets/images/characters/narumi/waist/smirk.png)
- [serious](../../src/assets/images/characters/narumi/waist/serious.png)
- [surprised](../../src/assets/images/characters/narumi/waist/surprised.png)
- [cool](../../src/assets/images/characters/narumi/waist/cool.png)
- [wary](../../src/assets/images/characters/narumi/waist/wary.png)

### 奥村

- [neutral](../../src/assets/images/characters/okumura/waist/neutral.png)
- [smile](../../src/assets/images/characters/okumura/waist/smile.png)
- [serious](../../src/assets/images/characters/okumura/waist/serious.png)
- [surprised](../../src/assets/images/characters/okumura/waist/surprised.png)
- [stern](../../src/assets/images/characters/okumura/waist/stern.png)
- [pained](../../src/assets/images/characters/okumura/waist/pained.png)
- [relieved](../../src/assets/images/characters/okumura/waist/relieved.png)

### 瀬川

- [neutral](../../src/assets/images/characters/segawa/waist/neutral.png)
- [smile](../../src/assets/images/characters/segawa/waist/smile.png)
- [serious](../../src/assets/images/characters/segawa/waist/serious.png)
- [surprised](../../src/assets/images/characters/segawa/waist/surprised.png)
- [skeptical](../../src/assets/images/characters/segawa/waist/skeptical.png)
- [irritated](../../src/assets/images/characters/segawa/waist/irritated.png)
- [reluctant](../../src/assets/images/characters/segawa/waist/reluctant.png)
- [relieved](../../src/assets/images/characters/segawa/waist/relieved.png)
