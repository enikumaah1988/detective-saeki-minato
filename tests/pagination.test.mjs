import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { graphemes, paginateText } from '../src/features/story/pagination.ts'
import { freeActionDemo as scenario } from '../src/data/scenario/freeActionDemo.ts'
let SelectionGate, createPlayback, reducePlayback
before(async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try { ({ SelectionGate, createPlayback, reducePlayback } = await server.ssrLoadModule('/src/features/story/playback.ts')) } finally { await server.close() }
})

test('日本語・結合文字・複合絵文字・明示改行を欠落せずページに保持する', () => {
  const text = '湊か\u3099👨‍👩‍👧‍👦🇯🇵👍🏽\n\n澪\n最後の一行'
  const units = graphemes(text)
  for (const cluster of ['か\u3099', '👨‍👩‍👧‍👦', '🇯🇵', '👍🏽']) assert.ok(units.includes(cluster))
  // 計測結果だけを注入する。実寸の測定はブラウザー検証で行う。
  const pages = paginateText(text, value => value.split('\n').length <= 3 && graphemes(value).length <= 6)
  assert.ok(pages.length > 1)
  assert.equal(pages.join(''), text)
  for (const cluster of ['か\u3099', '👨‍👩‍👧‍👦', '🇯🇵', '👍🏽']) assert.ok(pages.some(page => page.includes(cluster)))
  assert.deepEqual(paginateText('', () => true), [''])
})

test('途中ページ・全文表示では更新せず、最終ページを1回だけ完了する。MENUで位置を保持する', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { DialogueWindow } = await server.ssrLoadModule('/src/features/story/DialogueWindow.tsx')
    let current = createPlayback(scenario)
    current.game.nodeId = 'photo'
    const origin = { nodeId: current.game.nodeId, generation: current.generation }
    let advances = 0
    const props = { text: '一頁👨‍👩‍👧‍👦二頁', speaker: '湊', thinking: false, onAdvance: () => {
      advances++; current = reducePlayback(scenario, current, { type: 'input', origin, action: { type: 'advance' } })
    } }
    const dialogue = new DialogueWindow(props)
    dialogue.state.pages = ['一頁👨‍👩‍👧‍👦', '二頁']
    dialogue.setState = (update, callback) => { dialogue.state = { ...dialogue.state, ...(typeof update === 'function' ? update(dialogue.state) : update) }; callback?.() }
    dialogue.activate() // first page full
    assert.equal(dialogue.state.visible, 3)
    assert.deepEqual(current.game.inspectedTargets, [])
    dialogue.activate() // second page
    assert.equal(dialogue.state.page, 1)
    assert.equal(dialogue.state.visible, 0)
    dialogue.props = { ...props, paused: true }
    dialogue.activate()
    assert.equal(dialogue.state.page, 1)
    assert.equal(dialogue.state.visible, 0)
    dialogue.props = props
    dialogue.activate() // final page full
    assert.equal(advances, 0)
    assert.deepEqual(current.game.flags, {})
    dialogue.activate(); dialogue.activate() // final completion twice
    assert.equal(advances, 1)
    assert.equal(current.game.nodeId, 'menu')
    assert.equal(current.game.flags.photo_examined, true)
    assert.deepEqual(current.game.inspectedTargets, ['photo'])
    const restored = new DialogueWindow(props)
    assert.equal(restored.state.page, 0)
    assert.equal(restored.state.visible, 0)
  } finally { await server.close() }
})

test('別項目の連続クリックを排他化し、MENUでキャンセルしたタイマーと古いコールバックを拒否する', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  const timeout = globalThis.setTimeout, clear = globalThis.clearTimeout
  try {
    const { CommandButton } = await server.ssrLoadModule('/src/features/story/CommandButton.tsx')
    const callbacks = [], selected = [], gate = new SelectionGate()
    globalThis.setTimeout = callback => { callbacks.push(callback); return callbacks.length }
    globalThis.clearTimeout = () => {}
    const props = id => ({ children: id, acquire: gate.acquire, release: gate.release, onSelect: () => selected.push(id) })
    const a = new CommandButton(props('a')), b = new CommandButton(props('b'))
    for (const button of [a, b]) button.setState = update => { button.state = { ...button.state, ...update } }
    a.select(); a.select(); b.select()
    assert.equal(callbacks.length, 1)
    assert.equal(a.state.selected, true)
    assert.equal(b.state.selected, false)
    const unrelated = new CommandButton(props('unrelated'))
    unrelated.componentWillUnmount()
    assert.equal(gate.acquire(), false) // 未選択項目の非表示で他項目のロックを解除しない。
    a.props = { ...a.props, paused: true }; a.componentDidUpdate()
    a.props = props('a'); a.select()
    assert.equal(callbacks.length, 2)
    callbacks[0]() // cancellation even after reopening
    assert.deepEqual(selected, [])
    callbacks[1]()
    assert.deepEqual(selected, ['a'])
    b.select(); b.componentWillUnmount(); callbacks[2]()
    assert.deepEqual(selected, ['a'])
  } finally { globalThis.setTimeout = timeout; globalThis.clearTimeout = clear; await server.close() }
})

test('React更新待ちの同一ページへの連打で全文表示と次ページが重複しない', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { DialogueWindow } = await server.ssrLoadModule('/src/features/story/DialogueWindow.tsx')
    const dialogue = new DialogueWindow({ text: '一二三', speaker: '湊', thinking: false, onAdvance: () => assert.fail('途中で進行してはいけない') })
    dialogue.state.pages = ['一', '二', '三']
    const pending = []
    dialogue.setState = (update, callback) => pending.push(() => {
      dialogue.state = { ...dialogue.state, ...(typeof update === 'function' ? update(dialogue.state) : update) }; callback?.()
    })
    dialogue.activate(); dialogue.activate()
    assert.equal(pending.length, 1)
    pending.shift()()
    assert.equal(dialogue.state.page, 0)
    assert.equal(dialogue.state.visible, 1)
    dialogue.activate(); dialogue.activate()
    assert.equal(pending.length, 1)
    pending.shift()()
    assert.equal(dialogue.state.page, 1)
    assert.equal(dialogue.state.visible, 0)
  } finally { await server.close() }
})
