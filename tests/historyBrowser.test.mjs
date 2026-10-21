import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision } from './revisionHarness.mjs'
import { displayText } from '../src/features/story/displayText.ts'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5191/'
for (const [width, height] of [[1920, 1080], [1366, 768]]) test(`保存履歴の地の文は本文のみ・話者名維持・開閉で進行保持 ${width}`, { skip: !path }, async () => {
  const api = await loadRevision(), { chromium } = await import(path)
  const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width, height } })
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  const entries = [
    { speaker: '', text: '雨の音だけが聞こえた。', nodeId: 'P1-01-intro' },
    { speaker: '湊', text: '話を聞かせてください。', nodeId: 'P1-01-intro' },
    { speaker: '湊（心の声）', text: 'まだ何か隠している。', nodeId: 'P1-01-intro' },
  ]
  try {
    await page.route(/\/src\/data\/scenario\/episode1Part1\.ts(?:\?|$)/, async route => {
      const response = await route.fetch()
      await route.fulfill({ response, body: `${await response.text()}\nepisode1Part1.nodes['P1-01-intro'].text = ${JSON.stringify('雨は窓を叩き続けていた。'.repeat(80))};` })
    })
    await page.goto(url)
    const load = async history => {
      await page.evaluate(({ data, history }) => {
        localStorage.clear()
        localStorage.setItem('detective-saeki-minato.speed', '0')
        localStorage.setItem('detective-saeki-minato.slots.v1', JSON.stringify({ version: 1, auto: null, manual: [{ data, label: '既存保存履歴', savedAt: '2026-10-20T00:00:00Z', history }] }))
      }, { data: api.createSaveData({ ...api.createInitialState(api.scenario), nodeId: 'P1-01-intro' }), history })
      await page.reload()
      await page.getByRole('button', { name: 'CONTINUE', exact: true }).click()
      await page.getByRole('button', { name: 'SAVE １', exact: true }).click()
      await page.locator('.dialogue-button .next').waitFor()
    }
    await load(entries)
    const dialogue = page.locator('.story-content .dialogue-button')
    assert.ok(Number(await dialogue.getAttribute('data-pages')) > 1)
    await dialogue.click()
    await dialogue.locator('.next').waitFor()
    const before = await dialogue.textContent()
    const node = await page.locator('.story').getAttribute('data-node-id')
    await page.getByLabel('会話履歴を開く', { exact: true }).click()
    const history = page.getByRole('dialog', { name: '会話履歴', exact: true })
    assert.equal(await history.locator('article').count(), 3)
    assert.equal(await history.locator('article').first().locator('strong').count(), 0)
    assert.deepEqual(await history.locator('article p').allTextContents(), entries.map(entry => displayText(entry.text)))
    assert.deepEqual(await history.locator('article strong').allTextContents(), ['湊', '湊（心の声）'])
    assert.doesNotMatch(await history.textContent(), /地の文・心の声/)
    await history.getByRole('button', { name: '閉じる', exact: true }).click()
    assert.equal(await page.locator('.story').getAttribute('data-node-id'), node)
    assert.equal(await dialogue.textContent(), before)
    await page.getByLabel('会話履歴を開く', { exact: true }).click()
    assert.equal(await history.locator('article').count(), 3)
    await history.getByRole('button', { name: '閉じる', exact: true }).click()
    await load([])
    await page.getByLabel('会話履歴を開く', { exact: true }).click()
    assert.equal(await history.locator('article').count(), 0)
    assert.equal(await history.locator('.history-list p').textContent(), '会話履歴はまだありません。')
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})
