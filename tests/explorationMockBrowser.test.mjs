import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5186/'
for (const width of [1920, 1366]) {
  test(`調査・移動UIモック ${width}: 調査・取消・往復・本編と保存の分離`, { skip: !playwrightPath }, async () => {
    const { chromium } = await import(playwrightPath)
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width, height: width === 1920 ? 1080 : 768 } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      await page.goto(baseUrl+(baseUrl.includes('?')?'&':'?')+'dev=1')
      await page.locator('.story:not(.exploration-mock) .dialogue-button').click()
      const original = await page.locator('.story:not(.exploration-mock) .dialogue').textContent()
      const saved = await page.evaluate(() => localStorage.getItem('detective-saeki-minato.save.v1'))
      await page.locator('.scene-selector').filter({ hasText: '調査・移動UIモック' }).locator('summary').click()
      await page.getByRole('button', { name: '調査・移動モックを開く', exact: true }).click()
      const mock = page.getByRole('region', { name: '調査・移動UIモック', exact: true })
      const finishDialogue = async () => {
        const button = mock.locator('.dialogue-button')
        await button.click(); await button.locator('.next').waitFor(); await button.press('Enter')
      }
      const capture = async name => {
        if (!process.env.SAEKI_MOCK_SCREENSHOTS) return
        await mkdir(process.env.SAEKI_MOCK_SCREENSHOTS, { recursive: true })
        await mock.screenshot({ path: `${process.env.SAEKI_MOCK_SCREENSHOTS}/${width}-${name}.png` })
      }
      await mock.getByRole('button', { name: /調べる/ }).click()
      await mock.getByRole('navigation', { name: '調査対象' }).waitFor()
      assert.equal(await mock.locator('.dialogue-button').count(), 0)
      await capture('targets')
      await mock.getByRole('button', { name: /机の上/ }).click()
      await mock.locator('.mock-detail-art').waitFor()
      assert.equal(await mock.locator('.command-panel').count(), 0)
      await capture('detail')
      await finishDialogue()
      await mock.getByRole('button', { name: /机の上.*確認済/ }).waitFor()
      await mock.getByRole('button', { name: /窓の外/ }).click()
      await mock.locator('.mock-detail-window').waitFor()
      await page.keyboard.press('Escape')
      await mock.getByRole('button', { name: /窓の外.*未確認/ }).waitFor()
      await mock.getByRole('button', { name: /戻る/ }).click()
      await mock.getByRole('button', { name: /移動/ }).click()
      await mock.getByRole('navigation', { name: '移動先' }).waitFor()
      await capture('destinations')
      await mock.getByRole('button', { name: /戻る/ }).click()
      assert.equal(await mock.getAttribute('data-place'), 'office')
      await mock.getByRole('button', { name: /移動/ }).click()
      await mock.getByRole('button', { name: /ビルのロビー/ }).click()
      await mock.locator('.mock-travel').waitFor()
      assert.equal(await mock.locator('.command-panel').count(), 0)
      await mock.locator('.mock-lobby').waitFor()
      await mock.locator('.dialogue-button').waitFor()
      await finishDialogue()
      await mock.getByRole('button', { name: /調べる/ }).waitFor()
      await capture('lobby')
      await mock.getByRole('button', { name: /調べる/ }).click()
      await mock.getByRole('button', { name: /案内板/ }).waitFor()
      assert.equal(await mock.getByRole('button', { name: /机の上/ }).count(), 0)
      await page.keyboard.press('Escape')
      await mock.getByRole('button', { name: /移動/ }).click()
      await mock.getByRole('button', { name: /探偵事務所/ }).click()
      await mock.locator('.dialogue-button').waitFor()
      await finishDialogue()
      await mock.getByRole('button', { name: /調べる/ }).click()
      await mock.getByRole('button', { name: /机の上.*確認済/ }).waitFor()
      await mock.getByRole('button', { name: 'モックを閉じる' }).click()
      await mock.waitFor({ state: 'detached' })
      assert.equal(await page.locator('.story .dialogue').textContent(), original)
      assert.equal(await page.evaluate(() => localStorage.getItem('detective-saeki-minato.save.v1')), saved)
      assert.deepEqual(errors, [])
    } finally { await browser.close() }
  })
}
