import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'
import { mkdir } from 'node:fs/promises'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = (process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5194/').split('?')[0]

// Chromiumの横向きタッチエミュレーション。Safari/Android実機の保証とは区別する。
for (const [width, height] of [[667, 375], [844, 390], [915, 412]]) {
  test(`スマホ横画面 ${width}×${height}: HUD・会話・保存・履歴・選択肢・地図をタップ`, { skip: !path, timeout: 60000 }, async () => {
    const api = await loadRevision(), run = buildPlaythrough(api, true)
    const { chromium } = await import(path)
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width, height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
    const errors = []; page.on('pageerror', error => errors.push(error.message))
    const button = name => page.getByRole('button', { name, exact: true })
    const checkTarget = async locator => {
      await locator.waitFor({ state: 'visible' })
      const surface = await locator.evaluate(element => {
        const panel = element.closest('dialog, .travel-map, .story') ?? element
        const rect = panel.getBoundingClientRect()
        return { panel: panel.className, x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom,
          fits: rect.left >= -1 && rect.top >= -1 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1 }
      })
      assert.ok(surface.fits, JSON.stringify(surface))
      await locator.scrollIntoViewIfNeeded()
      const result = await locator.evaluate(element => {
        const rect = element.getBoundingClientRect()
        const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
        return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height,
          inViewport: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1,
          hit: hit === element || element.contains(hit) }
      })
      assert.ok(result.inViewport && result.hit && result.width > 0 && result.height > 0, JSON.stringify(result))
    }
    const tap = async locator => { await checkTarget(locator); await locator.tap() }
    const load = async (state, history = []) => {
      await page.goto(url)
      await page.evaluate(({ data, history }) => {
        localStorage.clear()
        localStorage.setItem('detective-saeki-minato.speed', '0')
        localStorage.setItem('detective-saeki-minato.slots.v1', JSON.stringify({ version: 1, auto: null,
          manual: [{ data, history, label: '横画面検証', savedAt: '2026-10-21T00:00:00Z' }] }))
      }, { data: api.createSaveData(state), history })
      await page.reload()
      await tap(button('CONTINUE'))
      await tap(button('SAVE １'))
      await page.locator('.story').waitFor()
      await page.evaluate(() => document.fonts.ready)
    }
    try {
      const initial = { ...api.createInitialState(api.scenario), nodeId: 'P1-01-intro' }
      await load(initial, Array.from({ length: 30 }, (_, index) => ({ speaker: '湊', text: `記録${index}。`.repeat(15), nodeId: initial.nodeId })))
      await page.locator('.dialogue-button .next').waitFor()
      const originalNode = await page.locator('.story').getAttribute('data-node-id')
      await tap(button('会話履歴を開く'))
      const history = page.getByRole('dialog', { name: '会話履歴', exact: true })
      await history.waitFor()
      await tap(history.getByRole('button', { name: '閉じる', exact: true }))
      assert.equal(await page.locator('.story').getAttribute('data-node-id'), originalNode)
      await tap(page.getByLabel('メニュー', { exact: true }))
      const menu = page.getByRole('dialog', { name: 'システムメニュー', exact: true })
      if (process.env.SAEKI_MOBILE_EVIDENCE) {
        await mkdir(process.env.SAEKI_MOBILE_EVIDENCE, { recursive: true })
        await page.screenshot({ path: `${process.env.SAEKI_MOBILE_EVIDENCE}/menu-${width}.png` })
      }
      await tap(menu.getByRole('button', { name: 'SAVE', exact: true }))
      await tap(page.getByRole('dialog', { name: 'セーブしました', exact: true }).getByRole('button', { name: 'OK', exact: true }))
      assert.equal(await page.locator('.story').getAttribute('data-node-id'), originalNode)
      await tap(page.getByLabel('メニュー', { exact: true }))
      await tap(menu.getByRole('button', { name: 'LOAD', exact: true }))
      await tap(page.getByRole('dialog', { name: 'LOAD', exact: true }).getByRole('button', { name: 'SAVE １', exact: true }))
      await tap(page.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }))
      assert.equal(await page.locator('.story').getAttribute('data-node-id'), originalNode)
      await tap(page.getByRole('button', { name: '調査記録', exact: true }))
      const records = page.getByRole('dialog', { name: '調査記録', exact: true })
      await records.waitFor()
      await tap(records.getByRole('button', { name: '調査記録を閉じる', exact: true }))
      await load(run.checkpoints.find(point => point.phase === 'P1-01').state)
      const toolbar = await page.locator('.toolbar-actions').boundingBox(), context = await page.locator('.scene-context').boundingBox()
      assert.ok(toolbar.x + toolbar.width <= context.x + 1, 'HUD操作名と場所日時が重ならない')
      const commands = page.locator('.command-panel button')
      for (let index = 0; index < await commands.count(); index++) await checkTarget(commands.nth(index))
      await tap(button('見る'))
      await tap(page.locator('.command-panel button').filter({ has: page.locator('.command-name', { hasText: /^帳簿$/ }) }))
      await page.locator('.dialogue-button').waitFor()
      await load({ ...run.checkpoints.find(point => point.phase === 'P2-01').state, nodeId: 'P2-01-map' })
      await page.locator('.travel-map').waitFor()
      await tap(button('東成ビルサービスを選択'))
      await tap(button('ここへ移動'))
      await page.waitForFunction(() => document.querySelector('.story')?.dataset.nodeId !== 'P2-01-map')
      assert.deepEqual(errors, [])
    } finally { await browser.close() }
  })
}
