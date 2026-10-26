import test from 'node:test'
import assert from 'node:assert/strict'
import { loadCompleted, playCompleted } from './e01CompletedHarness.mjs'
import { loadForTest } from './saveUiHelpers.mjs'

const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = (process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5187/').split('?')[0]

for (const [width, height] of [[1920, 1080], [1366, 768]]) test(`新稿S01〜S06・誤答・図面照合・保存とタイトル復帰 ${width}`, { skip: !playwrightPath, timeout: 240000 }, async () => {
  const api = await loadCompleted()
  const run = playCompleted(api, { optional: width === 1920, reverse: width === 1366 })
  const { chromium } = await import(playwrightPath)
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width, height } })
  page.setDefaultTimeout(10000)
  const errors = []
  let liveState = run.states[0]
  page.on('pageerror', error => errors.push(error.message))
  const current = () => page.locator('.story').getAttribute('data-node-id')
  const choose = async id => {
    const before = await current()
    const state = liveState
    const node = api.scenario.nodes[before]
    const options = api.visibleChoices(node, state)
    const index = options.findIndex(option => option.id === id)
    assert.ok(index >= 0, before + ' ' + id)
    await page.locator('.command-panel button').nth(index).click()
    await page.waitForFunction(previous => document.querySelector('.story')?.getAttribute('data-node-id') !== previous, before)
  }
  const advance = async () => {
    const before = await current()
    for (let count = 0; count < 10 && await current() === before; count++) {
      await page.locator('.dialogue-button .next').waitFor()
      await page.locator('.dialogue-button').click()
      await page.waitForTimeout(40)
    }
    assert.notEqual(await current(), before)
  }
  const savedAt = new Set()
  try {
    await page.addInitScript(() => localStorage.setItem('detective-saeki-minato.speed', '0'))
    await page.goto(baseUrl)
    await page.getByRole('button', { name: 'NEW GAME', exact: true }).click()
    assert.equal(await current(), api.defaultScenario.start)
    const url = new URL(baseUrl); url.searchParams.set('scenario', api.scenario.id)
    await page.goto(url.href)
    await page.getByRole('button', { name: 'NEW GAME', exact: true }).click()
    await page.evaluate(() => document.fonts.ready)
    for (const [operationIndex, operation] of run.operations.entries()) {
      liveState = run.states[operationIndex]
      assert.equal(await current(), operation.before)
      if (['S05-select-current', 'S06-question2'].includes(operation.before) && !savedAt.has(operation.before)) {
        savedAt.add(operation.before)
        await page.getByLabel('メニュー', { exact: true }).click()
        await page.getByRole('button', { name: 'SAVE', exact: true }).click()
        await page.getByRole('dialog', { name: 'セーブしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
        await page.getByRole('dialog', { name: 'システムメニュー', exact: true }).waitFor({ state: 'hidden' })
        const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('detective-saeki-minato.slots.v1')).manual[0].data)
        assert.deepEqual(saved, api.createSaveData(liveState))
        // Progress, then load through the existing game menu.
        await choose(operation.action.choiceId)
        await page.getByLabel('メニュー', { exact: true }).click()
        await loadForTest(page)
        await page.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
        assert.equal(await current(), operation.before)
        // Reload shows the explicit scenario's title; CONTINUE restores this scenario.
        await page.reload()
        await page.getByRole('button', { name: 'CONTINUE', exact: true }).click()
        await page.getByRole('dialog', { name: 'CONTINUE', exact: true }).getByRole('button', { name: 'SAVE １', exact: true }).click()
        assert.equal(await current(), operation.before)
        await page.waitForFunction(() => document.querySelector('.stage .background-image')?.naturalWidth > 0 && document.querySelectorAll('.stage .character-silhouette').length === 0)
      }
      if (['S06-question1', 'S06-question2'].includes(operation.before)) {
        const original = liveState
        const wrongs = operation.before === 'S06-question1' ? ['A', 'C'] : ['A', 'B']
        for (const wrong of wrongs) {
          let state = api.reduceGameState(api.scenario, original, { type: 'choose', choiceId: wrong })
          await choose(wrong)
          while (state.nodeId !== original.nodeId) {
            assert.equal(await current(), state.nodeId)
            await advance()
            state = api.reduceGameState(api.scenario, state, { type: 'advance' })
          }
        }
      }
      if (operation.before === 'S05-menu' && !savedAt.has('records')) {
        savedAt.add('records')
        await page.getByRole('button', { name: '調査記録', exact: true }).click()
        assert.ok(await page.getByRole('button', { name: /最後に会ったとき/ }).count() || await page.locator('.investigation-records').count())
        await page.getByLabel('調査記録を閉じる', { exact: true }).click()
      }
      if (process.env.SAEKI_SCREENSHOT_DIR && ['S01-menu', 'S05-select-current', 'S06-question2'].includes(operation.before)) {
        await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/e01-${width}-${operation.before}.png` })
      }
      if (operation.action.type === 'advance') await advance()
      else await choose(operation.action.choiceId)
      assert.equal(await current(), operation.after)
    }
    assert.equal(await current(), 'S06-end')
    assert.match(await page.locator('.end-window').textContent(), /第２部は未実装/)
    if (process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/e01-${width}-end.png` })
    assert.deepEqual(errors, [])
  } catch (error) {
    console.error('Browser stopped at:', await current())
    if (process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/e01-${width}-failure.png` })
    throw error
  } finally { await browser.close() }
})
