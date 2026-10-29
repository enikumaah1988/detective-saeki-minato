import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision } from './revisionHarness.mjs'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5191/'
for (const [width, height] of [[1920, 1080], [1366, 768], [844, 390]]) {
  test(`上部表示は通常会話と自由行動・履歴は会話窓のみ ${width}`, { skip: !path }, async () => {
    const api = await loadRevision()
    const { chromium } = await import(path)
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width, height } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    const nodes = Object.entries(api.scenario.nodes).filter(([id]) => !api.scenario.saveNodeAliases?.[id])
    const cases = [
      ['通常会話', node => node.type === 'dialogue' && !node.illustration && !node.acquisition && node.savePhaseId === 'P1-01', true],
      ['オープニング', node => node.sceneId === 'episode-prologue-scene', false],
      ...['P4-09', 'P4-10', 'P4-11'].map(phase => [`エンディング ${phase}`, node => node.type === 'dialogue' && !node.autoAdvance && !node.illustration && node.savePhaseId === phase, false]),
      ['扉絵', node => Boolean(node.illustration), false],
      ...[1, 2, 3, 4].map(part => ['部開始 ' + part, node => node.illustration?.id === 'C' + part + '-IN', false]),
      ['フリーアクション', node => node.type === 'choice' && node.mode === 'free-action', true],
      ['選択肢', node => node.type === 'choice' && !node.map && node.mode !== 'free-action', true],
      ['移動サブコマンド', node => node.type === 'choice' && !node.map && node.prompt === '移動', true],
      ['建物の前', node => node.type === 'choice' && !node.map && node.prompt.endsWith('前'), true],
      ['話題', node => node.type === 'topic', true],
      ['調査対象', node => node.type === 'inspect', true],
      ['地図', node => Boolean(node.map), false],
      ['受取', node => Boolean(node.acquisition), false],
      ['終了', node => node.type === 'end', false],
    ]
    const menu = () => page.getByLabel('メニュー', { exact: true })
    const check = async visible => {
      assert.equal(await menu().isVisible(), true)
      for (const selector of ['.scene-context', '.toolbar-actions > button']) {
        for (const element of await page.locator(selector).all()) assert.equal(await element.isVisible(), visible)
      }
    }
    try {
      await page.goto(url)
      for (const [label, predicate, visible] of cases) {
        const entry = nodes.find(([, node]) => predicate(node))
        assert.ok(entry, label)
        const state = { ...api.createInitialState(api.scenario), nodeId: entry[0] }
        const raw = JSON.stringify(api.createSaveData(state))
        await page.evaluate(value => {
          localStorage.removeItem('detective-saeki-minato.slots.v1')
          localStorage.setItem('detective-saeki-minato.save.v1', value)
        }, raw)
        await page.reload()
        await menu().click()
        await page.getByRole('button', { name: 'LOAD', exact: true }).click()
        await page.getByRole('dialog', { name: 'LOAD', exact: true }).getByRole('button', { name: 'SAVE １', exact: true }).click()
        await page.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
        assert.equal(await page.locator('.story').getAttribute('data-node-id'), entry[0], label)
        await check(visible)
        assert.equal(await page.locator('.history-entry').count() > 0, await page.locator('.message-window').count() > 0 && !entry[1].acquisition, label)
        if (label.startsWith('部開始 ')) {
          assert.equal(await page.locator('.story-content').count(), 0)
          assert.equal(await page.locator('.history-entry').count(), 0)
          assert.equal(await page.locator('.chapter-heading').isVisible(), true)
          if (label.endsWith('1') || label.endsWith('3')) await page.locator('.chapter-heading').click()
          else {
            // LOAD returns focus to MENU; Enter there operates the menu, not the story.
            await menu().evaluate(element => element.blur())
            await page.keyboard.press('Enter')
          }
          await page.waitForFunction(id => document.querySelector('.story')?.getAttribute('data-node-id') !== id, entry[0])
        }
        if (label === '通常会話') {
          await menu().click()
          await check(false)
          await page.getByRole('button', { name: 'システムメニューを閉じる', exact: true }).click()
          await check(true)
          await page.getByRole('button', { name: 'タバコを吸う', exact: true }).click()
          await page.locator('.smoking-overlay').waitFor()
          await check(false)
        }
        if (label === '地図') {
          await menu().click()
          await page.getByRole('button', { name: 'SAVE', exact: true }).click()
          await page.getByRole('dialog', { name: 'セーブしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
          await check(false)
          assert.equal(await page.locator('.travel-map').isVisible(), true)
        }
      }
      assert.deepEqual(errors, [])
    } finally { await browser.close() }
  })
}
