# Episode 01 再構成前の設定棚卸し・判断チェックリスト

作成：2026-10-31 / PR #274。**設定の採用宣言ではなく、検討の進捗管理表**。既存原稿の凍結状態・本文の正本・実装を変更しない。

## 目的と運用

- ゴール：Episode 01『消された記録』の再構成に着手できるよう、設定の前提、必要な判断、保留事項を明示する。作品公開・ゲーム実装までを本PRで行わない。
- 状態「既存設定あり」は**根拠となる記述がある**という意味で、再検証済み・全面承認済み・実機での整合確認済みを意味しない。「要確認」は必ずしも新規設定を必要としない。「保留可能」は今決めずとも再構成可能な候補。
- 検討時は各IDを指定し、現行mainとPR #274、原稿の適用版・採否を照合する。ユーザーの合意内容は対象分野の既存正本／本PRの関連プロフィールに反映し、根拠と更新先をこの表に記録する。表だけを新しい設定正本として使用しない。
- 状態変更は根拠確認後に行う。合意済み・PR反映済み・main反映済みを区別し、マージを前提にしない。凍結台本の改稿・ゲーム修正・画像制作は別工程、明示承認による。
- 現行本文：`docs/02-story/episode-01/erased-records/README.md`。旧稿「灰色の証言」と、本文末尾の改稿履歴・候補案は自動継承しない。

## 棚卸し一覧

| ID | 分野 | 確認項目 | 初期状態 | 主な参照先 | 結論・反映状況 |
| --- | --- | --- | --- | --- | --- |
| SET-01 | 作品・世界観 | 正統派コマンド選択式探偵ADVとしての方向性 | 既存設定あり | `docs/01-game-design/design-philosophy.md` | 未審査（初期棚卸し） |
| SET-02 | 作品・世界観 | 西新宿を中心とする現代日本の舞台 | 既存設定あり | `docs/02-story/episode-01/第1話_ロケーション設定.md` | 未審査（初期棚卸し） |
| SET-03 | 作品・世界観 | 探偵・警察・会社の情報権限 | 既存設定あり | `docs/02-story/episode-01/erased-records/story/outline.md` | 未審査（初期棚卸し） |
| SET-04 | 作品・世界観 | 物語のリアリティと演出の許容範囲 | 要確認 | `docs/02-story/episode-01/erased-records/review/consistency-resolution-20261026.md` | 未審査（初期棚卸し） |
| SET-05 | 主人公・主要人物 | 佐伯湊と相澤澪の人物像・関係性 | 既存設定あり | `docs/03-characters/profiles/minato.md, mio.md（本PR）` | 未審査（初期棚卸し） |
| SET-06 | 主人公・主要人物 | 奥村・瀬川・鳴海の主要設定 | 要確認 | `docs/03-characters/profiles/okumura.md, segawa.md, narumi.md（本PR）` | 未審査（初期棚卸し） |
| SET-07 | 主人公・主要人物 | 主要人物間の呼称・口調 | 要確認 | `docs/03-characters/profiles/（本PR）` | 未審査（初期棚卸し） |
| SET-08 | 主人公・主要人物 | 将来の秘密・過去の開示範囲 | 保留可能 | `docs/03-characters/人物設定.md` | 未審査（初期棚卸し） |
| SET-09 | Episode 01の事件 | 直人の失踪と救出の基本事実 | 既存設定あり | `docs/02-story/episode-01/erased-records/story/outline.md` | 未審査（初期棚卸し） |
| SET-10 | Episode 01の事件 | 2024年の三崎転落事件の真相 | 既存設定あり | `docs/02-story/episode-01/erased-records/dialogue/part-05.md` | 未審査（初期棚卸し） |
| SET-11 | Episode 01の事件 | 黒田の動機・行動・心理 | 要確認 | `docs/02-story/episode-01/erased-records/review/consistency-resolution-20261026.md` | 未審査（初期棚卸し） |
| SET-12 | Episode 01の事件 | 三崎の人物像と問題意識 | 要確認 | `docs/02-story/episode-01/erased-records/dialogue/part-03.md` | 未審査（初期棚卸し） |
| SET-13 | Episode 01の事件 | 直人が閉じ込められた物理条件 | 要確認 | `docs/02-story/episode-01/erased-records/review/consistency-resolution-20261026.md` | 未審査（初期棚卸し） |
| SET-14 | Episode 01の事件 | 修繕記録・証拠・会社の調査体制 | 要確認 | `docs/02-story/episode-01/erased-records/story/outline.md` | 未審査（初期棚卸し） |
| SET-15 | Episode 01の事件 | 法的結論・未解明事項の扱い | 既存設定あり | `docs/02-story/episode-01/erased-records/README.md` | 未審査（初期棚卸し） |
| SET-16 | 事件関係者・組織 | あかり・直人の関係と依頼背景 | 既存設定あり | `docs/02-story/episode-01/erased-records/dialogue/part-01.md` | 未審査（初期棚卸し） |
| SET-17 | 事件関係者・組織 | 宮原の役職・判断・責任 | 要確認 | `docs/03-characters/人物設定.md` | 未審査（初期棚卸し） |
| SET-18 | 事件関係者・組織 | 黒田の立場と経歴 | 要確認 | `docs/03-characters/人物設定.md` | 未審査（初期棚卸し） |
| SET-19 | 事件関係者・組織 | 三崎の人物像・同僚との関係 | 要確認 | `docs/02-story/episode-01/erased-records/dialogue/part-03.md` | 未審査（初期棚卸し） |
| SET-20 | 事件関係者・組織 | 東成ビルサービスの規模・所在地 | 既存設定あり | `docs/02-story/episode-01/東成ビルサービス.md` | 未審査（初期棚卸し） |
| SET-21 | 事件関係者・組織 | 新宿署の組織・役職の詳細 | 要確認 | `docs/03-characters/profiles/okumura.md（本PR）` | 未審査（初期棚卸し） |
| SET-22 | 舞台・時系列・継承 | 主な所在地・施設 | 既存設定あり | `docs/02-story/episode-01/第1話_ロケーション設定.md` | 未審査（初期棚卸し） |
| SET-23 | 舞台・時系列・継承 | 2024年と2026年の時系列 | 既存設定あり | `docs/02-story/episode-01/erased-records/story/outline.md` | 未審査（初期棚卸し） |
| SET-24 | 舞台・時系列・継承 | 探偵事務所・BARの役割 | 既存設定あり | `docs/02-story/episode-01/erased-records/dialogue/part-03.md` | 未審査（初期棚卸し） |
| SET-25 | 舞台・時系列・継承 | 旧稿から継承しない設定の区別 | 要確認 | `docs/03-characters/人物設定.md` | 未審査（初期棚卸し） |
| SET-26 | 舞台・時系列・継承 | 続編用の家族・経歴・秘密 | 保留可能 | `docs/03-characters/人物設定.md` | 未審査（初期棚卸し） |

## 初回の優先確認候補（未承認の作業順）

1. 黒田の動機・行動・心理（SET-11）
2. 三崎の人物像と問題意識（SET-12）
3. 直人の閉じ込め条件（SET-13）
4. 宮原と会社の内部関係（SET-17、SET-20など）
5. 人物の呼称・関係性（SET-06〜08）

## PR #274を区切る条件

- 必須となる設定判断が明示的に完了し、未決事項は再構成を妨げないと説明できる。
- 事件・人物・時系列・世界観の重大な矛盾の残存を点検する。
- 採用した設定は適切な正本に記録し、出典・適用範囲・承認と反映の状態が追える。
- 物語本文の再構成やゲーム実装を本PRに含めない。
