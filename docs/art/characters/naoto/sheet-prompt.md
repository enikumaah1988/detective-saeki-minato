# 直人：表情確認シート2

生成方式：組み込み image_gen。
参照：design.png（修正顔・明るめの茶髪・薄い水色の作業ブルゾン。旧prototype-03.png）。
状態：2026-10-11、8表情・所作・シートを設定資料としてユーザー採用。ストーリー設定は同期待ち。生成時のプロンプトはそのまま保存。
ユーザー指定：「罪の意識に苛まれるような表情」を追加。
表情キー：neutral, smile, serious, surprised, worried, pained, relieved, remorseful。
自責 remorseful は、自分の行動を責める視線・口元・手の緊張。重い事実を受け止める沈痛 pained と区別する。場面の追加やストーリー変更はしない。
保存仕様：背景付き1920×1080、左に全身、右に4×2の8表情。原本を必要に応じてキャンバス全体で等比調整する。
生成原本：C:/Users/lemon/.codex/generated_images/01a123a2-b46f-77d3-b27e-a7f8a37b3920/exec-672498a1-b4c1-4bea-a7cb-2c42d846e93f.png（1672×941）。
書き出し：キャンバス全体を1919×1080へ等比調整、背景色の余白で1920×1080へ保存。四隅のアルファ255を確認。

```text
Use case: stylized-concept character expression review sheet.
The supplied revised Takase Naoto full-body prototype3 is the EXACT identity/color reference. Preserve his DISTINCT ordinary broader face: fuller cheek width, broad softly rounded jaw/chin, small modest slightly downturned eyes, rounded nose, wider natural mouth, earnest Japanese man29, no glasses/stubble. Keep natural LIGHTER MEDIUM BROWN short practical hair, PALE LIGHT SKY BLUE cotton WORK BLOUSON (not navy), light-gray T-shirt, beige work trousers and dark sturdy shoes. No generic sharp handsome Segawa-like face, no V chin, no fashion-idol makeover. Fine mature manga outlines and restrained painterly shading; same face, hair, body and garment details in every panel.
OPAQUE light neutral cool-gray setting sheet, WIDE16:9 intended1920x1080. LEFT22%: title '高瀬 直人 / Takase Naoto', subtitle '表情確認シート・試作'. Full-body neutral standing base below title, hair top and both shoes entire and uncropped, arms relaxed at sides. RIGHT78%: FOUR columns by TWO rows of EXACTLY EIGHT equal bordered panels, each HEAD TO WAIST including all hand gestures/elbows with same face scale, shallow three-quarter view, hair tops not clipped. Clear label bar below each panel. No panels overlap and no extra text.
TOP ROW left-to-right:
1 '通常 / neutral': calm reserved earnest expression, closed relaxed mouth, hands lightly together at waist.
2 '微笑み / smile': small sincere smile, soft eyes, one hand slightly open near waist as practical reassurance, no flirtation.
3 '真剣 / serious': concentrated explaining/listening, mildly firm brows, mouth slightly parted, one open palm below chest, other near waist, no anger.
4 '驚き / surprised': moderately raised brows/widened eyes and parted lips, one hand lifted in front of lower chest with relaxed fingers, face clear.
BOTTOM ROW left-to-right:
5 '心配 / worried': alert uncertainty, slightly sideways gaze, tense lips, loosely curling one hand and supporting with other at waist as natural regripping, not aggressive fists.
6 '沈痛 / pained': heavy pain receiving a difficult fact, eyes looking down, sorrowful brow/mouth, shoulders lower, hands lightly joined low at waist. Not tears/sobbing; restrained.
7 '安堵 / relieved': eyelids/brows relax and a faint relieved smile, softened shoulders, hands relaxed loosely overlapped at waist.
8 '自責 / remorseful': GUILT and inner self-reproach visibly tormenting him, clearly more internally conflicted than pained. He cannot meet the listener's eyes: gaze down and away, inner eyebrows raised and drawn together, mouth tightly pressed with corners tense, shoulders drawn slightly inward. One hand's fingers gently press temple/side of forehead WITHOUT covering eyes or face; the other forearm rests across lower abdomen supporting the elbow. Quiet adult guilt and regret, not anger, not a sinister smirk, not medical headache illustration, not hysterical crying. Face remains recognizably the same broad ordinary man, serious responsible demeanor. Hand and eye tension distinguish from simple grief and worry.
Anatomically correct hands/five fingers each. Same jacket pocket and zip details in every panel. No tools, notebooks, names/logos/brands, extra props, story text, extra characters or glow. This is human review material on an OPAQUE background, not a game sprite atlas. Latest revised face/color and new remorseful gesture require user review. Do not infer plot developments from an expression.
```
