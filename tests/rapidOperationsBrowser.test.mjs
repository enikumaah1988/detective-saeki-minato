import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5411/'

test('移動ボタンの同一フレーム連打で移動コールバックを一度だけ実行する', { skip: !path, timeout: 60000 }, async () => {
  const { chromium } = await import(path), browser = await chromium.launch()
  const page = await browser.newPage()
  try {
    await page.goto(url)
    await page.evaluate(async () => {
      const { mountMap } = await import('/tests/fixtures/rapidOperations.tsx')
      window.moves = []
      window.backs = 0
      window.disposeMap = mountMap(id => window.moves.push(id), () => window.backs++)
    })
    await page.getByRole('button', { name: '東成ビルサービスを選択', exact: true }).click()
    await page.getByRole('button', { name: 'ここへ移動', exact: true }).evaluate(element => {
      for (let index = 0; index < 20; index++) element.click()
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      document.querySelector('.travel-map header button').click()
    })
    await page.waitForTimeout(500)
    assert.deepEqual(await page.evaluate(() => window.moves), ['company'])
    assert.equal(await page.evaluate(() => window.backs), 0)
    await page.evaluate(async () => {
      window.disposeMap()
      const { mountMap } = await import('/tests/fixtures/rapidOperations.tsx')
      window.disposeMap = mountMap(id => window.moves.push(id), () => window.backs++)
    })
    await page.getByRole('button', { name: '東成ビルサービスを選択', exact: true }).click()
    await page.getByRole('button', { name: 'ここへ移動', exact: true }).evaluate(element => {
      element.click()
      window.disposeMap()
    })
    await page.waitForTimeout(500)
    assert.deepEqual(await page.evaluate(() => window.moves), ['company'], '画面を閉じた後の移動通知を取り消す')
  } finally { await browser.close() }
})

for (const touch of [false, true]) {
  test(`${touch ? '横画面タップ' : 'クリック'}連続操作: 会話・選択肢・調査・移動の進行を重複しない`, { skip: !path, timeout: 60000 }, async () => {
    const api = await loadRevision(), run = buildPlaythrough(api, true)
    const { chromium } = await import(path), browser = await chromium.launch()
    const page = await browser.newPage({ viewport: touch ? { width: 844, height: 390 } : { width: 1366, height: 768 }, hasTouch: touch, isMobile: touch })
    const errors = []; page.on('pageerror', error => errors.push(error.message))
    const mount = async state => {
      await page.goto(url)
      await page.evaluate(async state => {
        localStorage.setItem('detective-saeki-minato.speed', '0')
        const { mountStory } = await import('/tests/fixtures/rapidOperations.tsx')
        mountStory(state)
      }, state)
      await page.locator('.story').waitFor()
    }
    const nodeId = () => page.locator('.story').getAttribute('data-node-id')
    const activate = async locator => touch ? locator.tap() : locator.click()
    const burst = async locator => locator.evaluate(element => {
      const siblings = [...element.parentElement.querySelectorAll('button')]
      for (let index = 0; index < 20; index++) { element.click(); siblings[(index + 1) % siblings.length]?.click() }
    })
    try {
      const state = { ...api.createInitialState(api.scenario), nodeId: 'P1-01-intro' }
      await mount(state)
      await page.locator('.dialogue-button .next').waitFor()
      const expected = api.reduceGameState(api.scenario, state, { type: 'advance' })
      await burst(page.locator('.dialogue-button'))
      await page.waitForFunction(id => document.querySelector('.story')?.dataset.nodeId === id, expected.nodeId)
      await page.getByRole('button', { name: '会話履歴を開く' }).click()
      assert.equal(await page.locator('.history-list article').count(), 1)
      await page.getByRole('dialog', { name: '会話履歴', exact: true }).getByRole('button', { name: '閉じる', exact: true }).click()
      assert.equal(await nodeId(), expected.nodeId)

      const menu = run.checkpoints.find(point => point.phase === 'P1-01').state
      await mount(menu)
      // Touch/click enters the menu; a same-frame storm then mixes competing targets.
      await activate(page.getByRole('button', { name: '見る', exact: true }))
      await page.getByLabel('調査対象', { exact: true }).waitFor()
      const inspected = { ...menu, nodeId: await nodeId() }
      const choices = api.visibleChoices(api.scenario.nodes[inspected.nodeId], inspected)
      const first = choices.find(option => option.id !== 'return')
      const target = page.locator('.command-panel button').filter({ has: page.locator('.command-name', { hasText: new RegExp(`^${first.label}$`) }) })
      await burst(target)
      const result = api.reduceGameState(api.scenario, inspected, { type: 'choose', choiceId: first.id })
      await page.waitForFunction(id => document.querySelector('.story')?.dataset.nodeId === id, result.nodeId)
      await page.waitForTimeout(250)
      assert.equal(await nodeId(), result.nodeId)

      const map = { ...run.checkpoints.find(point => point.phase === 'P2-01').state, nodeId: 'P2-01-map' }
      await mount(map)
      await activate(page.getByRole('button', { name: '東成ビルサービスを選択', exact: true }))
      const moved = api.reduceGameState(api.scenario, map, { type: 'choose', choiceId: 'company' })
      await burst(page.getByRole('button', { name: 'ここへ移動', exact: true }))
      await page.waitForFunction(id => document.querySelector('.story')?.dataset.nodeId === id, moved.nodeId)
      await page.waitForTimeout(400)
      assert.equal(await nodeId(), moved.nodeId)
      assert.deepEqual(errors, [])
    } finally { await browser.close() }
  })
}
