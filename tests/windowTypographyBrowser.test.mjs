import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = (process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5187/').split('?')[0]
for (const [width, height] of [[1920, 1080], [1366, 768]]) test(`操作ウィンドウの見出しを統一 ${width}`, { skip: !path }, async () => {
  const { chromium } = await import(path), browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width, height } })
  const typography = locator => locator.evaluate(el => {
    const style = getComputedStyle(el)
    return { family: style.fontFamily, size: style.fontSize, weight: style.fontWeight }
  })
  try {
    const api = await loadRevision(), run = buildPlaythrough(api, true)
    await page.goto(url)
    await page.getByRole('button', { name: 'SETTINGS', exact: true }).click()
    const expected = await typography(page.locator('.system-dialog h2'))
    assert.ok(Math.abs(parseFloat(expected.size) - Math.min(width, height * 16 / 9) * 36 / 1920) < .01)
    await page.keyboard.press('Escape')
    await page.evaluate(data => localStorage.setItem('detective-saeki-minato.slots.v1', JSON.stringify({ version: 1, auto: null, manual: [{ data, label: '記録検証', savedAt: '2026-10-20T00:00:00Z', history: [] }] })), api.createSaveData({ ...api.createInitialState(api.scenario), nodeId: 'P1-01-menu' }))
    await page.getByRole('button', { name: 'CONTINUE', exact: true }).click()
    await page.getByRole('button', { name: 'SAVE １', exact: true }).click()
    await page.getByRole('button', { name: '調査記録', exact: true }).click()
    assert.deepEqual(await typography(page.getByRole('dialog', { name: '調査記録', exact: true }).locator('h2')), expected)
    await page.keyboard.press('Escape')
    await page.getByLabel('メニュー', { exact: true }).click()
    assert.deepEqual(await typography(page.locator('.system-menu-panel h2')), expected)
    await page.getByRole('button', { name: 'RETURN TO TITLE', exact: true }).click()
    assert.deepEqual(await typography(page.locator('.system-dialog h2')), expected)
    if (process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/return-confirm-${width}.png` })
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'RETURN TO TITLE', exact: true }).click()
    await page.getByRole('dialog', { name: 'タイトルに戻りますか？', exact: true }).getByRole('button', { name: 'RETURN TO TITLE', exact: true }).click()
    const state = { ...run.checkpoints.find(point => point.phase === 'P2-01').state, nodeId: 'P2-01-map' }
    await page.evaluate(data => localStorage.setItem('detective-saeki-minato.slots.v1', JSON.stringify({ version: 1, auto: null, manual: [{ data, label: '見出し検証', savedAt: '2026-10-20T00:00:00Z', history: [] }] })), api.createSaveData(state))
    await page.getByRole('button', { name: 'CONTINUE', exact: true }).click()
    await page.getByRole('button', { name: 'SAVE １', exact: true }).click()
    assert.deepEqual(await typography(page.locator('.travel-map h1')), expected)
    assert.deepEqual(await typography(page.locator('.travel-map h2')), expected)
  } finally { await browser.close() }
})
