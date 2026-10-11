import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import assert from 'node:assert/strict'
const path = process.env.SAEKI_PLAYWRIGHT_PATH
for (const viewport of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }]) {
 test(`DEV調査記録プレビュー ${viewport.width}: 全状態・本編分離`, { skip: !path }, async () => {
  const { chromium } = await import(path)
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport })
  const screenshots = new URL('../work/records-preview/', import.meta.url)
  await mkdir(screenshots, { recursive: true })
  try {
   await page.goto(process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5176')
   assert.equal(await page.getByRole('dialog').count(), 0)
   const before = await page.evaluate(() => JSON.stringify(localStorage))
   await page.getByText('調査記録UIプレビュー（本編・セーブとは無関係）').click()
   for (const mode of ['通常', '一部空', '全部空', '多数・長文', '画像なし']) {
    await page.getByRole('button', { name: mode, exact: true }).click()
    const modal = page.getByRole('dialog')
    await modal.waitFor()
    assert.match(await modal.textContent(), /DEV・UI確認用/)
    for (const tab of ['人物', '証拠', '出来事', '持ち物']) {
     await modal.getByRole('tab', { name: tab, exact: true }).click()
     const buttons = modal.locator('.record-list button')
     const count = await buttons.count()
     if (!count) {
      assert.equal(await modal.locator('.record-list').textContent(), '記録はありません')
      assert.equal(await modal.locator('.record-detail').textContent(), '')
     } else {
      assert.equal(await buttons.first().getAttribute('aria-pressed'), 'true')
      for (const index of [0, count - 1]) {
       await buttons.nth(index).click()
       assert.equal(await buttons.nth(index).getAttribute('aria-pressed'), 'true')
       assert.ok(await modal.locator('.record-detail h3').textContent())
      }
     }
     if (mode === '通常') assert.equal(count, { 人物: 2, 証拠: 2, 出来事: 3, 持ち物: 3 }[tab])
     if (mode === '画像なし') assert.equal(await modal.locator('img').count(), 0)
     for (const img of await modal.locator('img').all()) {
      await img.evaluate(el => el.decode())
      assert.ok(await img.evaluate(el => el.naturalWidth > 0))
     }
     assert.ok(await modal.evaluate(el => el.scrollWidth <= el.clientWidth))
     if (mode === '多数・長文' && tab === '人物') {
      assert.ok(await modal.locator('.record-list').evaluate(el => el.scrollHeight > el.clientHeight))
      assert.ok(await modal.locator('.record-detail').evaluate(el => el.scrollHeight > el.clientHeight))
      await modal.locator('.record-detail').evaluate(el => { el.scrollTop = 150 })
      assert.ok(await modal.locator('.record-detail').evaluate(el => el.scrollTop > 0))
     }
    }
    if (mode === '通常') {
     await modal.getByRole('tab', { name: '人物', exact: true }).click()
     await page.screenshot({ path: fileURLToPath(new URL(`preview-${viewport.width}.png`, screenshots)) })
     await modal.getByRole('button', { name: '澪', exact: true }).click()
     await page.screenshot({ path: fileURLToPath(new URL(`preview-mio-${viewport.width}.png`, screenshots)) })
     const fits = await modal.locator('.record-detail').evaluate(el => {
      const portrait = el.querySelector('.record-portrait').getBoundingClientRect()
      const paragraph = el.querySelector('p')
      const range = document.createRange(); range.selectNodeContents(paragraph)
      return [...range.getClientRects()].every(rect => rect.top >= portrait.bottom || rect.left >= portrait.right)
     })
     assert.equal(fits, true)
    }
    await modal.getByRole('button', { name: '調査記録を閉じる' }).click()
    await modal.waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => JSON.stringify(localStorage)), before)
   }
   await page.getByRole('button', { name: '調査記録', exact: true }).click()
   assert.doesNotMatch(await page.getByRole('dialog').textContent(), /DEV・UI確認用|現場の写真|聞き取りメモ/)
   assert.equal(await page.getByRole('dialog').locator('.record-list button').count(), 0)
  } finally { await browser.close() }
 })
}
