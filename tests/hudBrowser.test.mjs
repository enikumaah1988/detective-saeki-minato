import test from 'node:test'
import assert from 'node:assert/strict'

const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5176'

for (const [width, height] of [[1920, 1080], [1366, 768]]) {
  test(`上部HUD ${width}×${height}: 線画・ラベルの整列と非重複`, { skip: !playwrightPath }, async () => {
    const { chromium } = await import(playwrightPath)
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width, height } })
    try {
      await page.goto(baseUrl)
      await page.getByRole('button', { name: '調査記録', exact: true }).waitFor()
      const metrics = await page.evaluate(() => {
        const box = element => element.getBoundingClientRect().toJSON()
        const buttons = [...document.querySelectorAll('.save-controls summary, .toolbar-actions > button')]
        return {
          story: box(document.querySelector('.story')),
          actions: box(document.querySelector('.toolbar-actions')),
          context: box(document.querySelector('.scene-context')),
          buttons: buttons.map(button => {
            const icon = button.querySelector('svg')
            return { box: box(button), icon: box(icon), label: box(button.querySelector('span')),
              color: getComputedStyle(icon).color, textColor: getComputedStyle(button).color,
              stroke: icon.getAttribute('stroke'), strokeWidth: icon.getAttribute('stroke-width'),
              fill: icon.getAttribute('fill'), hidden: icon.getAttribute('aria-hidden') }
          }),
        }
      })
      const scale = metrics.story.width / 1920
      for (const button of metrics.buttons) {
        assert.equal(button.stroke, 'currentColor')
        assert.equal(button.strokeWidth, '1.5')
        assert.equal(button.fill, 'none')
        assert.equal(button.hidden, 'true')
        assert.equal(button.color, button.textColor)
        assert.ok(Math.abs(button.icon.width - 55 * scale) < 1)
        assert.ok(Math.abs(button.label.x - button.icon.right - 15 * scale) < 1)
        assert.ok(Math.abs(button.icon.y + button.icon.height / 2 - button.label.y - button.label.height / 2) < 1)
        assert.ok(button.label.right <= button.box.right)
        assert.ok(button.box.y >= metrics.story.y && button.box.bottom <= metrics.story.bottom)
      }
      for (let i = 1; i < metrics.buttons.length; i++) assert.ok(metrics.buttons[i - 1].box.right < metrics.buttons[i].box.x)
      assert.ok(metrics.actions.right < metrics.context.x)
      assert.ok(metrics.context.right <= metrics.story.right)
      if (process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/hud-${width}.png` })
      await page.getByRole('button', { name: '調査記録', exact: true }).click()
      await page.getByRole('button', { name: '調査記録を閉じる' }).click()
      await page.getByRole('button', { name: 'タバコを吸う', exact: true }).click()
      await page.locator('.smoking-overlay').waitFor()
      console.log(JSON.stringify({ viewport: [width, height], hud: metrics }))
    } finally { await browser.close() }
  })
}
