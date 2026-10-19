import test from 'node:test'
import assert from 'node:assert/strict'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5191/'

test('StrictMode: プレビュー再要求・通常記録・MENUのフォーカス復帰と進行停止', { skip: !path }, async () => {
  const { chromium } = await import(path)
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(new URL('/', url).href)
    await page.evaluate(async () => {
      localStorage.setItem('detective-saeki-minato.speed', '0')
      const { mountHarness } = await import('/tests/fixtures/hooksLifecycle.tsx')
      mountHarness()
    })
    const host = page.locator('[data-hooks-regression]')
    const story = host.locator('.story')
    const node = await story.getAttribute('data-node-id')
    const request = host.getByRole('button', { name: 'プレビュー要求', exact: true })
    for (let i = 0; i < 2; i++) {
      await request.click()
      const dialog = host.getByRole('dialog')
      await dialog.waitFor()
      assert.match(await dialog.textContent(), /DEV・UI確認用：回帰検証/)
      await page.keyboard.press('Enter')
      assert.equal(await story.getAttribute('data-node-id'), node)
      await page.keyboard.press('Escape')
      await dialog.waitFor({ state: 'hidden' })
      assert.equal(await request.evaluate(element => element === document.activeElement), true)
    }
    const records = host.getByRole('button', { name: '調査記録', exact: true })
    await records.click()
    assert.doesNotMatch(await host.getByRole('dialog').textContent(), /DEV・UI確認用/)
    await page.keyboard.press('Escape')
    assert.equal(await records.evaluate(element => element === document.activeElement), true)
    const menu = host.getByLabel('メニュー', { exact: true })
    await menu.click()
    await host.getByRole('dialog', { name: 'システムメニュー', exact: true }).waitFor()
    await page.keyboard.press('Escape')
    await host.getByRole('dialog').waitFor({ state: 'hidden' })
    assert.equal(await menu.evaluate(element => element === document.activeElement), true)
    assert.equal(await story.getAttribute('data-node-id'), node)
    await menu.click()
    await host.getByRole('button', { name: 'SAVE', exact: true }).click()
    await host.getByRole('dialog', { name: 'セーブしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
    await page.evaluate(() => { document.body.tabIndex = -1; document.body.focus() })
    await page.keyboard.down('Enter')
    await page.waitForTimeout(150)
    await page.keyboard.up('Enter')
    assert.notEqual(await story.getAttribute('data-node-id'), node)
    const afterEnter = await story.getAttribute('data-node-id')
    await page.waitForTimeout(100)
    assert.equal(await story.getAttribute('data-node-id'), afterEnter)
    await menu.click()
    await host.getByRole('button', { name: 'LOAD', exact: true }).click()
    await host.getByRole('dialog', { name: 'LOAD', exact: true }).getByRole('button', { name: 'SAVE １', exact: true }).click()
    await host.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
    assert.equal(await story.getAttribute('data-node-id'), node)
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})

test('初期フォーカス指定の変更で開いたダイアログを再表示しない', { skip: !path }, async () => {
  const { chromium } = await import(path)
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.goto(new URL('/', url).href)
    await page.evaluate(async () => {
      const { mountHarness } = await import('/tests/fixtures/hooksLifecycle.tsx')
      mountHarness()
    })
    const host = page.locator('[data-hooks-regression]')
    await host.getByRole('button', { name: 'フォーカス検証', exact: true }).click()
    const dialog = host.getByRole('dialog', { name: 'フォーカス検証', exact: true })
    await dialog.waitFor()
    await dialog.evaluate(element => {
      element.dataset.reopens = '0'
      const showModal = element.showModal.bind(element)
      element.showModal = () => { element.dataset.reopens = String(Number(element.dataset.reopens) + 1); showModal() }
    })
    const update = dialog.getByRole('button', { name: '初期設定を更新', exact: true })
    await update.click()
    assert.equal(await dialog.getAttribute('data-reopens'), '0')
    assert.equal(await update.evaluate(element => element === document.activeElement), true)
    await dialog.getByRole('button', { name: 'OK', exact: true }).click()
    assert.equal(await host.getByRole('button', { name: 'フォーカス検証', exact: true }).evaluate(element => element === document.activeElement), true)
  } finally { await browser.close() }
})
