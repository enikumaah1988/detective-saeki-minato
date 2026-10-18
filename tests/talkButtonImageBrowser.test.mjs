import {loadForTest,saveForTest} from './saveUiHelpers.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5186/'
for (const width of [1920, 1366]) {
  test(`聞く画像ボタン ${width}: 状態・寸法・文字・キーボード・連打防止`, { skip: !playwrightPath }, async () => {
    const { chromium } = await import(playwrightPath)
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width, height: width === 1920 ? 1080 : 768 } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      const saved = { version: 2, scenarioId: 'gray-testimony-part1-demo', nodeId: 'menu', flags: {}, heardTopics: [], inspectedTargets: [], acquiredInformation: [] }
      await page.addInitScript(save => localStorage.removeItem('detective-saeki-minato.slots.v1') || localStorage.setItem('detective-saeki-minato.save.v1', JSON.stringify(save)), saved)
      await page.goto(baseUrl)
      const menu = page.getByLabel('メニュー', { exact: true })
      await menu.click(); await loadForTest(page); await page.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
      const talk = page.locator('.free-action-panel button').first()
      const geometry = async () => talk.evaluate(element => ({ box: element.getBoundingClientRect().toJSON(), font: getComputedStyle(element).fontSize, label: element.querySelector('.command-name').getBoundingClientRect().toJSON() }))
      const original = await geometry()
      const source = () => talk.evaluate(element => getComputedStyle(element, '::before').borderImageSource)
      assert.equal(await page.locator('.free-action-panel button.command-image').count(), await page.locator('.free-action-panel button').count())
      assert.equal(await page.locator('.free-action-panel button:disabled').count(), 0)
      const normal = await source()
      assert.match(normal, /^url\(/)
      await talk.evaluate(async element => { const image = new Image(); image.src = getComputedStyle(element, '::before').borderImageSource.slice(5, -2); await image.decode() })
      assert.equal(await talk.evaluate(element => getComputedStyle(element, '::before').pointerEvents), 'none')
      await talk.hover(); const active = await source(); assert.notEqual(active, normal)
      await page.mouse.move(0, 0); await talk.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab')
      assert.equal(await source(), active)
      const screenshots = process.env.SAEKI_TALK_SCREENSHOTS
      if (screenshots) {
        await mkdir(screenshots, { recursive: true })
        await page.locator('.free-action-panel').screenshot({ path: `${screenshots}/${width}-states.png` })
        await page.locator('.story').screenshot({ path: `${screenshots}/${width}-game.png` })
      }
      await talk.press('Enter')
      await page.getByLabel('聞く話題', { exact: true }).waitFor()
      assert.equal(await page.getByLabel('聞く話題', { exact: true }).locator('button.command-image').count(), await page.getByLabel('聞く話題', { exact: true }).locator('button').count())
      await page.getByRole('button', { name: /戻る/ }).click(); await talk.waitFor()
      await talk.evaluate(element => {
        const buttons = element.parentElement.querySelectorAll('button')
        element.click(); buttons[1].click(); element.click()
      })
      assert.match(await talk.getAttribute('class'), /command-image.*is-selected/)
      assert.notEqual(await source(), active)
      assert.notEqual(await source(), normal)
      await page.getByLabel('聞く話題', { exact: true }).waitFor()
      assert.equal(await page.getByLabel('調査対象', { exact: true }).count(), 0)
      await page.getByRole('button', { name: /戻る/ }).click(); await talk.waitFor()
      await talk.evaluate(element => { element.querySelector('.command-name').textContent = '聞き取り対象について詳しく話を聞く'.repeat(3) })
      assert.ok((await geometry()).box.height > original.box.height)
      assert.equal(await talk.evaluate(element => element.scrollWidth <= element.clientWidth), true)
      // 確認済・未実行などのサブメニュー状態は既存のHTML表示を維持する。
      await talk.press('Space'); await page.getByLabel('聞く話題', { exact: true }).waitFor()
      assert.match(await page.getByLabel('聞く話題', { exact: true }).textContent(), /未実行/)
      assert.equal(await page.locator('.free-action-panel button:disabled').count(), 0)
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('detective-saeki-minato.slots.v1')).manual[0].data), saved)
      assert.deepEqual(errors, [])
    } finally { await browser.close() }
  })
}
