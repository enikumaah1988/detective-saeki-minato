import test from 'node:test'
import assert from 'node:assert/strict'
import { loadEpisode, playEpisode } from './e01EpisodeHarness.mjs'
import { loadForTest } from './saveUiHelpers.mjs'
const path = process.env.SAEKI_PLAYWRIGHT_PATH
const base = (process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5187/').split('?')[0]
for (const [width, height] of [[1920, 1080], [1366, 768]]) test(`完成稿30シーン・任意BAR・誤答・保存復帰 ${width}`, { skip: !path, timeout: 360000 }, async () => {
  const api = await loadEpisode()
  const run = playEpisode(api, { optional: width === 1920, reverse: width === 1366, bar: width === 1920, wrong: true })
  const { chromium } = await import(path)
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width, height } })
  page.setDefaultTimeout(10000)
  const errors = [], saved = new Set()
  page.on('pageerror', error => errors.push(error.message))
  const current = () => page.locator('.story').getAttribute('data-node-id')
  const input = async (operation, state) => {
    const before = await current()
    if (operation.action.type === 'choose') {
      const options = api.visibleChoices(api.scenario.nodes[before], state)
      const index = options.findIndex(option => option.id === operation.action.choiceId)
      assert.ok(index >= 0, before)
      await page.locator('.command-panel button').nth(index).click()
    } else {
      for (let count = 0; count < 16 && await current() === before; count++) {
        await page.locator('.dialogue-button .next').waitFor()
        await page.locator('.dialogue-button').click()
        await page.waitForTimeout(25)
      }
    }
    await page.waitForFunction(id => document.querySelector('.story')?.dataset.nodeId === id, operation.after)
  }
  try {
    await page.addInitScript(() => localStorage.setItem('detective-saeki-minato.speed', '0'))
    const url = new URL(base); url.searchParams.set('scenario', api.scenario.id)
    await page.goto(url.href)
    await page.getByRole('button', { name: 'NEW GAME', exact: true }).click()
    await page.evaluate(() => document.fonts.ready)
    for (const [index, operation] of run.operations.entries()) {
      const state = run.states[index]
      assert.equal(await current(), operation.before)
      if (['S08-route', 'S17-question2', 'S22-intro', 'S27-question3', 'BAR-B-menu'].includes(operation.before) && !saved.has(operation.before)) {
        saved.add(operation.before)
        await page.getByLabel('メニュー', { exact: true }).click()
        await page.getByRole('button', { name: 'SAVE', exact: true }).click()
        await page.getByRole('dialog', { name: 'セーブしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
        await page.getByRole('dialog', { name: 'システムメニュー', exact: true }).waitFor({ state: 'hidden' })
        const data = await page.evaluate(() => JSON.parse(localStorage.getItem('detective-saeki-minato.slots.v1')).manual[0].data)
        assert.deepEqual(data, api.createSaveData(state))
        await input(operation, state)
        await page.getByLabel('メニュー', { exact: true }).click()
        await loadForTest(page)
        await page.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
        assert.equal(await current(), operation.before)
        await page.reload()
        await page.getByRole('button', { name: 'CONTINUE', exact: true }).click()
        await page.getByRole('dialog', { name: 'CONTINUE', exact: true }).getByRole('button', { name: 'SAVE １', exact: true }).click()
        assert.equal(await current(), operation.before)
        console.log(`checkpoint ${width} ${operation.before}`)
      }
      if (process.env.SAEKI_SCREENSHOT_DIR && ['S08-route', 'S22-intro', 'S27-question3', 'BAR-B-menu'].includes(operation.before) && !saved.has(`shot:${operation.before}`)) {
        saved.add(`shot:${operation.before}`)
        await page.waitForFunction(() => [...document.querySelectorAll('.stage img')].every(image => image.complete && image.naturalWidth > 0))
        await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/full-${width}-${operation.before}.png` })
      }
      await input(operation, state)
    }
    assert.equal(await current(), 'episode-complete')
    assert.match(await page.locator('.end-window').textContent(), /消された記録.*完/)
    assert.deepEqual(errors, [])
  } catch (error) {
    console.error(`Stopped ${width}:`, await current())
    if (process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/full-${width}-failure.png` })
    throw error
  } finally { await browser.close() }
})
