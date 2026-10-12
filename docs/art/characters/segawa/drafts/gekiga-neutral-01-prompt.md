# 新画風・全身通常試作01：segawa

制作日：2026-10-13。組み込みimage_gen使用。試作・採用確認待ち。旧採用sheetとゲームPNGは置換しない。

[試作画像](../../../../../src/assets/images/characters/segawa/full/neutral.png)。入力1は本人の採用sheet（顔・髪・衣装）、入力2は湊の新画風試作（筆致と陰影のみ）。人物の年齢・衣装・設定を変更しない。原本を無加工で保存。

原本：C:/Users/lemon/.codex/generated_images/01a123a2-b46f-77d3-b27e-a7f8a37b3920/exec-a355c787-6b29-4f25-a771-4c91f1f55634.png

確認対象：若手の顔のアニメ的な整い方、全体の筆致の均一さ、靴の光沢、背景周囲の半透明の残り方。透過と寸法は[共通検証](../../../style/gekiga-main-trials-validation.json)。実身長による頭身合わせや全表情差分は今回対象外。

## プロンプト

```text
Use case: style-transfer. Make ONE newly painted complete full-body neutral standing character sprite for contemporary Japanese detective ADV, portrait ideally 1024x1536, full head and both shoe soles with margins. Input 1 is ONLY this character's identity, hairstyle, costume and neutral pose reference; discard its polished anime rendering and sheet layout. Input 2 is ONLY painting-style reference, never copy that man's face, costume or aging. Late-1990s PS1 detective ADV hand-drawn gekiga original illustration: broken irregular ink contours, coarse brush marks, visibly uneven painted pigment and bold angular shadow planes on skin, hair and cloth; muted low-saturation slightly faded colors. Real adult facial proportions, modest eyes; no idealized beauty or glossy polished anime. No smooth gradients, airbrushed skin, photographic textures, digital noise filters or low-resolution tricks. Preserve character's unique anatomy, distinct palette and age. Bright and dark planes readable, not all brown or black. Truly transparent outside character, including between limbs, no ground shadow, paper texture, haze, setting, text, panels, names or palette. Restrained everyday neutral expression. Matte shoes and hair with minimal highlights.
Subject: Segawa Ryosuke, Japanese male27, earnest young adult police detective. Distinct youthful unshaven-free face: NO facial hair; short naturally brighter brown hair showing forehead, clear direct eyes with serious neutral closed mouth. Standard/slightly lean build upright slightly tense posture. Brighter muted navy blue suit (clearly bluer/lighter than Okumura), off-white shirt, plain muted blue tie, black matte leather shoes. Shallow three-quarter towards screen right, hands naturally down at sides. Preserve adulthood and youth, no teenage giant eyes or mature Minato angular stubble face. No notebook or pen.
```

