import test from 'node:test'
import assert from 'node:assert/strict'
const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = (process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5187').split('?')[0]
for (const [width, height] of [[1920, 1080], [1366, 768]]) test(`点指定スライダー・設定保存・年なし日時 ${width}`, { skip: !playwrightPath }, async () => {
  const { chromium } = await import(playwrightPath), browser = await chromium.launch(), page = await browser.newPage({ viewport: { width, height } })
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  try {
    await page.goto(baseUrl)
    await page.getByLabel('メニュー', { exact: true }).click()
    await page.getByRole('button', { name: 'メッセージスピード：一括表示', exact: true }).click()
    await page.getByRole('button', { name: 'BGM音量：４０%', exact: true }).click()
    await page.getByLabel('SE音量', { exact: true }).fill('0')
    assert.equal(await page.getByLabel('メッセージスピード', { exact: true }).inputValue(), '3')
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('detective-saeki-minato.audio'))), { bgm: 40, se: 0 })
    const before = await page.locator('.dialogue').textContent()
    await page.keyboard.press('Enter'); assert.equal(await page.locator('.dialogue').textContent(), before)
    await page.reload(); await page.getByLabel('メニュー', { exact: true }).click()
    assert.equal(await page.getByLabel('BGM音量', { exact: true }).inputValue(), '4')
    assert.equal(await page.getByLabel('SE音量', { exact: true }).inputValue(), '0')
    assert.equal(await page.getByLabel('メッセージスピード', { exact: true }).inputValue(), '3')
    const rect = await page.locator('.save-panel').boundingBox(); assert.ok(rect.x >= 0 && rect.y + rect.height <= height)
    assert.doesNotMatch(await page.locator('.scene-context').textContent(), /[０-９]{4}年/)
    if (process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/settings-sliders-${width}.png` })
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})
