import test from 'node:test'
import assert from 'node:assert/strict'
const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5176'
const saveKey = 'detective-saeki-minato.save.v1'

for (const [width, height] of [[1920, 1080], [1366, 768]]) {
  test(`調査記録実画面 ${width}×${height}: 停止・分類・時系列・フォーカス・長文`, { skip: !playwrightPath }, async () => {
    const { chromium } = await import(playwrightPath)
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({ viewport: { width, height } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    // 多数・長文・画像読み込み失敗は検証時のみ定義へ追加。本編データには残さない。
    await page.route(/\/src\/data\/investigation\.ts(?:\?|$)/, async route => {
      const response = await route.fetch()
      const extra = Array.from({ length: 24 }, (_, i) => ({ id: `browser-test-${i}`, category: 'evidence', title: `長い調査記録の検証項目 ${i}`, source: { type: 'information', ids: ['stress-test'] }, description: '長い調査結果を領域内だけでスクロールする。\n'.repeat(45), ...(i === 0 ? { imageSrc: '/missing-record-test.png' } : {}) }))
      await route.fulfill({ response, body: await response.text() + `\npart1Records.push(...${JSON.stringify(extra)});` })
    })
    try {
      await page.goto(baseUrl)
      const open = page.getByRole('button', { name: '調査記録', exact: true })
      const dialogue = page.locator('.dialogue-button')
      await page.waitForTimeout(100)
      await open.focus(); await page.keyboard.press('Enter')
      const modal = page.getByRole('dialog', { name: '調査記録', exact: true })
      await modal.waitFor()
      assert.equal(await dialogue.isVisible(), false)
      const textBefore = await dialogue.locator('.dialogue > [aria-hidden]').textContent()
      const pageBefore = await dialogue.getAttribute('data-page')
      await page.waitForTimeout(120)
      assert.equal(await dialogue.locator('.dialogue > [aria-hidden]').textContent(), textBefore)
      assert.equal(await dialogue.getAttribute('data-page'), pageBefore)
      assert.deepEqual(await modal.getByRole('tab').allTextContents(), ['人物', '証拠', '出来事', '持ち物'])
      assert.equal(await modal.locator('.record-list button').count(), 0)
      assert.equal(await modal.locator('.record-detail').textContent(), '')
      assert.match(await modal.textContent(), /記録はありません/)
      assert.doesNotMatch(await modal.textContent(), /澪の兄|兄の写真/)
      // Arrow/Home/Endでタブ切替。Enterで項目選択。
      await page.keyboard.press('End')
      assert.equal(await modal.getByRole('tab', { name: '持ち物', exact: true }).getAttribute('aria-selected'), 'true')
      assert.deepEqual(await modal.locator('.record-list button').allTextContents(), ['スマホ', '電子タバコ', '名刺'])
      assert.equal(await modal.locator('.record-detail h3').textContent(), 'スマホ')
      assert.equal(await modal.getByRole('button', { name: 'スマホ', exact: true }).getAttribute('aria-pressed'), 'true')
      await modal.getByRole('button', { name: '名刺', exact: true }).focus(); await page.keyboard.press('Enter')
      assert.equal(await modal.locator('.record-detail h3').textContent(), '名刺')
      for (const name of ['人物', '証拠', '出来事']) {
        await modal.getByRole('tab', { name, exact: true }).click()
        assert.equal(await modal.locator('.record-list').textContent(), '記録はありません')
        assert.equal(await modal.locator('.record-detail').textContent(), '')
        assert.equal(await modal.locator('[aria-pressed="true"]').count(), 0)
        await modal.getByRole('tab', { name: '持ち物', exact: true }).click()
        assert.equal(await modal.locator('.record-detail h3').textContent(), 'スマホ')
        assert.equal(await modal.getByRole('button', { name: 'スマホ', exact: true }).getAttribute('aria-pressed'), 'true')
      }
      for (let n = 0; n < 14; n++) {
        await page.keyboard.press(n < 7 ? 'Tab' : 'Shift+Tab')
        assert.equal(await modal.evaluate(el => el.contains(document.activeElement)), true)
      }
      await page.keyboard.press('Escape')
      await modal.waitFor({ state: 'detached' })
      assert.equal(await dialogue.isVisible(), true)
      assert.equal(await open.evaluate(el => document.activeElement === el), true)
      assert.equal(await dialogue.getAttribute('data-page'), pageBefore)
      assert.ok((await dialogue.locator('.dialogue > [aria-hidden]').textContent()).startsWith(textBefore))
      // 全取得状態を既存version2のロード経由で復元する。
      const saved = { version: 2, scenarioId: 'gray-testimony-part1-demo', nodeId: 'menu', flags: { photo_examined: true }, heardTopics: ['brother', 'missing', 'recent-brother', 'accident'], inspectedTargets: ['client', 'photo'], acquiredInformation: ['photo_date', 'disappearance_timing', 'missing_date', 'last_known_activity', 'brother_recent', 'past_accident', 'brother_profile', 'stress-test'] }
      await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: saveKey, data: saved })
      const menu = page.getByLabel('メニュー', { exact: true })
      await menu.click(); await page.getByRole('button', { name: 'ロード', exact: true }).click(); await menu.click()
      await page.locator('.free-action-panel').waitFor()
      // 選択演出中に調査記録を開くと、その選択はキャンセルされる。
      await page.evaluate(() => {
        document.querySelector('.free-action-panel button').click();
        [...document.querySelectorAll('.toolbar-actions > button')].find(button => button.textContent === '調査記録').click()
      })
      await modal.waitFor(); await page.waitForTimeout(220)
      assert.equal(await page.locator('.command-panel').isVisible(), false)
      assert.equal(await modal.locator('.record-detail h3').textContent(), '澪の兄')
      assert.match(await modal.locator('.record-detail').textContent(), /三日前|昔の事故/)
      await modal.getByRole('tab', { name: '出来事', exact: true }).click()
      assert.deepEqual(await modal.locator('.record-list button').allTextContents(), ['以前（時期不明）過去の事故', '最後の連絡時最後に確認された行動', '三日前から兄との連絡が途絶える'])
      if (process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/records-events-${width}.png` })
      await modal.getByRole('tab', { name: '証拠', exact: true }).click()
      assert.equal(await modal.locator('.record-list button').count(), 25)
      assert.equal(await modal.locator('.record-detail img').count(), 0)
      await modal.getByRole('button', { name: '長い調査記録の検証項目 0', exact: true }).click()
      await page.waitForTimeout(100)
      assert.equal(await modal.locator('.record-detail img').count(), 0) // 読み込み失敗でも本文は残る
      const metrics = await modal.evaluate(el => {
        const r = el.getBoundingClientRect(), game = el.parentElement.getBoundingClientRect(), list = el.querySelector('.record-list'), detail = el.querySelector('.record-detail')
        return { width: r.width, height: r.height, gameWidth: game.width, gameHeight: game.height,
          listScroll: list.scrollHeight > list.clientHeight, detailScroll: detail.scrollHeight > detail.clientHeight,
          panelScroll: el.scrollHeight > el.clientHeight + 1, horizontalOverflow: el.scrollWidth > el.clientWidth + 1 || list.scrollWidth > list.clientWidth + 1 || detail.scrollWidth > detail.clientWidth + 1, bodyOverflow: document.body.style.overflow,
          listWidth: list.getBoundingClientRect().width, detailWidth: detail.getBoundingClientRect().width }
      })
      assert.ok(Math.abs(metrics.width - metrics.gameWidth * .85) < 1)
      assert.ok(Math.abs(metrics.height - metrics.gameHeight * .8) < 1)
      assert.ok(Math.abs(metrics.listWidth / metrics.detailWidth - 3 / 7) < .01)
      assert.equal(metrics.listScroll, true); assert.equal(metrics.detailScroll, true); assert.equal(metrics.panelScroll, false); assert.equal(metrics.horizontalOverflow, false); assert.equal(metrics.bodyOverflow, 'hidden')
      await modal.locator('.record-detail').focus(); await page.keyboard.press('PageDown')
      await page.waitForTimeout(150)
      assert.ok(await modal.locator('.record-detail').evaluate(el => el.scrollTop > 0))
      if (process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/records-stress-${width}.png` })
      await modal.getByRole('tab', { name: '持ち物', exact: true }).click()
      assert.equal(await modal.locator('.record-list button').count(), 3)
      assert.doesNotMatch(await modal.locator('.record-list').textContent(), /写真/)
      await modal.getByRole('button', { name: '調査記録を閉じる', exact: true }).focus(); await page.keyboard.press('Space')
      await modal.waitFor({ state: 'detached' }); await page.locator('.free-action-panel').waitFor()
      await menu.click(); await page.getByRole('button', { name: 'セーブ', exact: true }).click()
      assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey), saved)
      await menu.click()
      assert.deepEqual(await page.locator('.free-action-panel .command-name').allTextContents(), ['考える'])
      // 実際の聞き込み完了から取得した情報が、閲覧記録へ反映される。
      const fresh = { version: 2, scenarioId: 'gray-testimony-part1-demo', nodeId: 'topics', flags: {}, heardTopics: [], inspectedTargets: [], acquiredInformation: [] }
      await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: saveKey, data: fresh })
      await menu.click(); await page.getByRole('button', { name: 'ロード', exact: true }).click(); await menu.click()
      await page.getByLabel('聞く話題', { exact: true }).getByRole('button', { name: /兄について/ }).first().click()
      await dialogue.waitFor()
      for (let n = 0; n < 8 && await dialogue.count(); n++) await dialogue.click()
      await page.locator('.free-action-panel').waitFor()
      await open.click(); await modal.waitFor()
      assert.equal(await modal.locator('.record-detail h3').textContent(), '澪の兄')
      assert.match(await modal.locator('.record-detail').textContent(), /几帳面/)
      assert.doesNotMatch(await modal.locator('.record-detail').textContent(), /三日前|昔の事故/)
      await modal.getByRole('button', { name: '調査記録を閉じる', exact: true }).click()
      await menu.click(); await page.getByRole('button', { name: 'セーブ', exact: true }).click()
      const acquired = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey)
      assert.deepEqual(acquired.heardTopics, ['brother']); assert.deepEqual(acquired.acquiredInformation, ['brother_profile'])
      await menu.click()
      const hearMissing = async () => {
        await page.locator('.free-action-panel').getByRole('button', { name: /聞く/ }).click()
        await page.getByLabel('聞く話題', { exact: true }).getByRole('button', { name: /失踪について/ }).click()
        await dialogue.waitFor()
      }
      await hearMissing()
      // 会話の途中で開いても、未取得の失踪情報を記録へ先取りしない。
      await open.click(); await modal.waitFor()
      await modal.getByRole('button', { name: '相澤澪', exact: true }).click()
      assert.match(await modal.locator('.record-detail').textContent(), /几帳面/)
      assert.doesNotMatch(await modal.locator('.record-detail').textContent(), /三日前/)
      assert.equal(await dialogue.isVisible(), false)
      const pausedText = await dialogue.locator('.dialogue > [aria-hidden]').textContent()
      await modal.getByRole('button', { name: '調査記録を閉じる', exact: true }).click()
      assert.equal(await dialogue.isVisible(), true)
      assert.ok((await dialogue.locator('.dialogue > [aria-hidden]').textContent()).startsWith(pausedText))
      for (let n = 0; n < 8 && await dialogue.count(); n++) await dialogue.click()
      await page.locator('.free-action-panel').waitFor()
      const checkMissingRecord = async () => {
        await open.click(); await modal.waitFor()
        assert.equal(await modal.getByRole('button', { name: '相澤澪', exact: true }).count(), 1)
        await modal.getByRole('button', { name: '相澤澪', exact: true }).click()
        assert.match(await modal.locator('.record-detail').textContent(), /三日前/)
        assert.doesNotMatch(await modal.locator('.record-detail').textContent(), /事故|緊張/)
        await modal.getByRole('tab', { name: '出来事', exact: true }).click()
        assert.deepEqual(await modal.locator('.record-list button').allTextContents(), ['三日前から兄との連絡が途絶える'])
        await modal.getByRole('button', { name: '調査記録を閉じる', exact: true }).click()
      }
      await checkMissingRecord()
      await hearMissing()
      for (let n = 0; n < 8 && await dialogue.count(); n++) await dialogue.click()
      await page.locator('.free-action-panel').waitFor()
      await checkMissingRecord()
      await menu.click(); await page.getByRole('button', { name: 'セーブ', exact: true }).click(); await menu.click()
      const savedProgress = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey)
      assert.deepEqual(savedProgress.heardTopics, ['brother', 'missing'])
      assert.deepEqual(savedProgress.acquiredInformation, ['brother_profile', 'missing_date', 'disappearance_timing'])
      await page.reload()
      await menu.click(); await page.getByRole('button', { name: 'ロード', exact: true }).click(); await menu.click()
      await page.locator('.free-action-panel').waitFor()
      await checkMissingRecord()
      assert.deepEqual(errors, [])
      console.log(JSON.stringify({ viewport: [width, height], records: '85%×80%', stressRows: 25, keyboardFocusTrapped: true, gameUnchanged: true }))
    } finally { await browser.close() }
  })
}
