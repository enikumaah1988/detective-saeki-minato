# 新画風・全身通常試作01：mio

制作日：2026-10-13。組み込みimage_gen使用。試作・採用確認待ち。旧採用sheetとゲームPNGは置換しない。

[試作画像](../../../../../src/assets/images/characters/mio/full/neutral.png)。入力1は本人の採用sheet（顔・髪・衣装）、入力2は湊の新画風試作（筆致と陰影のみ）。人物の年齢・衣装・設定を変更しない。原本を無加工で保存。

原本：C:/Users/lemon/.codex/generated_images/01a123a2-b46f-77d3-b27e-a7f8a37b3920/exec-d037533c-dc82-4c44-ab5a-63b43d7dcae1.png

確認対象：若手の顔のアニメ的な整い方、全体の筆致の均一さ、靴の光沢、背景周囲の半透明の残り方。透過と寸法は[共通検証](../../../style/gekiga-main-trials-validation.json)。実身長による頭身合わせや全表情差分は今回対象外。

## プロンプト

```text
Use case: style-transfer. Make ONE newly painted complete full-body neutral standing character sprite for contemporary Japanese detective ADV, portrait ideally 1024x1536, full head and both shoe soles with margins. Input 1 is ONLY this character's identity, hairstyle, costume and neutral pose reference; discard its polished anime rendering and sheet layout. Input 2 is ONLY painting-style reference, never copy that man's face, costume or aging. Late-1990s PS1 detective ADV hand-drawn gekiga original illustration: broken irregular ink contours, coarse brush marks, visibly uneven painted pigment and bold angular shadow planes on skin, hair and cloth; muted low-saturation slightly faded colors. Real adult facial proportions, modest eyes; no idealized beauty or glossy polished anime. No smooth gradients, airbrushed skin, photographic textures, digital noise filters or low-resolution tricks. Preserve character's unique anatomy, distinct palette and age. Bright and dark planes readable, not all brown or black. Truly transparent outside character, including between limbs, no ground shadow, paper texture, haze, setting, text, panels, names or palette. Restrained everyday neutral expression. Matte shoes and hair with minimal highlights.
Subject: Aizawa Mio, Japanese woman age32, intelligent warm poised adult, slender curved but natural proportions. Preserve long loose dark brown waves, NEVER ponytail. Light dusty-blue blazer, off-white modest blouse, pale blue-grey calf-length skirt, grey pumps, tiny pendant, earrings and wristwatch. Gently rest hands together low at waist, shallow three-quarter towards screen left. Soft calm closed mouth, welcoming alert eyes. Keep her lighter and softly feminine, not sexy, not girlish, not a fatigued old man. Apply strong painted planes also to female skin, not smooth anime complexion.
```

