import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('話題と調査対象の状態は項目名の後に同じ行内で表示し、戻るには矢印を表示する', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { StoryContent } = await server.ssrLoadModule('/src/features/story/StoryContent.tsx')
    const { freeActionDemo: scenario } = await server.ssrLoadModule('/src/data/scenario/freeActionDemo.ts')
    const { createInitialState } = await server.ssrLoadModule('/src/features/story/state.ts')
    const initial = createInitialState(scenario)
    const render = (nodeId, extra = {}) => renderToStaticMarkup(createElement(StoryContent, {
      node: scenario.nodes[nodeId], state: { ...initial, nodeId, ...extra }, thinking: false, dispatch: () => {},
    }))
    const topics = render('topics', { heardTopics: ['brother'] })
    assert.match(topics, /command-name">兄について<\/span><span class="item-status">既読/)
    assert.match(topics, /command-name">最近の兄について<\/span><span class="item-status is-new">NEW/)
    assert.match(topics, /command-name">失踪について<\/span><span class="item-status">未実行/)
    const targets = render('targets', { inspectedTargets: ['photo'] })
    assert.match(targets, /command-name">兄の写真<\/span><span class="item-status">調査済み/)
    for (const html of [topics, targets]) {
      assert.match(html, /command-name">戻る<\/span><span class="command-arrow"/)
      assert.doesNotMatch(html, /message-window/)
    }
  } finally { await server.close() }
})
