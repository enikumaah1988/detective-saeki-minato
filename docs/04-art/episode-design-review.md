# 第1話の追加人物：基本デザイン試作1

2026-10-12。組み込みimage_genで制作。全員、外見・衣装は仮案、採用待ち。

| 人物 | 方向性 | 試作 | 生成条件 |
|---|---|---|---|
| 黒田征司・48歳 | 丸みのある顔と厚みのある体格。穏やかな応対をする会社員として描く。グレーのスーツと青緑のネクタイ。 | [全身](characters/kuroda/drafts/prototype-01.png) | [条件](characters/kuroda/drafts/prototype-01-prompt.md) |
| 宮原文雄・64歳 | 面長、白髪交じり、細身。オリーブ色の作業上着で会社の現場担当と区別。 | [全身](characters/miyahara/drafts/prototype-01.png) | [条件](characters/miyahara/drafts/prototype-01-prompt.md) |
| 三崎健・死亡時35歳 | 角張った顔、前へ流す短い黒髪、広めの鼻。水色の作業着は仮案。 | [肖像](characters/misaki/drafts/prototype-01.png) | [条件](characters/misaki/drafts/prototype-01-prompt.md) |

[構図の比較](episode-design-review.png)は1920×1080。[顔の比較](episode-design-faces.png)は1920×800で、試作の顔を比較用に切り出して拡大した資料。ゲーム素材ではなく、身長・本編倍率とも別。

奥村の採用sheet.pngは画風だけの参照。人物の顔・衣装は新規。出力はやや写実的な顔の陰影が強く、共通画風との最終調整は採用前の確認対象。

試作の黒田のスーツは暗めに出ており、仮シートの中間明度グレーとの一致は確認待ち。宮原の髪も薄め指定より量があり、未承認の細部として扱う。三崎の口元の薄い陰影は髭の設定を追加するものではない。

- 全身2点は1024×1536、肖像1点は1024×1024、背景付きRGB。
- 生成原本はgenerated_imagesに保持。寸法調整のみ。髪・靴が切れていないこと、顔と衣装の識別、一覧表示を目視確認。
- [生成原本とプロンプト](episode-design-sources.json)、[寸法・SHA-256検証](episode-design-validation.json)、[書き出し・比較生成スクリプト](export-episode-designs.py)。
- 採用設定資料sheet.pngやゲームPNGは未制作。ストーリー・実装は変更していない。画像と資料のみの変更のためゲームテスト・ビルドは未実行。
