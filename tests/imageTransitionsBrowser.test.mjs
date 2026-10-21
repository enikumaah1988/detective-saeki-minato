import test from 'node:test'
import assert from 'node:assert/strict'

const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5176'
async function waitPending(pending, key) {
  const deadline = Date.now() + 10000
  while (!pending.has(key) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10))
  assert.ok(pending.has(key), `画像要求が発行されない: ${key}`)
}

test('遅い画像切替・競合・失敗でも同一人物と場面の表示を取り違えない', { skip: !playwrightPath, timeout: 60000 }, async () => {
  const { chromium } = await import(playwrightPath)
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
  const pending = new Map()
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  try {
    await page.goto(baseUrl)
    await page.route(/\/characters\/minato\/waist\/(serious|smile)\.png/, route => {
      pending.set(route.request().url().includes('serious.png') ? 'serious' : 'smile', route)
    })
    // テスト内だけで実コンポーネントへ場面を渡す。本編にプレビューや素材を足さない。
    await page.evaluate(async () => {
      const { mountTestStage } = await import('/tests/fixtures/imageTransitions.tsx')
      window.renderStage = mountTestStage()
      window.renderStage({ backgroundId: 'office-before-noon', characterId: 'minato', expression: 'normal' })
    })
    await page.waitForFunction(() => [...document.querySelectorAll('.stage img')].every(img => img.complete && img.naturalWidth > 0))
    const original = await page.locator('.character-image').getAttribute('src')
    const box = await page.locator('.character').boundingBox()
    await page.evaluate(() => window.renderStage({ backgroundId: 'office-before-noon', characterId: 'minato', expression: 'serious' }))
    await waitPending(pending, 'serious')
    const visible = await page.locator('.character-image:visible').evaluateAll(images => images.filter(img => img.complete && img.naturalWidth > 0).map(img => img.getAttribute('src')))
    assert.deepEqual(visible, [original], '読み込み待ちに同一人物の直前の表情を維持する')
    assert.deepEqual(await page.locator('.character').boundingBox(), box)
    await page.evaluate(() => window.renderStage({ backgroundId: 'office-before-noon', characterId: 'minato', expression: 'smile' }))
    await waitPending(pending, 'smile')
    await pending.get('smile').continue()
    await page.waitForFunction(() => [...document.querySelectorAll('.character-image')].some(img => img.src.includes('smile.png') && img.complete && img.naturalWidth > 0 && getComputedStyle(img).display !== 'none'))
    await pending.get('serious').continue()
    await page.waitForTimeout(150)
    assert.match(await page.locator('.character-image:visible').getAttribute('src'), /smile\.png/)
    // A cached/fast revisit retains a visible decoded image throughout the swap.
    await page.evaluate(() => window.renderStage({ backgroundId: 'office-before-noon', characterId: 'minato', expression: 'normal' }))
    await page.waitForFunction(() => document.querySelector('.character-image')?.src.includes('neutral.png'))
    assert.equal(await page.locator('.character-silhouette').count(), 0)
    await page.route(/\/characters\/minato\/waist\/worried\.png/, route => route.abort())
    await page.evaluate(() => window.renderStage({ backgroundId: 'office-before-noon', characterId: 'minato', expression: 'worried' }))
    await page.locator('.character-silhouette').waitFor()
    assert.equal(await page.locator('.character-image').count(), 0)
    await page.evaluate(() => window.renderStage({ backgroundId: 'office-before-noon', characterId: 'minato', expression: 'normal' }))
    await page.locator('.character-image').waitFor()
    // A different location or actor must use its own fallback, never the old image.
    await page.route(/company-lobby\.png|\/characters\/mio\/waist\/serious\.png/, route => {
      pending.set(route.request().url().includes('company-lobby') ? 'lobby' : 'mio', route)
    })
    await page.evaluate(() => window.renderStage({ backgroundId: 'company-lobby', characterId: 'mio', expression: 'serious' }))
    await waitPending(pending, 'lobby'); await waitPending(pending, 'mio')
    assert.equal(await page.locator('.background-image, .character-image').count(), 0)
    assert.match(await page.locator('.background-label').textContent(), /ロビー/)
    assert.equal(await page.locator('.character').getAttribute('data-character-id'), 'mio')
    assert.equal(await page.locator('.character-silhouette').count(), 1)
    await pending.get('lobby').continue()
    await page.locator('.background-image').waitFor()
    assert.match(await page.locator('.background-image').getAttribute('src'), /company-lobby\.png/)
    await pending.get('mio').abort()
    await page.waitForFunction(() => document.querySelectorAll('.character img').length === 0)
    await page.evaluate(() => window.renderStage({ backgroundId: 'company-lobby', characterId: 'mio', expression: 'normal' }))
    await page.locator('.character-image').waitFor()
    assert.match(await page.locator('.character-image').getAttribute('src'), /\/mio\//)
    await page.route(/\/backgrounds\/police-exterior\.png/, route => route.abort())
    await page.evaluate(() => window.renderStage({ backgroundId: 'police-exterior', characterId: 'mio', expression: 'normal' }))
    await page.locator('.background-label').waitFor()
    assert.equal(await page.locator('.background-image').count(), 0)
    await page.evaluate(() => window.renderStage({ backgroundId: 'office-before-noon', characterId: 'mio', expression: 'normal' }))
    await page.locator('.background-image').waitFor()
    pending.delete('lobby')
    await page.evaluate(async () => {
      const { backgrounds } = await import('/src/data/presentation.ts')
      backgrounds['company-lobby'].imageSrc += '?delayed-revisit'
      window.renderStage({ backgroundId: 'company-lobby', characterId: 'mio', expression: 'normal' })
    })
    await waitPending(pending, 'lobby')
    await page.evaluate(() => window.renderStage({ backgroundId: 'office-evening', characterId: 'mio', expression: 'normal' }))
    await page.waitForFunction(() => document.querySelector('.background-image')?.src.includes('office-evening.png'))
    await pending.get('lobby').continue()
    await page.waitForTimeout(150)
    assert.match(await page.locator('.background-image').getAttribute('src'), /office-evening\.png/)
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
})
