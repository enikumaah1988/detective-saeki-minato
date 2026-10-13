import test from 'node:test'
import assert from 'node:assert/strict'

const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5176'
const saveKey = 'detective-saeki-minato.save.v1'

for (const [width, height] of [[1920, 1080], [1366, 768]]) {
  test(`喫煙ヒント演出 ${width}×${height}: 専用画像・通常ウィンドウ・復帰`, { skip: !playwrightPath }, async () => {
    const { chromium } = await import(playwrightPath)
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width, height } })
    try {
      await page.goto(baseUrl)
      const dialogue = page.locator('.story-content .dialogue-button')
      await page.waitForFunction(() => (document.querySelector('.story-content .dialogue-button .dialogue [aria-hidden]')?.textContent.length ?? 0) > 0)
      const initialPage = await dialogue.getAttribute('data-page')
      const originalBox = await dialogue.boundingBox()
      const beforeSave = await page.evaluate(key => localStorage.getItem(key), saveKey)
      await page.locator('.scene-selector').filter({ hasText: '喫煙演出プレビュー' }).locator('summary').click()

      const smokingButton = page.locator('.toolbar-actions').getByRole('button', { name: 'タバコを吸う' })
      const completeCutIn = async (variant, gesturePhrase) => {
        await smokingButton.click()
        const overlay = page.locator('.smoking-overlay .dialogue-button')
        await overlay.waitFor()
        const image = page.locator('.smoking-overlay .smoking-cut-in')
        assert.equal(await image.getAttribute('data-variant'), variant)
        await image.evaluate(element => element.decode())
        const metrics = await image.evaluate(element => ({
          naturalRatio: element.naturalWidth / element.naturalHeight,
          imageRatio: element.getBoundingClientRect().width / element.getBoundingClientRect().height,
          parent: element.parentElement.getBoundingClientRect().toJSON(),
          bounds: element.getBoundingClientRect().toJSON(),
        }))
        assert.ok(Math.abs(metrics.naturalRatio - 16 / 9) < 0.01)
        assert.ok(Math.abs(metrics.imageRatio - 16 / 9) < 0.01)
        assert.deepEqual([metrics.bounds.x, metrics.bounds.y, metrics.bounds.width, metrics.bounds.height],
          [metrics.parent.x, metrics.parent.y, metrics.parent.width, metrics.parent.height])
        if (process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/smoking-${variant}-${width}.png` })
        assert.equal(await page.locator('.story-content .dialogue-button').isVisible(), false)
        await page.waitForTimeout(100)
        const pausedText = await dialogue.locator('.dialogue [aria-hidden]').textContent()
        await page.waitForTimeout(100)
        assert.equal(await dialogue.locator('.dialogue [aria-hidden]').textContent(), pausedText)
        assert.equal(await overlay.evaluate(element => element.classList.contains('thinking-message')), false)
        assert.equal(await overlay.evaluate(element => document.activeElement === element), true)
        const smokingBox = await overlay.boundingBox()
        for (const key of ['x', 'y', 'width', 'height']) assert.ok(Math.abs(smokingBox[key] - originalBox[key]) <= 1, `${key}: ${smokingBox[key]} != ${originalBox[key]}`)
        assert.equal(await overlay.locator('.speaker').count(), 0)
        const overlayOpacity = await overlay.evaluate(element => getComputedStyle(element).opacity)
        assert.equal(overlayOpacity, '1')

        assert.match(await overlay.locator('.dialogue .sr-only').textContent(), new RegExp(gesturePhrase))
        // 表示状態の取得とclickの間に全文表示が完了しても、ヒントを飛ばさない。
        await overlay.locator('.next').waitFor()
        await overlay.click() // 動作文から現在の進捗に応じたヒントへ
        await page.waitForFunction(() => document.querySelector('.smoking-overlay .dialogue .sr-only')?.textContent.includes('今の話を最後まで'))
        const hint = page.locator('.smoking-overlay .dialogue-button')
        await hint.locator('.next').waitFor()
        await hint.click() // ヒントの最終読了で復帰
        await page.waitForFunction(() => !document.querySelector('.smoking-overlay'))
        assert.equal(await dialogue.isVisible(), true)
        assert.equal(await dialogue.getAttribute('data-page'), initialPage)
        assert.ok((await dialogue.locator('.dialogue [aria-hidden]').textContent()).startsWith(pausedText))
        assert.equal(await page.evaluate(key => localStorage.getItem(key), saveKey), beforeSave)
        assert.match(await page.evaluate(() => document.activeElement?.textContent ?? ''), /タバコを吸う/)
      }

      for (const [place, variant, phrase] of [
        ['吸える場所', 'smoking', 'ひと息ついた'],
        ['吸えない場所', 'non-smoking', '吸えないと思い直した'],
      ]) {
        await page.getByRole('button', { name: place, exact: true }).click()
        await page.evaluate(() => document.querySelector('.game-shell').scrollIntoView({ block: 'start' }))
        await completeCutIn(variant, phrase)
      }

      // 選択演出開始直後に呼び出しても、MENU一時停止で選択がキャンセルされ、Free Actionへ戻る。
      for (let index = 0; index < 40 && await page.locator('.free-action-panel').count() === 0; index++) await dialogue.click()
      const commands = page.locator('.free-action-panel')
      await commands.waitFor()
      await page.evaluate(() => {
        document.querySelector('.free-action-panel button').click()
        const smokingButton = Array.from(document.querySelectorAll('.toolbar-actions > button')).find(button => button.textContent.includes('タバコを吸う'))
        smokingButton.click()
      })
      const overlay = page.locator('.smoking-overlay .dialogue-button')
      await overlay.waitFor()
      assert.equal(await overlay.locator('.speaker').count(), 0)
      await overlay.click(); await overlay.locator('.next').waitFor(); await overlay.click()
      const hint = page.locator('.smoking-overlay .dialogue-button')
      await hint.locator('.next').waitFor(); await hint.click()
      await page.waitForFunction(() => !document.querySelector('.smoking-overlay'))
      await commands.waitFor()
      assert.equal(await page.getByLabel('聞く話題', { exact: true }).count(), 0)

      // サブメニューを開いた状態も維持する。
      await commands.getByRole('button', { name: /聞く/ }).click()
      const topics = page.getByLabel('聞く話題', { exact: true })
      await topics.waitFor()
      const topicLabels = await topics.locator('.command-name').allTextContents()
      await smokingButton.click()
      const submenuOverlay = page.locator('.smoking-overlay .dialogue-button')
      await submenuOverlay.waitFor()
      await submenuOverlay.click(); await submenuOverlay.locator('.next').waitFor(); await submenuOverlay.click()
      const submenuHint = page.locator('.smoking-overlay .dialogue-button')
      await submenuHint.locator('.next').waitFor(); await submenuHint.click()
      await page.waitForFunction(() => !document.querySelector('.smoking-overlay'))
      await topics.waitFor()
      assert.deepEqual(await topics.locator('.command-name').allTextContents(), topicLabels)
      assert.equal(await page.evaluate(key => localStorage.getItem(key), saveKey), beforeSave)
      console.log(JSON.stringify({ viewport: [width, height], variants: ['smoking', 'non-smoking'], sameDialogueGeometry: true, stateRestored: ['dialogue', 'free-action', 'submenu'] }))
    } finally { await browser.close() }
  })
}

test('喫煙挿絵の読み込み失敗時も仮ヒントを読んで復帰できる', { skip: !playwrightPath }, async () => {
  const { chromium } = await import(playwrightPath)
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
  try {
    await page.route(/minato-smoking\.png/, route => route.abort())
    await page.goto(baseUrl)
    await page.locator('.toolbar-actions').getByRole('button', { name: 'タバコを吸う' }).click()
    await page.locator('.smoking-cut-in-fallback').waitFor()
    const overlay = page.locator('.smoking-overlay .dialogue-button')
    await overlay.waitFor()
    assert.equal(await overlay.isVisible(), true)
    await overlay.click(); await overlay.locator('.next').waitFor(); await overlay.click()
    const hint = page.locator('.smoking-overlay .dialogue-button')
    await hint.locator('.next').waitFor(); await hint.click()
    await page.waitForFunction(() => !document.querySelector('.smoking-overlay'))
    await page.locator('.story-content .dialogue-button').waitFor()
  } finally { await browser.close() }
})
