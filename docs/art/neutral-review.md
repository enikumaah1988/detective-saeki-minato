# ゲーム用通常立ち絵：確認用候補
2026-10-11。採用設定資料を参照し、組み込みimage_genで主要5人を制作。
寸法1024×1536pxは制作上の仮案。画像の正式採用・ゲームへの組み込みは未実施。
共通配置：アルファ8超の輪郭を基準に等比調整し、輪郭中心x512・靴底y1460。人物の身長設定とは別。
[明暗背景での比較](neutral-review.png)。PNGの透過、サイズ、配置の記録は [検証結果](neutral-validation.json)。

| 人物 | ゲーム用画像 | 生成条件 |
|---|---|---|
| 湊 | [neutral.png](../../src/assets/images/characters/minato/neutral.png) | [条件](characters/minato/neutral-prompt.md) |
| 澪 | [neutral.png](../../src/assets/images/characters/mio/neutral.png) | [条件](characters/mio/neutral-prompt.md) |
| 鳴海 | [neutral.png](../../src/assets/images/characters/narumi/neutral.png) | [条件](characters/narumi/neutral-prompt.md) |
| 奥村 | [neutral.png](../../src/assets/images/characters/okumura/neutral.png) | [条件](characters/okumura/neutral-prompt.md) |
| 瀬川 | [neutral.png](../../src/assets/images/characters/segawa/neutral.png) | [条件](characters/segawa/neutral-prompt.md) |

表情差分は未制作。5人の通常立ち絵を確認した後に追加する。
生成原本はgenerated_imagesに保持。ゲーム候補の二重コピーは制作資料へ置かない。
