import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
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
  assert.match(html, /佐伯湊/)
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
  assert.match(completeMenu, /聞く[\s\S]*調べる[\s\S]*考える/)
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

test('考えるは選択肢ではなく佐伯の内心会話として表示する', () => {
  const html = render({ ...createInitialState(scenario), nodeId: 'think' })
  assert.match(html, /心の声/)
  assert.match(html, /まだ材料が足りない/)
  assert.doesNotMatch(html, /command-list|item-list/)
})

test('保存操作は閉じたメニュー内にまとまり、画面は上下の構造を持つ', () => {
  const state = createInitialState(scenario)
  const html = renderToStaticMarkup(createElement(SaveControls, { state, scenario, onRestore: () => {} }))
  assert.match(html, /<details class="save-controls">/)
  assert.doesNotMatch(html, /<details[^>]*\bopen/)
  for (const label of ['メニュー', 'セーブ', 'ロード', 'セーブデータ削除']) assert.ok(html.includes(label))
  const player = renderToStaticMarkup(createElement(StoryPlayer, { scenario }))
  assert.ok(player.indexOf('stage-wrapper') < player.indexOf('message-window'))
  assert.match(player, /dialogue-button/)
})


test('ゲーム本体を先に表示し、常時タイトルと開発切替を分離する', () => {
  const html = renderToStaticMarkup(createElement(App))
  assert.doesNotMatch(html, /<h1/)
  assert.ok(html.indexOf('class="story"') < html.indexOf('class="scene-selector"'))
  assert.match(html, /dev-label.*DEV/)
  assert.doesNotMatch(html, /クリック・タップ \/ Enter・Space/)
})

test('画像表示中は素材ラベルを重ねず、未設定と読み込み失敗で代替表示する', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { StageView, AssetImage } = await server.ssrLoadModule('/src/features/story/StageView.tsx')
    const html = renderToStaticMarkup(createElement(StageView, { stage: scenario.nodes['office-daily'].stage }))
    assert.doesNotMatch(html, /background-label|人物表示領域|character-placeholder/)
    const fallback = createElement('span', null, '代替人物')
    const image = new AssetImage({ src: '/missing.svg', alt: '人物', className: 'character-image', fallback })
    image.setState = (update) => { image.state = { ...image.state, ...update } }
    image.render().props.onError()
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
  assert.equal((save.match(/class="ui-icon"/g) ?? []).length, 4)
})
