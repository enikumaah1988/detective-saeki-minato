import test from 'node:test'
import assert from 'node:assert/strict'

// 外部ライブラリをプロジェクトへ追加せず、検証環境のPlaywrightを明示指定する。
const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5176'
const longText = '午後の事務所。か\u3099、👨‍👩‍👧‍👦、🇯🇵、👍🏽も欠けずに表示する。'.repeat(5)
  + '\n明示改行を確認する。\n\n空行の後も全文を読む。\n' + '長い会話は途中で切り捨てない。'.repeat(12)

for (const [width, height] of [[1920, 1080], [1366, 768]]) {
  test(`PC実画面 ${width}×${height}: 必須情報が揃った時だけ考えるを表示しロード後も再計算`, { skip: !playwrightPath }, async () => {
    const { chromium } = await import(playwrightPath)
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({ viewport: { width, height } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    const required = ['brother_profile', 'disappearance_timing', 'last_known_activity', 'past_accident']
    const save = acquiredInformation => ({ version: 2, scenarioId: 'gray-testimony-part1-demo', nodeId: 'menu', flags: {}, heardTopics: [], inspectedTargets: [], acquiredInformation })
    try {
      await page.addInitScript(() => localStorage.setItem('detective-saeki-minato.save.v1', JSON.stringify({ version: 2, scenarioId: 'gray-testimony-part1-demo', nodeId: 'menu', flags: {}, heardTopics: [], inspectedTargets: [], acquiredInformation: [] })))
      await page.goto(baseUrl)
      const menu = page.getByLabel('メニュー', { exact: true })
      const load = async information => {
        await page.evaluate(value => localStorage.setItem('detective-saeki-minato.save.v1', JSON.stringify(value)), save(information))
        await menu.click()
        await page.getByRole('button', { name: 'ロード', exact: true }).click()
        await menu.click()
        await page.locator('.free-action-panel').waitFor()
      }

      await load(required.slice(0, 3))
      assert.equal(await page.getByRole('button', { name: '考える', exact: true }).count(), 0)
      const incompleteSavedState = await page.evaluate(() => JSON.parse(localStorage.getItem('detective-saeki-minato.save.v1')))
      assert.deepEqual(incompleteSavedState.acquiredInformation, required.slice(0, 3))

      await load([...required, 'photo_date', 'photo_date'])
      const commandLabels = await page.locator('.free-action-panel .command-name').allTextContents()
      assert.deepEqual(commandLabels.map(label => label.trim()), ['聞く', '調べる', '考える'])
      await page.getByRole('button', { name: '考える', exact: true }).click()
      await page.locator('.dialogue-button').waitFor()
      assert.match(await page.locator('.dialogue .sr-only').textContent(), /単なる失踪ではない/)
      assert.deepEqual(errors, [])
      console.log(JSON.stringify({ viewport: [width, height], thinkHiddenWhenIncomplete: true, visibleWhenComplete: true, loadRecalculation: true }))
    } finally { await browser.close() }
  })

  test(`PC実画面 ${width}×${height}: ページ送り・MENU・保存復帰・人物・連続入力`, { skip: !playwrightPath }, async () => {
    const { chromium } = await import(playwrightPath)
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({ viewport: { width, height } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      await page.route(/\/src\/data\/scenario\/freeActionDemo\.ts(?:\?|$)/, async route => {
        const response = await route.fetch()
        await route.fulfill({ response, body: await response.text() + `\nfreeActionDemo.nodes['office-daily'].text = ${JSON.stringify(longText)}; freeActionDemo.nodes['office-daily'].updates = [{ type: 'setFlag', id: 'paged_done', value: true }]; globalThis.__saekiScenarioForTest = freeActionDemo;` })
      })
      await page.goto(baseUrl)
      await page.evaluate(() => document.fonts.ready)
      const dialogue = page.locator('.dialogue-button')
      await page.waitForFunction(() => Number(document.querySelector('.dialogue-button')?.dataset.pages) > 1)
      const count = Number(await dialogue.getAttribute('data-pages'))
      const visible = () => dialogue.locator('.dialogue > [aria-hidden]').textContent()
      const menu = page.getByLabel('メニュー', { exact: true })
      // MENUは文字送り・現在ページを保ち、背面入力を無効化する。
      await menu.click()
      const before = await visible()
      await page.waitForTimeout(120)
      assert.equal(await visible(), before)
      const pageBefore = await dialogue.getAttribute('data-page')
      await menu.click()
      assert.equal(await dialogue.getAttribute('data-page'), pageBefore)
      let result = ''
      for (let index = 0; index < count; index++) {
        if (!await dialogue.locator('.next').count()) {
          if (index === 0) { await dialogue.focus(); await dialogue.press('Enter') }
          else await dialogue.click()
        }
        await dialogue.locator('.next').waitFor()
        result += await visible()
        const layout = await dialogue.evaluate(el => {
          const body = el.querySelector('.dialogue'), name = el.querySelector('.speaker'), indicator = el.querySelector('.next')
          const range = document.createRange(); range.selectNodeContents(body.querySelector('[aria-hidden]'))
          const rects = [...range.getClientRects()]; const lineHeight = parseFloat(getComputedStyle(body).lineHeight)
          const tops = [...new Set(rects.filter(r => r.width > 0).map(r => Math.round(r.top / lineHeight)))]
          return { lines: tops.length, nameBottom: name.getBoundingClientRect().bottom, textTop: body.getBoundingClientRect().top,
            textBottom: Math.max(body.getBoundingClientRect().top, ...rects.map(r => r.bottom)), indicatorTop: indicator.getBoundingClientRect().top,
            scroll: el.scrollHeight > el.clientHeight + 1 }
        })
        assert.ok(layout.lines <= 3, JSON.stringify(layout)); assert.ok(layout.textTop > layout.nameBottom)
        assert.ok(layout.textBottom <= layout.indicatorTop + 1, JSON.stringify(layout)); assert.equal(layout.scroll, false)
        if (index === 0 && process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/three-lines-${width}.png` })
        if (index === 1) {
          const currentPage = await dialogue.getAttribute('data-page'), currentText = await visible()
          await menu.click(); await page.waitForTimeout(80)
          assert.equal(await dialogue.getAttribute('data-page'), currentPage); assert.equal(await visible(), currentText)
          await page.getByRole('button', { name: 'セーブ', exact: true }).click()
          const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('detective-saeki-minato.save.v1')))
          assert.equal(saved.version, 2); assert.equal(saved.nodeId, 'office-daily'); assert.equal(saved.flags.paged_done, undefined)
          // 同じノードをロードしても先頭ページ・文字送り先頭から再開する。
          await page.getByRole('button', { name: 'ロード', exact: true }).click()
          assert.equal(await dialogue.getAttribute('data-page'), '1'); assert.equal(await visible(), '')
          await menu.click()
          // テストの読了ループを再開するため、先頭2ページを読み直す。
          for (let p = 0; p <= index; p++) {
            await dialogue.click(); await dialogue.locator('.next').waitFor()
            if (p < index) {
              await dialogue.evaluate(el => { el.click(); el.click() })
              assert.equal(Number(await dialogue.getAttribute('data-page')), p + 2)
            }
          }
        }
        if (index < count - 1) {
          if (index === 0) { await dialogue.focus(); await dialogue.press('Space') }
          else await dialogue.click()
        }
      }
      assert.equal(result, longText)
      if (process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/pages-${width}.png` })
      await dialogue.click() // 最終ページのみ更新・ノード進行
      await menu.click(); await page.getByRole('button', { name: 'セーブ', exact: true }).click()
      const completed = await page.evaluate(() => JSON.parse(localStorage.getItem('detective-saeki-minato.save.v1')))
      assert.equal(completed.nodeId, 'visitor'); assert.equal(completed.flags.paged_done, true)
      await menu.click()
      const people = () => page.locator('.character').evaluateAll(els => els.map(el => ({ id: el.dataset.characterId, className: el.className, rect: el.getBoundingClientRect().toJSON() })))
      const scenePeople = await people()
      assert.deepEqual(scenePeople.map(p => p.id), ['minato', 'mio'])
      for (let i = 0; i < 20 && await dialogue.count(); i++) await dialogue.click()
      await page.locator('.free-action-panel').waitFor()
      assert.deepEqual(await people(), scenePeople)
      // MENUは選択演出をキャンセルする。
      await page.evaluate(() => {
        document.querySelector('.free-action-panel button').click()
        document.querySelector('.save-controls summary').click()
      })
      await page.waitForTimeout(220)
      await menu.click(); await page.locator('.free-action-panel').waitFor()
      // 別項目を同時に押しても最初の項目だけが実行される。
      await page.locator('.free-action-panel').evaluate(el => { const b = el.querySelectorAll('button'); b[0].click(); b[1].click(); b[0].click() })
      await page.getByLabel('聞く話題', { exact: true }).waitFor()
      assert.deepEqual(await people(), scenePeople)
      await menu.click(); await page.getByRole('button', { name: 'セーブ', exact: true }).click(); await menu.click()
      await page.getByRole('button', { name: /兄について/ }).first().click()
      await dialogue.waitFor()
      for (let i = 0; i < 6 && await dialogue.count(); i++) await dialogue.click()
      await page.locator('.free-action-panel').waitFor()
      await menu.click(); await page.getByRole('button', { name: 'ロード', exact: true }).click(); await menu.click()
      await page.getByLabel('聞く話題', { exact: true }).waitFor()
      assert.deepEqual(await people(), scenePeople)
      await page.getByRole('button', { name: /戻る/ }).click(); await page.locator('.free-action-panel').waitFor()
      // 演出中にシステム条件が変われば実行を拒否する。
      await page.evaluate(async () => {
        const freeActionDemo = globalThis.__saekiScenarioForTest
        document.querySelector('.free-action-panel button').click()
        freeActionDemo.nodes.menu.options[0].condition = { type: 'flag', id: 'never' }
      })
      await page.waitForTimeout(220)
      assert.equal(await page.locator('.free-action-panel').count(), 1)
      assert.deepEqual(errors, [])
      console.log(JSON.stringify({ viewport: [width, height], pages: count, textRoundTrip: true, menuResume: true, submenuLoad: true, charactersStable: true }))
    } finally { await browser.close() }
  })
}

test('PC実画面: Free Action 0件はシナリオ指定の会話へ復帰', { skip: !playwrightPath }, async () => {
  const { chromium } = await import(playwrightPath)
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
    await page.route(/\/src\/data\/scenario\/freeActionDemo\.ts(?:\?|$)/, async route => {
      const response = await route.fetch()
      await route.fulfill({ response, body: await response.text() + '\nfreeActionDemo.nodes.menu.options = [];' })
    })
    await page.goto(baseUrl)
    for (let i = 0; i < 15 && await page.locator('.dialogue-button').count(); i++) await page.locator('.dialogue-button').click()
    const next = page.getByRole('button', { name: '会話に戻る', exact: true })
    await next.waitFor()
    assert.equal(await page.locator('.free-action-panel').count(), 0)
    await next.click(); await page.locator('.dialogue-button').waitFor()
    assert.match(await page.locator('.dialogue .sr-only').textContent(), /事情を聞かせて/)
  } finally { await browser.close() }
})
