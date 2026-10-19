import test from 'node:test'
import assert from 'node:assert/strict'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5187/?dev=1&scenario=gray-testimony-part1-demo'
for (const [width, height] of [[1920,1080],[1366,768]]) test(`25%拡大HUDと共通パネルの配置・設定・保存 ${width}`, { skip: !path }, async () => {
  const { chromium } = await import(path)
  const browser = await chromium.launch({ channel: process.env.SAEKI_BROWSER_CHANNEL || undefined })
  const page = await browser.newPage({ viewport: { width, height } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  try {
    await page.goto(url)
    const hud = await page.evaluate(() => {
      const story = document.querySelector('.story').getBoundingClientRect()
      const summary = document.querySelector('.save-controls summary')
      return { scale: story.width / 1920, icon: summary.querySelector('svg').getBoundingClientRect().width, font: parseFloat(getComputedStyle(summary).fontSize) }
    })
    assert.ok(Math.abs(hud.icon - 55 * hud.scale) < 1)
    assert.ok(Math.abs(hud.font - 35 * hud.scale) < 1)
    const checkPanel = async selector => {
      const metrics = await page.evaluate(selector => {
        const box = element => element.getBoundingClientRect().toJSON()
        const panel = document.querySelector(selector)
        return { panel: box(panel), toolbar: box(document.querySelector('.story-toolbar')), story: box(document.querySelector('.story')), font: parseFloat(getComputedStyle(panel).fontSize) }
      }, selector)
      assert.ok(metrics.panel.top >= metrics.toolbar.bottom + 4, JSON.stringify(metrics))
      assert.ok(metrics.panel.bottom <= metrics.story.bottom)
      assert.ok(Math.abs(metrics.font - metrics.story.width / 1920 * 32) < 1)
      return metrics
    }
    const menu = page.getByLabel('メニュー', { exact: true })
    await menu.click()
    const system = page.getByRole('dialog', { name: 'システムメニュー', exact: true })
    await system.waitFor()
    const systemMetrics = await checkPanel('.system-menu-panel')
    await system.getByRole('slider', { name: 'BGM音量', exact: true }).focus()
    await page.keyboard.press('End')
    assert.equal(await system.getByRole('slider', { name: 'BGM音量', exact: true }).inputValue(), '100')
    if (process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/system-panel-${width}.png` })
    await page.keyboard.press('Escape')
    await system.waitFor({ state: 'hidden' })
    await page.getByRole('button', { name: '調査記録', exact: true }).click()
    await page.getByRole('dialog', { name: '調査記録', exact: true }).waitFor()
    for (const label of ['調査記録', 'タバコを吸う']) {
      const button = page.getByRole('button', { name: label, exact: true, includeHidden: true })
      assert.equal(await button.isVisible(), true)
      assert.equal(await button.isDisabled(), true)
    }
    assert.equal(await page.locator('.scene-context').isVisible(), true)
    assert.equal(await page.locator('.story-toolbar').evaluate(element => element.inert), true)
    const recordsMetrics = await checkPanel('.investigation-records:not(.system-menu-panel)')
    assert.ok(Math.abs(systemMetrics.panel.width - recordsMetrics.panel.width) < 1)
    if (process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/records-panel-${width}.png` })
    await page.getByRole('button', { name: '調査記録を閉じる' }).click()
    await menu.click()
    await system.getByRole('button', { name: 'SAVE', exact: true }).click()
    await page.getByRole('dialog', { name: 'セーブしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
    await system.waitFor({ state: 'hidden' })
    await menu.click()
    await system.getByRole('button', { name: 'LOAD', exact: true }).click()
    await page.getByRole('dialog', { name: 'LOAD', exact: true }).getByRole('button', { name: '戻る', exact: true }).click()
    await system.getByRole('button', { name: 'システムメニューを閉じる' }).click()
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})
