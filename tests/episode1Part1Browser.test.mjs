import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'
const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = (process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5187/').split('?')[0]
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
for (const [width, height] of [[1920, 1080], [1366, 768]]) test(`改稿4部完走・相手選択・移動・記録・ロード ${width}`, { skip: !playwrightPath, timeout: 600000 }, async () => {
  const api = await loadRevision(), run = buildPlaythrough(api, true)
  const { chromium } = await import(playwrightPath), browser = await chromium.launch(), page = await browser.newPage({ viewport: { width, height } })
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  const shots = new Set(), menu = page.getByLabel('メニュー', { exact: true })
  try {
    await page.addInitScript(() => localStorage.setItem('detective-saeki-minato.speed', '0'))
    await page.goto(baseUrl); await page.evaluate(() => document.fonts.ready)
    for (const [index, operation] of run.operations.entries()) {
      assert.equal(await page.locator('.story').getAttribute('data-node-id'), operation.before, `操作${index}`)
      if (operation.before === 'P1-01-menu') {
        const male = await page.locator('[data-character-id="minato"] .character-image').boundingBox()
        const female = await page.locator('[data-character-id="mio"] .character-image').boundingBox()
        assert.ok(Math.abs(female.width / male.width - .9) < .01)
        assert.ok(male.y + male.height >= height && female.y + female.height >= height)
      }
      if (['P1-03-menu', 'P1-06-menu', 'P2-02-menu', 'P2-08-menu', 'P3-04-menu', 'P4-07-menu'].includes(operation.before) && !shots.has(operation.before)) {
        shots.add(operation.before)
        assert.equal(await page.locator('.background-label').count(), 0)
        if (process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/revision-${operation.before}-${width}.png` })
      }
      if (operation.before === 'P1-06-menu' && !shots.has('record')) {
        shots.add('record'); await page.getByRole('button', { name: '調査記録', exact: true }).click()
        await page.getByRole('button', { name: '高瀬　直人', exact: true }).click()
        assert.match(await page.locator('.record-detail').textContent(), /UNKNOWN/)
        await page.getByRole('button', { name: '調査記録を閉じる', exact: true }).click()
      }
      if (operation.before === 'P2-02-menu' && !shots.has('load')) {
        shots.add('load'); await menu.click(); await page.getByRole('button', { name: 'セーブ', exact: true }).click()
        await page.getByRole('button', { name: 'ロード', exact: true }).click()
        const dialog = page.getByRole('dialog', { name: 'ロードしました', exact: true })
        await dialog.waitFor(); await page.keyboard.press('Escape'); assert.equal(await dialog.count(), 1)
        await dialog.getByRole('button', { name: 'OK', exact: true }).click()
        assert.equal(await page.locator('.save-controls[open]').count(), 0)
        assert.equal(await page.locator('.story').getAttribute('data-node-id'), operation.before)
      }
      if (operation.action.type === 'advance') {
        for (let click = 0; click < 8 && await page.locator('.story').getAttribute('data-node-id') === operation.before; click++) {
          const dialog = page.getByRole('dialog', { name: /を受け取った/ })
          if (await dialog.count()) {
            assert.ok(await dialog.locator('img').count()); await dialog.getByRole('button', { name: 'OK', exact: true }).click()
          } else await page.locator('.dialogue-button').click()
          await page.waitForTimeout(15)
        }
      } else if (operation.map) {
        await page.getByRole('button', { name: `${operation.label}を選択`, exact: true }).click()
        await page.getByRole('button', { name: 'ここへ移動 ›', exact: true }).click()
      } else await page.locator('.command-panel button').filter({ has: page.locator('.command-name', { hasText: new RegExp(`^${escape(operation.label)}$`) }) }).click()
      await page.waitForFunction(expected => document.querySelector('.story')?.getAttribute('data-node-id') === expected, operation.after)
      if (index % 200 === 0) console.log(JSON.stringify({ width, operation: index, total: run.operations.length, node: operation.after }))
    }
    assert.match(await page.locator('.end-window').textContent(), /灰色の証言/)
    await menu.click(); await page.getByRole('button', { name: 'セーブ', exact: true }).click()
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('detective-saeki-minato.save.v1')))
    assert.deepEqual(saved, api.createSaveData(run.state))
    await menu.click(); await page.getByRole('button', { name: '会話履歴', exact: true }).click()
    const history = page.getByRole('dialog', { name: '会話履歴', exact: true }); assert.match(await history.textContent(), /兄妹|帳簿/)
    await history.getByRole('button', { name: '閉じる', exact: true }).click()
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})
