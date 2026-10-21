import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5196/'
for (const [width, height] of [[1920, 1080], [1366, 768]]) test(`会社5背景の表示・ロビーから受付・執務室から一覧への復帰 ${width}`, { skip: !path }, async () => {
  const api = await loadRevision(), run = buildPlaythrough(api, true)
  const { chromium } = await import(path)
  const browser = await chromium.launch(process.env.SAEKI_BROWSER_PATH ? { executablePath: process.env.SAEKI_BROWSER_PATH } : {})
  const page = await browser.newPage({ viewport: { width, height } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  try {
    const before = run.checkpoints.find(point => point.phase === 'P2-02-EXT').state
    const load = async nodeId => {
      await page.goto(url)
      await page.evaluate(data => {
        localStorage.clear()
        localStorage.setItem('detective-saeki-minato.speed', '0')
        localStorage.setItem('detective-saeki-minato.slots.v1', JSON.stringify({ version: 1, auto: null, manual: [{ data, label: '会社背景検証', savedAt: '2026-10-19T00:00:00Z', history: [] }] }))
      }, api.createSaveData({ ...before, nodeId }))
      await page.reload()
      await page.getByRole('button', { name: 'CONTINUE', exact: true }).click()
      await page.getByRole('button', { name: 'SAVE １', exact: true }).click()
    }
    const verify = async background => {
      await page.locator(`.stage[data-background-id="${background}"]`).waitFor()
      await page.waitForFunction(() => { const image = document.querySelector('.background-image'); return image?.complete && image.naturalWidth === 1920 && image.naturalHeight === 1080 })
      assert.equal(await page.locator('.background-label').count(), 0)
      const source = await page.locator('.background-image').getAttribute('src')
      const response = await page.request.get(new URL(source, url).href)
      assert.equal(response.ok(), true)
      const hash = bytes => createHash('sha256').update(bytes).digest('hex')
      assert.equal(hash(await response.body()), hash(readFileSync(new URL(`../src/assets/backgrounds/${background}.png`, import.meta.url))), `${background}: 今回制作した素材を配信する`)
    }
    const advanceNode = async () => {
      const current = await page.locator('.story').getAttribute('data-node-id')
      for (let count = 0; count < 12 && await page.locator('.story').getAttribute('data-node-id') === current; count++) await page.locator('.dialogue-button').click()
      assert.notEqual(await page.locator('.story').getAttribute('data-node-id'), current)
    }
    if (process.env.SAEKI_COMPANY_EVIDENCE) await mkdir(process.env.SAEKI_COMPANY_EVIDENCE, { recursive: true })
    for (const [nodeId, background] of [['P2-02-EXT-intro', 'company-exterior'], ['P2-02-LOBBY-intro', 'company-lobby'], ['P2-02-intro-2', 'company-reception'], ['P2-03-intro', 'company-lounge'], ['p2-reception-exists-2', 'company-office']]) {
      await load(nodeId)
      await verify(background)
      if (process.env.SAEKI_COMPANY_EVIDENCE) await page.screenshot({ path: `${process.env.SAEKI_COMPANY_EVIDENCE}/${background}-${width}.png` })
      if (background === 'company-lobby') { await advanceNode(); assert.equal(await page.locator('.story').getAttribute('data-node-id'), 'P2-02-LOBBY-menu') }
      if (background === 'company-office') { await advanceNode(); await verify('company-reception'); assert.equal(await page.locator('.story').getAttribute('data-node-id'), 'P2-02-targets') }
    }
    const choose = async label => {
      const current = await page.locator('.story').getAttribute('data-node-id')
      await page.locator('.command-panel button').filter({ has: page.locator('.command-name', { hasText: new RegExp('^' + label + String.fromCharCode(36)) }) }).click()
      await page.waitForFunction(id => document.querySelector('.story')?.getAttribute('data-node-id') !== id, current)
    }
    const read = async () => { for (let n = 0; n < 25 && await page.locator('.dialogue-button').count(); n++) await advanceNode() }
    await load('P2-02-LOBBY-menu')
    await page.getByRole('button', { name: 'タバコを吸う', exact: true }).click()
    for (let n = 0; n < 12 && !/テナント一覧/.test(await page.locator('.smoking-overlay').textContent()); n++) await page.locator('.smoking-overlay .dialogue-button').click()
    assert.match(await page.locator('.smoking-overlay').textContent(), /テナント一覧/)
    for (let n = 0; n < 12 && await page.locator('.smoking-overlay').count(); n++) await page.locator('.smoking-overlay .dialogue-button').click()
    await choose('移動')
    assert.equal(await page.locator('.command-name', { hasText: '１２Fに移動' }).count(), 0)
    await choose('戻る'); await choose('調べる'); await choose('テナント一覧'); await read(); await choose('戻る')
    await choose('移動'); await choose('１２Fに移動'); await read()
    assert.equal(await page.locator('.story').getAttribute('data-node-id'), 'P2-02-menu')
    await choose('移動'); await choose('１Fに移動')
    assert.equal(await page.locator('.story').getAttribute('data-node-id'), 'P2-02-LOBBY-menu')
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})
