import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('PC会話の文字送り・全文表示・進行・中断とコマンドの選択遅延', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { DialogueWindow } = await server.ssrLoadModule('/src/features/story/DialogueWindow.tsx')
    const { CommandButton, COMMAND_HIGHLIGHT_MS } = await server.ssrLoadModule('/src/features/story/CommandButton.tsx')
    let advances = 0
    const props = { text: '湊😀', speaker: '佐伯湊', thinking: false, onAdvance: () => advances++ }
    const window = new DialogueWindow(props)
    window.setState = (update, callback) => { window.state = { ...window.state, ...(typeof update === 'function' ? update(window.state) : update) }; callback?.() }
    const interval = globalThis.setInterval
    const clear = globalThis.clearInterval
    let tick, cleared = false
    try {
      globalThis.setInterval = (fn) => { tick = fn; return 1 }
      globalThis.clearInterval = () => { cleared = true }
      window.componentDidMount()
      tick()
      assert.equal(window.state.visible, 1)
      window.props = { ...props, paused: true }
      tick(); window.activate()
      assert.equal(window.state.visible, 1)
      assert.equal(advances, 0)
      window.props = props
      window.activate()
      assert.equal(window.state.visible, 2)
      assert.match(renderToStaticMarkup(window.render()), /▼/)
      window.activate()
      assert.equal(advances, 1)
      window.componentWillUnmount()
      assert.ok(cleared)
      const remounted = new DialogueWindow(props)
      remounted.setState = (update, callback) => { remounted.state = { ...remounted.state, ...(typeof update === 'function' ? update(remounted.state) : update) }; callback?.() }
      assert.equal(remounted.state.visible, 0)
      // StrictModeのmount→unmount→mountでも文字送りと入力が停止しない。
      remounted.componentDidMount(); remounted.componentWillUnmount(); remounted.componentDidMount()
      tick(); assert.equal(remounted.state.visible, 1)
      remounted.activate(); assert.equal(remounted.state.visible, 2)
      remounted.componentWillUnmount()
    } finally { globalThis.setInterval = interval; globalThis.clearInterval = clear }

    const timeout = globalThis.setTimeout
    const clearTimeoutOriginal = globalThis.clearTimeout
    let callback, delay, selections = 0
    try {
      globalThis.setTimeout = (fn, ms) => { callback = fn; delay = ms; return 1 }
      globalThis.clearTimeout = () => { callback = undefined }
      const button = new CommandButton({ children: '聞く', onSelect: () => selections++ })
      button.setState = (update) => { button.state = { ...button.state, ...update } }
      button.select()
      assert.equal(delay, COMMAND_HIGHLIGHT_MS)
      assert.equal(delay, 150)
      assert.equal(selections, 0)
      assert.equal(button.render().props.className, 'is-selected')
      callback()
      assert.equal(selections, 1)
      button.select()
      button.props = { ...button.props, paused: true }
      button.componentDidUpdate()
      assert.equal(callback, undefined)
      assert.equal(button.state.selected, false)
      button.select()
      assert.equal(selections, 1)
    } finally { globalThis.setTimeout = timeout; globalThis.clearTimeout = clearTimeoutOriginal }
  } finally { await server.close() }
})

test('上部共通UI・未実装コマンド・シナリオ指定の人物位置を反映する', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { StoryPlayer } = await server.ssrLoadModule('/src/features/story/StoryPlayer.tsx')
    const { StoryContent } = await server.ssrLoadModule('/src/features/story/StoryContent.tsx')
    const { StageView } = await server.ssrLoadModule('/src/features/story/StageView.tsx')
    const { freeActionDemo: scenario } = await server.ssrLoadModule('/src/data/scenario/freeActionDemo.ts')
    const { createInitialState } = await server.ssrLoadModule('/src/features/story/state.ts')
    const player = renderToStaticMarkup(createElement(StoryPlayer, { scenario }))
    for (const label of ['MENU', '調査記録', 'タバコを吸う', '日時未設定']) assert.ok(player.includes(label))
    const menu = renderToStaticMarkup(createElement(StoryContent, { node: scenario.nodes.menu, state: createInitialState(scenario), thinking: false, dispatch: () => {} }))
    assert.doesNotMatch(menu, /message-window/)
    for (const label of ['聞く', '調べる']) assert.ok(menu.includes(label))
    assert.doesNotMatch(menu, /考える/)
    const readyState = { ...createInitialState(scenario), acquiredInformation: scenario.nodes.think.requiredInformation.map(info => info.id) }
    const readyMenu = renderToStaticMarkup(createElement(StoryContent, { node: scenario.nodes.menu, state: readyState, thinking: false, dispatch: () => {} }))
    assert.deepEqual([...readyMenu.matchAll(/class="command-name">([^<]+)/g)].map(match => match[1]), ['考える'])
    assert.doesNotMatch(readyMenu, /聞く|調べる/)
    assert.doesNotMatch(menu, /整理する|移動|未実装/)
    assert.equal((menu.match(/ disabled=""/g) ?? []).length, 0)
    for (const position of ['left', 'center', 'right']) {
      const html = renderToStaticMarkup(createElement(StageView, { stage: { backgroundId: 'office-afternoon', characters: [{ characterId: 'minato', expression: 'normal', position }] } }))
      assert.ok(html.includes(`character--${position}`))
    }
  } finally { await server.close() }
})
