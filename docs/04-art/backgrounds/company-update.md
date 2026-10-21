# 東成ビルサービス：設定更新と背景5枚

2026-10-19。ユーザーによる企業設定・所在地の確定、参考画像の提供、5背景の制作とゲーム組み込みの明示依頼に基づく。この5枚は旧資料の新規生成保留に対する今回限りの制作対象。画像の最終的な見た目の評価はユーザーのプレイ確認で行う。

## 設定と調査結果

企業設定の正本は [東成ビルサービス株式会社](../../02-story/episode-01/東成ビルサービス.md)。約40年、従業員約450人、本社約45人の堅実な総合ビルメンテナンス企業。西新宿6丁目・架空の西新宿セントラルタワー12階の一部を賃借する。

既存シナリオは会社外観・受付・応接室を使用していた。所在地資料の「中規模ビル」「入居階未定」は今回の確定設定で更新。成子坂共同ビルの旧事務所と本社は別施設であり、その事件設定は変更しない。事件構造や人物関係を変更する重大な矛盾は見つからなかった。

既存の移動はcompany地点から外観→受付→応接室。調査記録は取得情報から導出され、背景はセーブへ直接保存せずノードから解決される。地図の座標・ピン・進行条件・記録解放条件・SaveData version 2を維持した。

## 素材

内蔵image_genを使用。提供された5場面の参考画像を建築・内装の参考に、既存company-reception.pngを画風の基準にした。コラージュの切抜きではなく、それぞれ独立して生成した。元出力1672×940または1672×941を既存の1920×1080 PNGへ寸法正規化。人物・UI・見出し帯なし。外観のビル名と受付の社名は読めることを目視確認。応接室と執務室は初稿の夕色を昼光に修正し、執務室は40〜50席規模の奥行きを確保した。

| ファイル（src/assets/images/backgrounds/） | 使用先 |
| --- | --- |
| company-exterior.png | 外観、地図選択時のプレビュー |
| company-lobby.png | P2-02-arrivalとP2-02-intro。共用ロビーを経て12階へ |
| company-reception.png | 既存受付、P2-02-intro-2、既存の会話・一覧 |
| company-lounge.png | 既存応接室 |
| company-office.png | p2-reception-exists-2。受付脇のガラス越しの描写 |

受付カウンターの既存確認に執務室の一文を接続し、確認後は元の一覧へ戻る。ロビー・執務室を独立した移動先にはしない。背景変更だけの一文には人物の立ち絵を重ねない。既存のノードID・取得情報ID・出口条件を維持し、既存会話の目的と証言を維持した。

生成プロンプトと修正プロンプトは [company-generation.json](company-generation.json) に記録。ゲーム用画像の正本は上記5枚のみ。会社背景をGit LFSへ登録した。

## 変更ファイル

- `src/assets/images/backgrounds/company-{exterior,lobby,reception,lounge,office}.png`：5背景
- `src/data/presentation.ts`：背景登録と受付の表示名
- `src/data/scenario/revisionData.ts`：所在地・事業内容と短い入館・執務室描写
- `src/data/scenario/buildRevision.ts`：一文単位の背景指定、入館背景。既存の進行処理は維持
- `src/features/story/TravelMap.tsx`：会社の説明と外観プレビュー
- `src/assets/images/maps/nishi-shinjuku-geographic-05.mapping.json`：架空のビル名。座標は維持
- `docs/story/東成ビルサービス.md`、既存の現行設定・所在地資料、背景README、制作状態台帳：設定・使用先を記録
- `.gitattributes`：会社背景のLFS管理
- `tests/companyBackgrounds.test.mjs`、`tests/companyBackgroundsBrowser.test.mjs`：5背景・復元・画面切替の回帰
- `tests/travelMapBrowser.test.mjs`：確定所在地の期待値を更新

## 検証

- Windows用の既存手順に合わせ `node --test --test-concurrency=1 tests/*.test.mjs` を実行。全編の必須／任意進行、旧セーブ互換と追加した背景・復帰テストを含む。139成功、69スキップ、失敗0。ブラウザー項目は別実行。
- Chromeで1920×1080・1366×768の各サイズを確認。会社の5背景の実画像読込・ロビー→受付・執務室→受付一覧、既存地図の位置・リサイズ・移動・取消を確認。4件成功。
- `tsc --noEmit` と `vite build --configLoader native` 成功。既存のバンドルサイズ警告（500 kB超）は残る。
- 5種類×2サイズのスクリーンショットを目視確認。人物と会話窓を重ねた状態で背景と文字が表示されることを確認した。
- 初回のテストはWindowsのVite共有キャッシュの権限制限で失敗。別プロセスを順次実行する既存Windows手順で再確認した。初回のブラウザー実行は環境パスとネットワーク環境を調整後に再実行した。

Firefox/Safari・スマートフォンの実機確認、ユーザーによる最終プレイ確認、PRマージは未実施。今回の要件に未対応の制作・実装項目はない。
