# 追加方向素材の生成・接続記録

2026-10-13。両画像とも正式採用前の候補。本編の向き確認用に接続。既存70素材は上書きしない。

- 湊の正面通常：デザイン担当の内蔵画像生成による原本を、担当が全キャンバス等比縮小した1024×1024候補として受領。制作元docs/art/characters/minato/drafts/front-neutral-01.png、報告コミットdb0fcbf・引継ぎ11924ee。[確認用PNG](../src/assets/direction-candidates/minato-front.png)。原本は C:/Users/lemon/.codex/generated_images/01a123a2-b46f-77d3-b27e-a7f8a37b3920/exec-cc64a5c6-0111-4d86-bb3e-a249d585e0a5.png。ゲーム保存先 src/assets/direction-candidates/minato-front.png。
- あかりの右向き悲しみ：組込担当がimagegenスキルの内蔵image_genツールで既存sad画像を編集。CLI/APIキー方式は使わない。[確認用PNG](../src/assets/direction-candidates/akari-right-sad.png)。原本は C:/Users/lemon/.codex/generated_images/01a12b79-c2e5-7ba0-80be-fe6944fa8fce/exec-1bb5c6cb-e8ef-4f67-8d9e-9dfb305bdcc8.png。ゲーム保存先 src/assets/direction-candidates/akari-right-sad.png。

湊1024×1024、あかり1254×1254。ともにRGBA、alpha範囲0〜255。コピー元とゲーム画像のSHA-256一致を確認。顔・髪・衣装・手・バッグの左右を目視。3人配置では向きを画像として使い、CSS水平反転はしない。女性90%・上17%の既定の暫定表示倍率を維持。左22%・中央50%・右78%は3人時の確認用配置であり、実身長設定や正式作画基準の新しい確定ではない。

## あかりに使用した最終プロンプト

Use case: character-consistency. Asset type: transparent waist-up sprite for a Japanese detective adventure game. Input image 1 is the edit target: Takase Akari, her adopted character sprite. Change only her viewing direction: turn her head and upper body toward screen RIGHT, gentle three-quarter view and eyes toward a conversation partner on her right. Keep her sad, restrained expression. Preserve exactly her identity, age impression, short dark brown bob with bangs, facial proportions, red cardigan with dark buttons, white shirt, navy skirt, black crossbody bag, both hands clasped in front, and the original illustration style. This is NOT a horizontal mirror: the bag must remain on the SCREEN LEFT side of her body; the strap must still run from SCREEN RIGHT shoulder diagonally down toward SCREEN LEFT hip. Match the reference framing, size of the head and body relative to the square canvas, and top margin. Full head and hair visible, complete upper body to the same lower skirt cut, centred in the canvas. Single character only, no text, no background, no watermark. Preserve actual alpha transparency.

デザイン側の2回の通信切断後、あかり1枚の制作を組込側へ引き継いだ。湊の再生成や完成キービジュアル制作は行っていない。制作元・正式採用・ゲーム接続は別の状態として素材台帳に記録する。
