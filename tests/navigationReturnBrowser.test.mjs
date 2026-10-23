import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5421/'
for (const [width, height] of [[1920, 1080], [1366, 768]]) test(`戻る操作で呼出元・入力・進捗を保持 ${width}`, { skip: !path, timeout: 90000 }, async () => {
  const api = await loadRevision(), run = buildPlaythrough(api, true)
  const { chromium } = await import(path), browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width, height } }), errors = []
  page.on('pageerror', error => errors.push(error.message))
  const button = name => page.getByRole('button', { name, exact: true })
  const menu = () => page.getByLabel('メニュー', { exact: true })
  const node = () => page.locator('.story').getAttribute('data-node-id')
  const load = async state => {
    await page.goto(url)
    await page.evaluate(data => {
      localStorage.clear()
      localStorage.setItem('detective-saeki-minato.speed', '0')
      localStorage.setItem('detective-saeki-minato.slots.v1', JSON.stringify({ version: 1, auto: null, manual: [{ data, label: '戻る検証', savedAt: '', history: [] }] }))
    }, api.createSaveData(state))
    await page.reload()
    await button('CONTINUE').click(); await button('SAVE １').click()
    await page.locator('.story').waitFor()
  }
  const saveData = async () => {
    await menu().click(); await button('SAVE').click()
    await page.getByRole('dialog', { name: 'セーブしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
    return page.evaluate(() => JSON.parse(localStorage.getItem('detective-saeki-minato.slots.v1')).manual[0].data)
  }
  const focused = async locator => {
    try { await page.waitForFunction(el => el === document.activeElement, await locator.elementHandle(), { timeout: 3000 }) }
    catch (error) { throw new Error(JSON.stringify(await page.evaluate(() => ({ active: document.activeElement?.outerHTML, menu: document.querySelector('.save-controls')?.open, dialogs: [...document.querySelectorAll('dialog[open]')].map(el => el.getAttribute('aria-label')) }))), { cause: error }) }
  }
  try {
    const initial = { ...api.createInitialState(api.scenario), nodeId: 'P1-01-intro' }
    await load(initial)
    const dialogue = page.locator('.story-content .dialogue-button')
    await dialogue.locator('.next').waitFor()
    const before = { node: await node(), page: await dialogue.getAttribute('data-page'), text: await dialogue.textContent() }
    const unchanged = async () => {
      assert.deepEqual({ node: await node(), page: await dialogue.getAttribute('data-page'), text: await dialogue.textContent() }, before)
    }
    for (const close of ['Escape', '閉じる']) {
      await menu().click()
      await page.getByRole('dialog', { name: 'システムメニュー', exact: true }).waitFor()
      if (close === 'Escape') await page.keyboard.press('Escape')
      else await button('システムメニューを閉じる').click()
      await focused(menu()); await unchanged()
    }
    for (const close of ['Escape', '戻る']) {
      await menu().click(); await button('LOAD').click()
      const slots = page.getByRole('dialog', { name: 'LOAD', exact: true })
      await slots.waitFor()
      if (close === 'Escape') await page.keyboard.press('Escape')
      else await slots.getByRole('button', { name: '戻る', exact: true }).click()
      await focused(button('LOAD'))
      assert.equal(await page.getByRole('dialog', { name: 'システムメニュー', exact: true }).isVisible(), true)
      await button('RETURN TO TITLE').click()
      await button('BACK TO GAME').click()
      await focused(button('RETURN TO TITLE'))
      await button('システムメニューを閉じる').click(); await unchanged()
    }
    for (const close of ['Escape', '調査記録を閉じる']) {
      await button('調査記録').click()
      await page.getByRole('dialog', { name: '調査記録', exact: true }).waitFor()
      if (close === 'Escape') await page.keyboard.press('Escape')
      else await button(close).click()
      await focused(button('調査記録')); await unchanged()
    }
    await button('会話履歴を開く').click()
    await page.getByRole('dialog', { name: '会話履歴', exact: true }).waitFor()
    await page.keyboard.press('Escape')
    await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === '会話履歴を開く')
    await unchanged()
    await button('タバコを吸う').click()
    for (let count = 0; await page.locator('.smoking-overlay').count(); count++) {
      assert.ok(count < 20, '喫煙会話が終了する')
      const overlay = page.locator('.smoking-overlay .dialogue-button')
      await overlay.locator('.next').waitFor(); await overlay.click()
    }
    await page.waitForFunction(() => document.activeElement?.textContent?.includes('タバコを吸う'))
    await unchanged()
    assert.deepEqual(await saveData(), api.createSaveData(initial), 'オーバーレイ復帰で進捗を変えない')
    for (const close of ['Escape', '戻る']) {
      const state = { ...run.checkpoints.find(point => point.phase === 'P2-01').state, nodeId: 'P2-01-map' }
      await load(state)
      await page.locator('.travel-map').waitFor()
      if (close === 'Escape') await page.keyboard.press('Escape')
      else await button('戻る').click()
      const expected = api.reduceGameState(api.scenario, state, { type: 'choose', choiceId: 'return' })
      await page.waitForFunction(id => document.querySelector('.story')?.dataset.nodeId === id, expected.nodeId)
      assert.deepEqual(await saveData(), api.createSaveData(expected), '地図の戻り先と進捗')
    }
    for (const command of ['think', 'organize']) {
      const index = run.operations.findIndex(operation => operation.action.type === 'choose' && operation.action.choiceId === command)
      assert.ok(index >= 0, command)
      let expected = run.states[index]
      await load(expected)
      const label = run.operations[index].label
      await page.locator('.command-panel button').filter({ has: page.locator('.command-name', { hasText: new RegExp(`^${RegExp.escape(label)}$`) }) }).click()
      expected = api.reduceGameState(api.scenario, expected, run.operations[index].action)
      for (let count = 0; api.selectCurrentNode(api.scenario, expected).type === 'dialogue'; count++) {
        assert.ok(count < 100, command)
        await page.waitForFunction(id => document.querySelector('.story')?.dataset.nodeId === id, expected.nodeId)
        await page.locator('.story-content .dialogue-button .next').waitFor()
        await page.locator('.story-content .dialogue-button').click()
        expected = api.reduceGameState(api.scenario, expected, { type: 'advance' })
      }
      await page.waitForFunction(id => document.querySelector('.story')?.dataset.nodeId === id, expected.nodeId)
      assert.deepEqual(await saveData(), api.createSaveData(expected), `${command}のデータ指定先へ復帰`)
    }
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})
