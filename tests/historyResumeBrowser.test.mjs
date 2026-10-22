import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision } from './revisionHarness.mjs'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5191/'
for (const [width, height] of [[1920, 1080], [1366, 768]]) test(`履歴の高速開閉後も文字途中・次ページ・次ノードへ復帰 ${width}`, { skip: !path, timeout: 60000 }, async () => {
  const api = await loadRevision(), { chromium } = await import(path)
  const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width, height } })
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  const text = '雨は窓を叩き続けていた。'.repeat(45)
  const initialHistory = [{ speaker: '湊', text: '調査を始めよう。', nodeId: 'P1-01-intro' }]
  try {
    // 長文だけを差し替え、実際の StoryPlayer・履歴・入力経路を使う。
    await page.route(/\/src\/data\/scenario\/episode1Part1\.ts(?:\?|$)/, async route => {
      const response = await route.fetch()
      await route.fulfill({ response, body: `${await response.text()}\nepisode1Part1.nodes['P1-01-intro'].text = ${JSON.stringify(text)};` })
    })
    await page.goto(url)
    await page.evaluate(({ data, history }) => {
      localStorage.clear()
      localStorage.setItem('detective-saeki-minato.speed', '70')
      localStorage.setItem('detective-saeki-minato.slots.v1', JSON.stringify({ version: 1, auto: null, manual: [{ data, history, label: '履歴復帰', savedAt: '' }] }))
    }, { data: api.createSaveData({ ...api.createInitialState(api.scenario), nodeId: 'P1-01-intro' }), history: initialHistory })
    await page.reload()
    const now = new Date('2026-10-22T00:00:00Z')
    await page.clock.install({ time: now })
    await page.clock.pauseAt(new Date(now.getTime() + 1000))
    await page.getByRole('button', { name: 'CONTINUE', exact: true }).click()
    await page.getByRole('button', { name: 'SAVE １', exact: true }).click()
    const dialogue = page.locator('.story-content .dialogue-button')
    const visible = dialogue.locator('.dialogue > [aria-hidden="true"]')
    const node = () => page.locator('.story').getAttribute('data-node-id')
    const opener = page.getByLabel('会話履歴を開く', { exact: true })
    const history = page.getByRole('dialog', { name: '会話履歴', exact: true })
    await dialogue.waitFor()
    // フォント・実測ページ分割の完了を待ってから時計で文字数を制御する。
    await page.evaluate(() => document.fonts.ready)
    await page.clock.runFor(350)
    assert.ok(Number(await dialogue.getAttribute('data-pages')) > 1)
    const roundTrip = async key => {
      const pageBefore = await dialogue.getAttribute('data-page')
      await opener.click()
      const paused = await visible.textContent()
      assert.ok(paused.length > 0)
      assert.equal(await dialogue.locator('.next').count(), 0)
      assert.equal(await history.locator('article').count(), 1)
      await page.clock.runFor(280)
      assert.equal(await visible.textContent(), paused, '履歴中はタイプライター停止')
      // 背面の進行入力も履歴表示中は受理しない。
      await dialogue.evaluate(button => button.click())
      assert.equal(await visible.textContent(), paused)
      await history.getByRole('button', { name: '閉じる', exact: true }).press(key)
      await page.clock.runFor(140)
      assert.equal(await node(), 'P1-01-intro')
      assert.equal(await dialogue.getAttribute('data-page'), pageBefore)
      const resumed = await visible.textContent()
      assert.ok(resumed.startsWith(paused) && resumed.length > paused.length, '同じ文字位置から再開')
      assert.equal(await opener.evaluate(button => button === document.activeElement), true)
    }
    for (const key of ['Escape', 'Enter', 'Space', 'Escape']) await roundTrip(key)
    await dialogue.press('Space') // 残りの文字を表示する入力はページを送らない。
    assert.equal(await dialogue.getAttribute('data-page'), '1')
    await dialogue.press('Enter')
    await page.clock.runFor(210)
    assert.equal(await dialogue.getAttribute('data-page'), '2')
    await roundTrip('Escape')
    // 最終ページまで読み、復帰後の入力で次ノードへ一度だけ進む。
    const pages = Number(await dialogue.getAttribute('data-pages'))
    for (let index = 2; index <= pages; index++) {
      await dialogue.click()
      await dialogue.locator('.next').waitFor()
      await dialogue.click()
    }
    assert.equal(await node(), api.reduceGameState(api.scenario, { ...api.createInitialState(api.scenario), nodeId: 'P1-01-intro' }, { type: 'advance' }).nodeId)
    await opener.click()
    assert.equal(await history.locator('article').count(), 2)
    assert.equal(await history.locator('article p').last().textContent(), text)
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})
