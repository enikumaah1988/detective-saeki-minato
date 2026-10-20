# システム側へのマップ素材引継ぎ

最新：会社はユーザー指示により西新宿六丁目の架空ビルへ設定し、下部リストを廃止して他の場所と同じピン表示に統一。`company.coordinate={lon:139.69355,lat:35.6929}`、状態は `fictional_location`。画像内位置は左39.7368421%・上52.4936479%。実在建物の住所やテナントの位置ではない。実名の周辺参照点はランタイムJSONから削除。以下のcompany座標null・下部エリア枠の説明は過去の記録。

最新のユーザー指示：実画面は中央寄せcoverで枠いっぱいに表示。画像とピンを共通レイヤーで切り抜くため、地理座標・画像サイズは維持している。地図内・画面下のライセンス表示は外し、出典は資料・JSONへ保持。別のライセンス一覧は今後の予定で未実装。PNGを更新したためJSONのハッシュも更新済み。以下のcontain例は余白を作る場合の参考であり、現行画面はcoverを使用する。

追記：ユーザーの組み込み依頼により[本編へ接続済み](../integration.md)。以下は接続前に用意した引継ぎ資料。座標規約と会社未定の扱いは実装にも適用した。

2026-10-19。ユーザーの「システム側でマッピングできるように修整」に対応。画像の見た目と地理形状を維持し、対応する座標情報・変換例・GIS用ワールドファイルを追加。本編への接続はこの作業では行わない。

## 渡すファイル

1. [地図PNG](../../../../src/assets/images/maps/nishi-shinjuku-geographic-05.png)：2400×1600、北上、出典以外の文字・ピンなし。
2. [座標定義JSON](../../../../src/assets/images/maps/nishi-shinjuku-geographic-05.mapping.json)：画像のSHA-256、範囲、投影法、参照点を一体管理。
3. [座標変換の利用例](map-coordinates.mjs)：依存なしのES Module。緯度経度→画像座標・比率・画面内座標、逆変換。
4. [PNGワールドファイル](../../../../src/assets/images/maps/nishi-shinjuku-geographic-05.pgw)：EPSG:3857のピクセル中心座標。GISへ読み込む際はCRSをEPSG:3857に指定。

PNGとJSONは同じバージョンを使う。画像を切り抜く・回転する・余白を追加する場合は、同じJSONを流用しない。

## 座標の規約

- 入力はWGS84の `{lon: 経度, lat: 緯度}`。配列の順序違いを避けるためオブジェクト形式。
- 投影はWeb Mercator / EPSG:3857。緯度をそのまま南北へ線形補間しない。
- 画像座標の原点は左上の画像端 `(0,0)`、右端がx=2400、下端がy=1600。右が東、下が南。
- `u,v` は画像幅・高さに対する比率。CSSなら `left: u*100%`、`top: v*100%`。
- 範囲外は `insideImage: false`。画像端へ丸め込まず、非表示または別地図へ振り分ける。
- PGWだけはGIS標準のピクセル中心規約。画像端のJSONとの半ピクセル差は意図したもの。

## 最小の利用例

```js
import { geoToImage, geoToViewport } from './map-coordinates.mjs';

const manifest = await fetch('/path/nishi-shinjuku-geographic-05.mapping.json')
  .then(response => response.json());
const office = manifest.locations.find(place => place.id === 'office');
const point = geoToImage(manifest, office.coordinate);
// point.x / point.y: 2400×1600の元画像座標
// point.leftPercent / point.topPercent: 実際に描画した画像に対するCSS比率

const hostPoint = geoToViewport(manifest, office.coordinate,
  { width: 900, height: 650 }, 'contain');
// 約 x=461.369, y=215.263。上下25pxの余白を含むホスト座標。
```

`manifest.asset.file` はJSONと同じフォルダにある画像のファイル名。バンドラーのURL解決・import方法はシステム側で合わせる。

## 縮小や画面比率でピンをずらさない配置

推奨は画像とピンを同じ3:2のレイヤー内に配置し、外側でサイズ調整する方法。ピンの座標はマーカーの先端・基点に合わせ、ラベルだけを別にずらす。

```css
.map-surface { position: relative; width: 100%; aspect-ratio: 3 / 2; }
.map-surface > img { display: block; width: 100%; height: 100%; }
.map-pin { position: absolute; transform: translate(-50%, -100%); }
```

上記の同じ画像レイヤーに `%` で配置する場合は `geoToImage` の比率を使う。高さ制限がある枠に画像を `contain` で入れる場合は、枠全体の比率をピンに使わない。`getImageRect` が返す `left/top/width/height` に画像とピンの共通レイヤーを配置するか、`geoToViewport` の座標を枠内で使う。

`cover` の場合は左右または上下の切れた領域も計算する。`geoToViewport(...,'cover')` の `visible` を確認する。`object-position` を変える場合は、第5引数へ `{x: 0〜1, y: 0〜1}` を渡し、CSSのパーセント位置と一致させる。枠のborder・paddingは座標を置く内側レイヤーに含めず、外側のラッパーへ設ける。

## 施設の確定度

| ID | 名称 | 画像上の参照位置（左%, 上%） | 扱い |
|---|---|---|---|
| office | 佐伯探偵事務所 | 51.2632%, 31.7105% | 設定住所の代表点。入口の最終位置は未確認 |
| building | 成子坂共同ビル | 27.0105%, 24.4100% | 設定住所の代表点。入口の最終位置は未確認 |
| police | 西新宿警察署 | 44.9058%, 46.4969% | 実在する新宿警察署の建物参照点。入口位置ではない |
| company | 東成ビルサービス | 未設定 | 番地未決。座標はnull。アイランドタワーは周辺参照点として別フィールド |

比率を直接使う場合も、採用時はシステム側で参照点とピンの基点を確認する。会社の周辺参照点を自動的に会社ピンとして扱わない。高瀬家は新宿区外、潜伏先は場所未決のため、西新宿地図の座標を割り当てていない。

既存 `TravelMap.tsx` の仮の `x/y` 値は旧地図用であり、05には流用しない。移動先のIDは既存の `office/company/building/police` を維持しているため、既存シナリオと結びつけられる。今回の作業で `TravelMap.tsx` 自体は変更していない。

## 検証・出典

画像のハッシュ不変、四隅、既存の参照5点、縮小・contain余白・cover切抜き・fill・object-position、範囲外点、PGWの半ピクセル差を検証済み。[検証結果](verification.json)。実ゲームのブラウザー表示は未検証。

再作成：`node prepare-handoff.mjs`。確認：`node verify-handoff.mjs`。地理原稿からPNGを作り直したら、先に座標定義JSONを再作成する。

画像右下に © OpenStreetMap contributors / openstreetmap.org/copyright の表示がある。縮小で読めなくなる場合や切り抜く場合は、画像外の読みやすい位置にも同等の出典とリンクを用意する。元データ・作風評価・利用条件は[実地理版05の資料](../geographic/README.md)を参照。
