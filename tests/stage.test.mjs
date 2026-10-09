import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

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
    assert.match(normal, /background-image/)
    assert.match(normal, /character-image/)
    assert.match(normal, /minato\/normal\.png/)
    assert.match(serious, /minato\/serious\.png/)
    const unknown = render({ backgroundId: 'unknown', characterId: 'unknown', expression: 'unknown' })
    assert.match(unknown, /未登録の背景/)
    assert.match(unknown, /未登録の人物/)
    assert.doesNotMatch(unknown, /<img/)
    const unknownExpression = render({ backgroundId: 'office-afternoon', characterId: 'minato', expression: 'unknown' })
    assert.match(unknownExpression, /佐伯湊/)
    assert.match(unknownExpression, /未登録の表情/)
    assert.doesNotMatch(unknownExpression, /character-image/)
  } finally {
    await server.close()
  }
})
