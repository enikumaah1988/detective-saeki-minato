import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from './viteServer.mjs'

test('画像定義とフォールバックを表示 UI へ反映する', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { StageView, AssetImage } = await server.ssrLoadModule('/src/features/story/StageView.tsx')
    // DOM の画像エラーをコンポーネントの実際のハンドラーへ渡す。
    const image = new AssetImage({ src: '/missing.svg', alt: '仮画像', className: 'character-image' })
    image.setState = (update) => { image.state = { ...image.state, ...update } }
    image.render().props.onError()
    assert.equal(image.render(), null)
    // URL を key にするため、別画像へ移ると新しいインスタンスで再試行する。
    const retry = new AssetImage({ src: '/normal.svg', alt: '通常', className: 'character-image' })
    assert.equal(retry.render().props.src, '/normal.svg')
    const render = (stage) => renderToStaticMarkup(createElement(StageView, { stage }))
    const normal = render({ backgroundId: 'office-afternoon', characterId: 'minato', expression: 'normal' })
    const serious = render({ backgroundId: 'office-afternoon', characterId: 'minato', expression: 'serious' })
    // Static rendering has not loaded/decoded images yet. Keep a current-scene
    // fallback and a hidden loading image rather than presenting an empty img.
    assert.match(normal, /background-label/)
    assert.match(normal, /character-silhouette/)
    assert.match(normal, /style="display:none"/)
    assert.doesNotMatch(normal, /class="background-image"|class="character-image"/)
    assert.match(normal, /minato\/waist\/neutral\.png/)
    assert.match(serious, /minato\/waist\/serious\.png/)
    const unknown = render({ backgroundId: 'unknown', characterId: 'unknown', expression: 'unknown' })
    assert.match(unknown, /未登録の背景/)
    assert.match(unknown, /未登録の人物/)
    assert.doesNotMatch(unknown, /<img/)
    const unknownExpression = render({ backgroundId: 'office-afternoon', characterId: 'minato', expression: 'unknown' })
    assert.match(unknownExpression, /佐伯　湊/)
    assert.match(unknownExpression, /character-silhouette/)
    assert.doesNotMatch(unknownExpression, /character-image/)
  } finally {
    await server.close()
  }
})
