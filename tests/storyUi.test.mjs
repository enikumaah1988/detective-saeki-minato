import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from './viteServer.mjs'
import { loadRevision } from './revisionHarness.mjs'
import { freeActionDemo as scenario } from '../src/data/scenario/freeActionDemo.ts'
let App, StoryContent, StoryPlayer, SaveControls, choiceStatus, selectCurrentNode, createInitialState
before(async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    App = (await server.ssrLoadModule('/src/app/App.tsx')).default
    const content = await server.ssrLoadModule('/src/features/story/StoryContent.tsx')
    StoryContent = content.StoryContent
    choiceStatus = content.choiceStatus
    const player = await server.ssrLoadModule('/src/features/story/StoryPlayer.tsx')
    StoryPlayer = player.StoryPlayer
    const controls = await server.ssrLoadModule('/src/features/story/SaveControls.tsx')
    SaveControls = controls.SaveControls
    const state = await server.ssrLoadModule('/src/features/story/state.ts')
    selectCurrentNode = state.selectCurrentNode
    createInitialState = state.createInitialState
  } finally { await server.close() }
})
const render = (state) => renderToStaticMarkup(createElement(StoryContent, {
  node: selectCurrentNode(scenario, state), state, thinking: state.nodeId === 'think', dispatch: () => {},
}))

test('通常会話には話者・本文・次へがあり、自由行動コマンドはない', () => {
  const html = render(createInitialState(scenario))
  assert.match(html, /佐伯　湊/)
  assert.match(html, /次へ/)
  assert.doesNotMatch(html, /聞く|見る／調べる|考える/)
  const actions = []
  const element = StoryContent({ node: scenario.nodes['office-daily'], state: createInitialState(scenario), thinking: false, dispatch: (action) => actions.push(action) })
  const dialogue = new element.type(element.props)
  dialogue.setState = (update, callback) => { dialogue.state = { ...dialogue.state, ...update }; callback?.() }
  assert.equal(dialogue.render().type, 'button')
  dialogue.activate()
  assert.deepEqual(actions, [])
  dialogue.activate()
  assert.deepEqual(actions, [{ type: 'advance' }])
})

test('自由行動は解放済みコマンドだけ表示し、一覧の条件付き表示と再選択を維持する', () => {
  const initial = createInitialState(scenario)
  const menu = render({ ...initial, nodeId: 'menu' })
  for (const label of ['聞く', '調べる']) assert.ok(menu.includes(label))
  assert.doesNotMatch(menu, /考える/)
  const completeMenu = render({ ...initial, nodeId: 'menu', acquiredInformation: scenario.nodes.think.requiredInformation.map(info => info.id) })
  assert.match(completeMenu, /考える/)
  assert.doesNotMatch(completeMenu, /聞く|調べる/)
  const topics = { ...initial, nodeId: 'topics' }
  assert.doesNotMatch(render(topics), /最近の兄について/)
  assert.match(render(topics), /未実行/)
  const unlocked = { ...topics, heardTopics: ['brother'] }
  assert.match(render(unlocked), /最近の兄について/)
  assert.match(render(unlocked), /NEW/)
  assert.equal(choiceStatus(scenario.nodes.topics, scenario.nodes.topics.options[0], unlocked), '既読')
  const read = { ...unlocked, heardTopics: ['brother', 'recent-brother'] }
  assert.equal(choiceStatus(scenario.nodes.topics, scenario.nodes.topics.options[2], read), '既読')
  assert.match(render(read), /最近の兄について/)
  const target = { ...initial, nodeId: 'targets', inspectedTargets: ['photo'] }
  assert.match(render(target), /兄の写真/)
  assert.match(render(target), /調査済み/)
  assert.equal(choiceStatus(scenario.nodes.targets, { id: 'return' }, target), undefined)
})

test('考えるは話者見出し・下線なしの本文だけで表示し、通常会話の話者表示は維持する', () => {
  const html = render({ ...createInitialState(scenario), nodeId: 'think' })
  assert.match(html, /まだ材料が足りない/)
  assert.doesNotMatch(html, /class="speaker"|心の声/)
  assert.doesNotMatch(html, /command-list|item-list/)
  assert.match(render(createInitialState(scenario)), /class="speaker">佐伯　湊/)
})

test('保存操作は閉じたメニュー内にまとまり、画面は上下の構造を持つ', () => {
  const state = createInitialState(scenario)
  const html = renderToStaticMarkup(createElement(SaveControls, { state, scenario, onRestore: () => {} }))
  assert.match(html, /<details class="save-controls">/)
  assert.doesNotMatch(html, /<details[^>]*\bopen/)
  for (const label of ['メニュー', 'SAVE', 'LOAD']) assert.ok(html.includes(label))
  const player = renderToStaticMarkup(createElement(StoryPlayer, { scenario }))
  assert.ok(player.indexOf('stage-wrapper') < player.indexOf('message-window'))
  assert.match(player, /dialogue-button/)
})


test('自由行動・サブメニューは調査記録と喫煙を表示し、履歴は会話窓がある時だけ表示する', () => {
  const state = createInitialState(scenario)
  for (const nodeId of ['menu', 'topics', 'targets']) {
    const html = renderToStaticMarkup(createElement(StoryPlayer, { scenario, initialSession: { state: { ...state, nodeId }, history: [] } }))
    assert.doesNotMatch(html, /history-entry|message-window/)
    assert.match(html, /<button(?![^>]*hidden)[^>]*><svg[^>]*>.*?<span>調査記録<\/span>/s)
    assert.match(html, /<button(?![^>]*hidden)[^>]*><svg[^>]*>.*?<span>タバコを吸う<\/span>/s)
  }
  const html = renderToStaticMarkup(createElement(StoryPlayer, { scenario }))
  assert.match(html, /message-window/)
  assert.match(html, /history-entry/)
})

test('本編の通常選択・サブコマンド・屋外でも上部操作を表示し、会話窓のない履歴は隠す', async () => {
  const api = await loadRevision()
  const state = api.createInitialState(api.scenario)
  const entries = Object.entries(api.scenario.nodes).filter(([, node]) => node.type === 'choice' && !node.map && !node.illustration && node.sceneId !== 'episode-prologue-scene' && !['P4-09', 'P4-10', 'P4-11'].includes(node.savePhaseId))
  assert.ok(entries.some(([, node]) => !node.mode && node.prompt.endsWith('前')))
  assert.ok(entries.some(([, node]) => !node.mode && node.prompt === '移動'))
  for (const [nodeId] of entries) {
    const html = renderToStaticMarkup(createElement(StoryPlayer, { scenario: api.scenario, initialSession: { state: { ...state, nodeId }, history: [] } }))
    for (const label of ['調査記録', 'タバコを吸う']) {
      const button = [...html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)].find(([markup]) => markup.includes(`<span>${label}</span>`))
      assert.ok(button, `${nodeId}: ${label}`)
      assert.doesNotMatch(button[0].slice(0, button[0].indexOf('>')), /\bhidden=/, `${nodeId}: ${label}`)
    }
    assert.doesNotMatch(html, /history-entry|message-window/, nodeId)
    assert.match(html, /<div class="scene-context">/, nodeId)
  }
})

test('通常起動はタイトル画面を表示し、開発切替は表示しない', () => {
  const html = renderToStaticMarkup(createElement(App))
  assert.match(html, /<h1/)
  assert.match(html, /タイトル画面/)
  assert.match(html, /NEW GAME.*CONTINUE.*SETTINGS/s)
  assert.match(html, /消された記録/)
  assert.doesNotMatch(html, /灰色の証言/)
  assert.doesNotMatch(html, /data-node-id=/)
  assert.doesNotMatch(html, /scene-selector|dev-label/)
  assert.doesNotMatch(html, /クリック・タップ \/ Enter・Space/)
})

test('読み込み待ちと失敗では代替表示し、準備済み画像に素材ラベルを重ねない', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { StageView, StageImage } = await server.ssrLoadModule('/src/features/story/StageView.tsx')
    const html = renderToStaticMarkup(createElement(StageView, { stage: scenario.nodes['office-daily'].stage }))
    assert.match(html, /background-label|character-silhouette/)
    const fallback = createElement('span', null, '代替人物')
    const image = new StageImage({ src: '/normal.svg', alt: '人物', className: 'character-image', fallback })
    assert.match(renderToStaticMarkup(image.render()), /代替人物/)
    image.state = { ...image.state, ready: { src: '/normal.svg', alt: '人物' } }
    const ready = renderToStaticMarkup(image.render())
    assert.match(ready, /class="character-image"/)
    assert.doesNotMatch(ready, /代替人物|background-label/)
    image.state = { ...image.state, failed: true }
    assert.strictEqual(image.render(), fallback)
  } finally { await server.close() }
})

test('自由行動とサブメニューは会話パネルを出さず、アイコン付き右側操作領域で表示する', () => {
  const initial = createInitialState(scenario)
  const menu = render({ ...initial, nodeId: 'menu' })
  assert.match(menu, /command-panel/)
  assert.match(menu, /ui-icon/)
  assert.doesNotMatch(menu, /message-window|window-label|行動を選択してください/)
  assert.ok(menu.includes('調べる'))
  assert.doesNotMatch(menu, /見る／調べる/)
  for (const nodeId of ['topics', 'targets']) {
    const html = render({ ...initial, nodeId })
    assert.match(html, /command-panel/)
    assert.match(html, /command-heading/)
    assert.doesNotMatch(html, /message-window|selection-window/)
    assert.match(html, /戻る/)
  }
  const save = renderToStaticMarkup(createElement(SaveControls, { state: initial, scenario, onRestore: () => {} }))
  for (const button of save.slice(save.indexOf('class="save-actions"'), save.indexOf('<hr')).matchAll(/<button\b[^>]*>([\s\S]*?)<[/]button>/g)) assert.match(button[1], /class="ui-icon"/)
  for (const nodeId of ['topics', 'targets']) {
    const html = render({ ...initial, nodeId })
    for (const button of html.matchAll(/<button\b[^>]*>([\s\S]*?)<[/]button>/g)) assert.match(button[1], /class="ui-icon"/)
  }
})
