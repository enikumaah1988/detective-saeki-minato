import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = (process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5187/').split('?')[0]
for (const [width, height] of [[1920, 1080], [1366, 768]]) test(`感情別立ち絵・会話送り・ロード復帰 ${width}`, { skip: !path }, async () => {
  const api = await loadRevision(), run = buildPlaythrough(api, true)
  const { chromium } = await import(path), browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width, height } })
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  const person = id => page.locator(`[data-character-id="${id}"]`)
  const expectExpression = async (id, expression) => {
    assert.equal(await person(id).getAttribute('data-expression'), expression)
    const expected = await page.evaluate(async ({ id, expression }) => {
      const { resolveExpression } = await import('/src/data/presentation.ts')
      return resolveExpression(id, expression).imageSrc
    }, { id, expression })
    await page.waitForFunction(({ id, expected }) => {
      const image = document.querySelector(`[data-character-id="${id}"] .character-image`)
      return image?.src === expected && image.complete && image.naturalWidth > 0
    }, { id, expected })
    return person(id).locator('.character-image').getAttribute('src')
  }
  const load = async (nodeId, phase) => {
    await page.goto(url)
    const state = { ...run.checkpoints.find(point => point.phase === phase).state, nodeId }
    await page.evaluate(data => {
      localStorage.setItem('detective-saeki-minato.speed', '0')
      localStorage.setItem('detective-saeki-minato.slots.v1', JSON.stringify({ version: 1, auto: null, manual: [{ data, label: '表情確認', savedAt: '2026-10-20T00:00:00Z', history: [] }] }))
    }, api.createSaveData(state))
    await page.getByRole('button', { name: 'CONTINUE', exact: true }).click()
    await page.getByRole('button', { name: 'SAVE １', exact: true }).click()
    await page.locator(`[data-node-id="${nodeId}"]`).waitFor()
  }
  const advance = async nodeId => {
    await page.locator('.dialogue-button').click()
    await page.locator(`[data-node-id="${nodeId}"]`).waitFor()
  }
  try {
    await load('p1-coffee', 'P1-01')
    const surprised = await expectExpression('minato', 'surprised')
    const positions = await page.locator('[data-character-id]').evaluateAll(elements => elements.map(el => [el.dataset.characterId, el.className]))
    await advance('p1-coffee-2')
    await expectExpression('mio', 'amused')
    await advance('p1-coffee-3')
    assert.notEqual(await expectExpression('minato', 'smile'), surprised)
    await expectExpression('mio', 'amused')
    assert.deepEqual(await page.locator('[data-character-id]').evaluateAll(elements => elements.map(el => [el.dataset.characterId, el.className])), positions)
    if (process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SAEKI_SCREENSHOT_DIR}/coffee-${width}.png` })
    // 同じ位置の旧形式version2セーブも、表示履歴によらず表情を再現する。
    await load('p1-coffee-3', 'P1-01')
    await expectExpression('minato', 'smile')
    await expectExpression('mio', 'amused')
    await load('p2-segawa-boundary', 'P2-08')
    await expectExpression('segawa', 'skeptical')
    await advance('p2-segawa-boundary-2')
    await advance('p2-segawa-boundary-3')
    await expectExpression('segawa', 'serious')
    assert.deepEqual(await page.locator('[data-character-id]').evaluateAll(elements => elements.map(el => el.dataset.characterId)), ['segawa', 'minato', 'okumura'])
    await expectExpression('minato', 'front-normal')
    await load('p4-siblings-talk-19', 'P4-10')
    await expectExpression('naoto', 'relieved')
    await expectExpression('akari', 'right-sad')
    await expectExpression('minato', 'front-normal')
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})
