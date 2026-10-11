import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5186/'
for (const width of [1920, 1366]) {
  test(`屋外移動地図 ${width}: 選択・確定・取消・現在地・3地点往復`, { skip: !playwrightPath }, async () => {
    const { chromium } = await import(playwrightPath)
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width, height: width === 1920 ? 1080 : 768 } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      await page.goto(baseUrl)
      await page.locator('.story .dialogue-button').click()
      const original = await page.locator('.story .dialogue').textContent()
      const storage = await page.evaluate(() => localStorage.getItem('detective-saeki-minato.save.v1'))
      await page.locator('.scene-selector').filter({ hasText: '調査・移動UIモック' }).locator('summary').click()
      await page.getByRole('button', { name: '調査・移動モックを開く', exact: true }).click()
      const mock = page.getByRole('region', { name: '調査・移動UIモック', exact: true })
      const finishArrival = async () => {
        const button = mock.locator('.dialogue-button')
        await button.waitFor(); await button.click(); await button.locator('.next').waitFor(); await button.press('Enter')
        await mock.getByRole('navigation', { name: 'モックFree Action' }).waitFor()
      }
      const openMap = async () => {
        await mock.getByRole('button', { name: '移動', exact: true }).click()
        await mock.getByRole('navigation', { name: '地図の移動先' }).waitFor()
      }
      await mock.getByRole('button', { name: '移動', exact: true }).click()
      await mock.getByRole('button', { name: /ビルのロビー/ }).click(); await finishArrival()
      await mock.getByRole('button', { name: '移動', exact: true }).click()
      await mock.getByRole('button', { name: /建物の外へ/ }).click(); await finishArrival()
      await openMap()
      assert.equal(await mock.getByRole('button', { name: '探偵事務所（現在地）' }).isDisabled(), true)
      assert.equal(await mock.getByRole('button', { name: /ここへ移動/ }).count(), 0)
      await mock.getByRole('button', { name: '駅前を選択' }).press('Enter')
      await mock.getByRole('heading', { name: '駅前', exact: true }).waitFor()
      assert.equal(await mock.getAttribute('data-place'), 'outside')
      assert.equal(await mock.getByRole('button', { name: '駅前を選択' }).getAttribute('aria-pressed'), 'true')
      await mock.locator('.map-background').evaluate(image => image.decode())
      await mock.locator('.map-location-photo').evaluate(image => image.decode())
      const layout = await mock.evaluate(element => {
        const bounds = element.getBoundingClientRect()
        return [...element.querySelectorAll('.map-marker,.map-location-info,.map-header > button')].every(item => {
          const rect = item.getBoundingClientRect()
          return rect.left >= bounds.left && rect.right <= bounds.right && rect.top >= bounds.top && rect.bottom <= bounds.bottom
        })
      })
      assert.equal(layout, true)
      if (process.env.SAEKI_MAP_SCREENSHOTS) {
        await mkdir(process.env.SAEKI_MAP_SCREENSHOTS, { recursive: true })
        await mock.screenshot({ path: `${process.env.SAEKI_MAP_SCREENSHOTS}/${width}-station-selected.png` })
      }
      await mock.getByRole('button', { name: '喫茶店を選択' }).click()
      await mock.getByRole('heading', { name: '喫茶店', exact: true }).waitFor()
      assert.equal(await mock.getByRole('button', { name: '駅前を選択' }).getAttribute('aria-pressed'), 'false')
      await page.keyboard.press('Escape')
      assert.equal(await mock.getAttribute('data-place'), 'outside')
      await openMap()
      assert.equal(await mock.getByRole('button', { name: /ここへ移動/ }).count(), 0)
      await mock.getByRole('button', { name: '駅前を選択' }).click()
      await mock.getByRole('button', { name: /ここへ移動/ }).click()
      await finishArrival()
      assert.equal(await mock.getAttribute('data-place'), 'station')
      await openMap()
      assert.equal(await mock.getByRole('button', { name: '駅前（現在地）' }).isDisabled(), true)
      await mock.getByRole('button', { name: '× 戻る' }).click()
      assert.equal(await mock.getAttribute('data-place'), 'station')
      await openMap()
      await mock.getByRole('button', { name: '喫茶店を選択' }).click()
      await mock.getByRole('button', { name: /ここへ移動/ }).click(); await finishArrival()
      assert.equal(await mock.getAttribute('data-place'), 'cafe')
      await openMap()
      assert.equal(await mock.getByRole('button', { name: '喫茶店（現在地）' }).isDisabled(), true)
      await mock.getByRole('button', { name: '探偵事務所を選択' }).click()
      await mock.getByRole('button', { name: /ここへ移動/ }).click(); await finishArrival()
      await mock.getByRole('button', { name: /建物に入る/ }).click(); await finishArrival()
      assert.equal(await mock.getAttribute('data-place'), 'lobby')
      await mock.getByRole('button', { name: 'モックを閉じる' }).click()
      await mock.waitFor({ state: 'detached' })
      assert.equal(await page.locator('.story .dialogue').textContent(), original)
      assert.equal(await page.evaluate(() => localStorage.getItem('detective-saeki-minato.save.v1')), storage)
      assert.deepEqual(errors, [])
    } finally { await browser.close() }
  })
}

test('地図画像の失敗時もピン・説明・移動操作を維持する', { skip: !playwrightPath }, async () => {
  const { chromium } = await import(playwrightPath)
  const browser = await chromium.launch()
  const page = await browser.newPage()
  try {
    await page.route(/city-map-mock\.png/, route => route.abort())
    await page.goto(baseUrl)
    await page.locator('.scene-selector').filter({ hasText: '調査・移動UIモック' }).locator('summary').click()
    await page.getByRole('button', { name: '調査・移動モックを開く', exact: true }).click()
    const mock = page.getByRole('region', { name: '調査・移動UIモック', exact: true })
    for (const destination of [/ビルのロビー/, /建物の外へ/]) {
      await mock.getByRole('button', { name: '移動', exact: true }).click()
      await mock.getByRole('button', { name: destination }).click()
      const dialogue = mock.locator('.dialogue-button')
      await dialogue.waitFor(); await dialogue.click(); await dialogue.locator('.next').waitFor(); await dialogue.click()
    }
    await mock.getByRole('button', { name: '移動', exact: true }).click()
    await mock.locator('.map-image-fallback').waitFor()
    await mock.getByRole('button', { name: '駅前を選択' }).click()
    await mock.getByRole('button', { name: /ここへ移動/ }).click()
    await mock.locator('.dialogue-button').waitFor()
    assert.equal(await mock.getAttribute('data-place'), 'station')
  } finally { await browser.close() }
})
