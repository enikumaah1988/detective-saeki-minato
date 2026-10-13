# 改稿ver0.03：素材候補の最終引継ぎ
2026-10-12。作画ブランチ art/main-characters、ローカルコミット済み。正式採用は全点ユーザー確認待ち。
画像の候補制作は今回依頼の範囲で完了。採用・本編表示・階段の証言視点の照合は別工程。

## 制作数と履歴

| 対象 | 現行数 | 制作元コミット | 正本 |
|---|---:|---|---|
| 背景第1組：事務所室内・建物前 | 2 | 8398e09 | [候補と時間帯](backgrounds/README.md)、[原本・生成条件](integration-batch-01-sources.json) |
| 背景第2組：会社・警察署 | 6 | d919cda | [候補一覧](backgrounds/batch-02-review.md)、[原本・生成条件](backgrounds/batch-02-sources.json) |
| 背景第3組：旧ビル4基本＋夕4差分 | 8 | 1c8485f | [候補一覧](backgrounds/batch-03-review.md)、[原本・生成条件](backgrounds/batch-03-sources.json) |
| 喫煙・非喫煙の機能用挿絵 | 2 | 8398e09 | [候補一覧](cutins/README.md)、[原本・生成条件](integration-batch-01-sources.json) |
| 部始まり・部末：8接続の7図柄 | 7 | 220bbc32788e2e074da11d5aee9fbd0a3ee8ecf8 | [現行候補一覧](illustrations/README.md)、[原本・生成条件](illustrations/chapter-sources.json) |

計25候補。部間初回4図柄は202a449、現行7図柄の版・台帳を確定した制作コミットは220bbc3。旧紙面と旧構図を現行として使わない。
全ファイルの素材ID、時間帯、保存先、生成原本ファイル、原本と出力SHA-256、制作コミット、採用状態は[統合検証・引継ぎJSON](final-delivery-validation.json)に保存。[再検証スクリプト](verify-final-delivery.py)。
画像をoutputsへ二重コピーせず、[閲覧入口](../../outputs/art/README.md)からこの正本へリンクする。

## 部間8接続の現行対応

| 接続ID | 正本ファイル | 接続時の短いファイル名 |
|---|---|---|
| C1-IN | docs/art/illustrations/drafts/c1-in-01.png | c1-in.png |
| C1-OUT | docs/art/illustrations/drafts/c1-out-01.png | c1-out.png |
| C2-IN | C1-OUTと同じ画像 | c1-out.pngを共用 |
| C2-OUT | docs/art/illustrations/drafts/c2-out-02.png | c2-out.png |
| C3-IN | docs/art/illustrations/drafts/c3-in-02.png | c3-in.png |
| C3-OUT | docs/art/illustrations/drafts/c3-out-02.png | c3-out.png |
| C4-IN | docs/art/illustrations/drafts/c4-in-02.png | c4-in.png |
| C4-OUT | docs/art/illustrations/drafts/c4-out-01.png | c4-out.png |

候補正本はdocs/art内、短いファイル名への接続とゲーム参照は組込側の作業。採用時は移動で正本を整理し、同一ゲーム画像の二重コピーを管理しない。
C1-INは閉じた帳簿とコーヒー、C4-OUTは開いた帳簿とカップの片付け。C3-OUTには澪を描いていない。写真は直人の人物写真へ修正済み。図は建物内の仮図で、推理用現場図の正本を置き換えない。
[画像一覧](illustrations/chapter-review.png)、[静的会話欄付き一覧](illustrations/chapter-ui-review.png)。

## 確認済みと未確認

確認済み：25現行候補の存在、1920×1080 RGB、原本・出力SHA-256一致、重複ファイルなし、部間7図柄の8接続ID対応、候補台帳と現行ファイルの一致。PNGはGit LFSで保存。
目視：人物の顔・髪・衣装、主要な手・写真・帳簿・図、時間帯の光、室内外の窓と扉の素材。静的合成で会話欄との関係を確認。C3-OUTの紙の空白縁には会話欄が掛かるが、手と主要図示は上側。
未確認：組込側の本編動作・1366表示・時刻と季節の精密な光・建物の厳密な平面図・階段の人の目線と遮蔽物の成立。階段の空画像だけで目撃を検証済みとしない。紙の文字や仮図を証拠の正本にしない。
画像と制作資料のみの変更。ゲームコード・シナリオ・喫煙可能場所・人物の正式配置は変更していない。ゲームテスト・ビルドは作画側では未実行。

## 人物表示と採用

[人物表示基準](character-display-handoff.md)：女性90%は既決の暫定倍率。湊上12%・澪上18%は未採用見本の位置。倍率を実身長へ換算せず、同一人物の全表情に同じ倍率を適用。
組込側からは既存上17%を維持して画像下端切れを解消すると連絡あり。これは受領した実装方針の記録であり、作画側の位置案を正式採用へ変更するものではない。実装の検証結果は組込側の正本を参照。
黒田・宮原・三崎の基本デザイン、個別立ち絵や各候補の正式採用は引き続き確認待ち。

残る判断：全候補の採用・ブラッシュアップ、階段視点の照合、実ゲーム全8接続の表示確認。候補制作とゲーム全体の完成を混同しない。
