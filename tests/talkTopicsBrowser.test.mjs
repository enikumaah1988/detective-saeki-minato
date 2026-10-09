import test from 'node:test'
import assert from 'node:assert/strict'

const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5176'
const longTopicLabel = '兄について聞いたあとに確認できる、長い話題名の折り返しと既読状態の位置を調べるための検証用項目'

for (const [width, height] of [[1920, 1080], [1366, 768]]) {
  test(`聞く話題一覧 ${width}×${height}: 長い名称・状態表示・トップとの配置`, { skip: !playwrightPath }, async () => {
    const { chromium } = await import(playwrightPath)
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({ viewport: { width, height } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    const injected = `
      freeActionDemo.nodes.topics.options[0].label = ${JSON.stringify(longTopicLabel)};
      freeActionDemo.nodes.topics.options.push(
        { id: 'locked-but-read', progressId: 'brother', label: '条件未達だが既読', next: 'brother', condition: { type: 'flag', id: 'topic-never' } },
        { id: 'unimplemented-but-read', progressId: 'brother', label: '未実装だが既読', next: 'brother', implemented: false },
        { id: 'runtime-topic', progressId: 'runtime-topic', label: '実行時再検証対象', next: 'brother', condition: { type: 'heardTopic', id: 'brother' }, updates: [{ type: 'addInformation', id: 'must-not-be-acquired' }] }
      );
      globalThis.__saekiScenarioForTest = freeActionDemo;
    `

    try {
      await page.route(/\/src\/data\/scenario\/freeActionDemo\.ts(?:\?|$)/, async route => {
        const response = await route.fetch()
        await route.fulfill({ response, body: `${await response.text()}\n${injected}` })
      })
      await page.goto(baseUrl)
      await page.evaluate(() => document.fonts.ready)

      const dialogue = page.locator('.dialogue-button')
      for (let i = 0; i < 20 && !await page.locator('.free-action-panel').count(); i++) {
        if (!await dialogue.count()) break
        await dialogue.click()
      }
      const topPanel = page.locator('.free-action-panel')
      await topPanel.waitFor()
      const measurePanel = panel => panel.evaluate(el => {
        const story = el.closest('.story').getBoundingClientRect()
        const rect = el.getBoundingClientRect()
        return {
          width: rect.width,
          rightInset: story.right - rect.right,
          centerY: rect.top + rect.height / 2,
          gameCenterY: story.top + story.height / 2,
          scrolls: el.scrollHeight > el.clientHeight + 1,
        }
      })
      const top = await measurePanel(topPanel)
      const game = await page.locator('.story').boundingBox()
      assert.ok(Math.abs(top.width - game.width * 420 / 1920) < 1, JSON.stringify({ top, game }))
      assert.ok(Math.abs(top.rightInset - game.width * .08) < 1, JSON.stringify({ top, game }))
      assert.ok(Math.abs(top.centerY - top.gameCenterY) < 1, JSON.stringify(top))

      await topPanel.getByRole('button', { name: '聞く', exact: true }).click()
      const topics = page.getByRole('navigation', { name: '聞く話題', exact: true })
      await topics.waitFor()
      // 長い検証用話題は先頭項目として表示し、後から既読になっても選択できる。
      const firstTopic = topics.locator('button').filter({ hasText: longTopicLabel }).first()
      await firstTopic.waitFor()
      assert.equal(await firstTopic.locator('.item-status').textContent(), '未実行')
      assert.equal(await topics.locator('button').count(), 3) // brother, missing, system return; no empty rows
      assert.equal(await topics.getByRole('button', { name: /条件未達だが既読|未実装だが既読|実行時再検証対象/ }).count(), 0)

      const metrics = await topics.evaluate(el => {
        const story = el.closest('.story').getBoundingClientRect()
        const panel = el.getBoundingClientRect()
        const heading = el.querySelector('.command-heading').getBoundingClientRect()
        const item = [...el.querySelectorAll('button')].find(button => button.querySelector('.command-name')?.textContent.includes('兄について聞いたあと'))
        const name = item.querySelector('.command-name')
        const status = item.querySelector('.item-status')
        const range = document.createRange()
        range.selectNodeContents(name)
        const textRects = [...range.getClientRects()].filter(rect => rect.width > 0)
        return {
          width: panel.width,
          rightInset: story.right - panel.right,
          centerY: panel.top + panel.height / 2,
          gameCenterY: story.top + story.height / 2,
          headingWidth: heading.width,
          itemWidth: item.getBoundingClientRect().width,
          itemHeight: item.getBoundingClientRect().height,
          lineCount: textRects.length,
          textRight: Math.max(...textRects.map(rect => rect.right)),
          statusLeft: status.getBoundingClientRect().left,
          fontSize: Number.parseFloat(getComputedStyle(item).fontSize),
          scale: story.width / 1920,
          itemScrolls: item.scrollHeight > item.clientHeight + 1,
          panelScrolls: el.scrollHeight > el.clientHeight + 1,
        }
      })
      assert.ok(Math.abs(metrics.width - top.width) < 1, JSON.stringify({ top, metrics }))
      assert.ok(Math.abs(metrics.rightInset - top.rightInset) < 1, JSON.stringify({ top, metrics }))
      assert.ok(Math.abs(metrics.centerY - metrics.gameCenterY) < 1, JSON.stringify(metrics))
      assert.ok(Math.abs(metrics.headingWidth - metrics.width) < 1, JSON.stringify(metrics))
      assert.ok(Math.abs(metrics.itemWidth - metrics.width) < 1, JSON.stringify(metrics))
      assert.ok(Math.abs(metrics.fontSize - 36 * metrics.scale) < .5, JSON.stringify(metrics))
      assert.ok(metrics.lineCount > 1, JSON.stringify(metrics))
      assert.ok(metrics.textRight <= metrics.statusLeft, JSON.stringify(metrics))
      assert.equal(metrics.itemScrolls, false)
      assert.equal(metrics.panelScrolls, false)

      await firstTopic.click()
      for (let i = 0; i < 4 && !await page.locator('.free-action-panel').count(); i++) await page.locator('.dialogue-button').click()
      await page.locator('.free-action-panel').waitFor()
      const topAgain = await measurePanel(page.locator('.free-action-panel'))
      assert.ok(Math.abs(topAgain.width - top.width) < 1)
      assert.ok(Math.abs(topAgain.rightInset - top.rightInset) < 1)

      await page.locator('.free-action-panel').getByRole('button', { name: '聞く', exact: true }).click()
      await topics.waitFor()
      const readLongTopic = topics.locator('button').filter({ hasText: longTopicLabel }).first()
      assert.equal(await readLongTopic.locator('.item-status').textContent(), '既読')
      assert.equal(await topics.locator('button').count(), 5)
      assert.equal(await topics.getByRole('button', { name: /最近の兄について/ }).locator('.item-status').textContent(), 'NEW')
      assert.equal(await topics.getByRole('button', { name: /実行時再検証対象/ }).locator('.item-status').textContent(), 'NEW')
      assert.equal(await topics.getByRole('button', { name: /実行時再検証対象/ }).count(), 1)
      assert.equal(await topics.getByRole('button', { name: /条件未達だが既読|未実装だが既読/ }).count(), 0)

      // 条件を満たして表示された話題を押した直後、150ms選択演出中に条件を失わせる。
      await page.evaluate(() => {
        const button = [...document.querySelectorAll('nav[aria-label="聞く話題"] button')]
          .find(element => element.textContent.includes('実行時再検証対象'))
        button.click()
        globalThis.__saekiScenarioForTest.nodes.topics.options.find(option => option.id === 'runtime-topic').condition = { type: 'flag', id: 'topic-never' }
      })
      await page.waitForTimeout(220)
      assert.equal(await topics.count(), 1)
      assert.equal(await page.locator('.dialogue-button').count(), 0)
      assert.deepEqual(errors, [])
      console.log(JSON.stringify({ viewport: [width, height], longTopicLines: metrics.lineCount, visibleInitialTopics: 3, visibleAfterRead: 5, staleSelectionRejected: true }))
    } finally {
      await browser.close()
    }
  })
}
