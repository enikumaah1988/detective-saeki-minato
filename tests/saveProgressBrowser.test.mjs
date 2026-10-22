import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5413/'
const slotsKey = 'detective-saeki-minato.slots.v1'
const escape = RegExp.escape

test('調査途中・移動直後・進行条件成立後を実操作で保存し、再起動とLOADで復元する', { skip: !path, timeout: 90000 }, async () => {
  const api = await loadRevision(), run = buildPlaythrough(api, true)
  const { chromium } = await import(path), browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const menu = () => page.getByLabel('メニュー', { exact: true })
  const node = () => page.locator('.story').getAttribute('data-node-id')
  const snapshot = () => page.evaluate(() => ({
    node: document.querySelector('.story')?.dataset.nodeId,
    context: document.querySelector('.scene-context')?.textContent,
    background: document.querySelector('.stage')?.dataset.backgroundId,
    characters: [...document.querySelectorAll('[data-character-id]')].map(el => ({ id: el.dataset.characterId, expression: el.dataset.expression })),
    dialogue: document.querySelector('.dialogue .sr-only')?.textContent,
    commands: [...document.querySelectorAll('.command-panel button')].map(el => el.textContent),
  }))
  const apply = async operation => {
    if (operation.action.type === 'advance') {
      await page.locator('.dialogue-button .next').waitFor()
      await page.locator('.dialogue-button').click()
    } else if (operation.map) {
      await page.getByRole('button', { name: `${operation.label}を選択`, exact: true }).click()
      await page.getByRole('button', { name: 'ここへ移動', exact: true }).click()
    } else {
      await page.locator('.command-panel button').filter({ has: page.locator('.command-name', { hasText: new RegExp(`^${escape(operation.label)}$`) }) }).click()
    }
    await page.waitForFunction(id => document.querySelector('.story')?.dataset.nodeId === id, operation.after)
  }
  const save = async () => {
    await menu().click()
    await page.getByRole('button', { name: 'SAVE', exact: true }).click()
    await page.getByRole('dialog', { name: 'セーブしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
    return page.evaluate(key => JSON.parse(localStorage.getItem(key)).manual[0], slotsKey)
  }
  try {
    await page.goto(url)
    await page.evaluate(() => localStorage.setItem('detective-saeki-minato.speed', '0'))
    // 実際の必須経路上で、調査済み情報のある対象一覧、移動先、推理の正解フラグ成立を選ぶ。
    for (const before of ['p2-tenant-list', 'P2-01-map', 'P4-05-Q2-1']) {
      const index = run.operations.findIndex(operation => operation.before === before)
      assert.ok(index >= 0, before)
      const operation = run.operations[index], expected = run.states[index + 1]
      await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify({ version: 1, auto: null, manual: [{ data, label: '開始点', savedAt: '', history: [] }] })), { key: slotsKey, data: api.createSaveData(run.states[index]) })
      await page.reload()
      await page.getByRole('button', { name: 'CONTINUE', exact: true }).click()
      await page.getByRole('button', { name: 'SAVE １', exact: true }).click()
      await apply(operation)
      const screen = await snapshot(), saved = await save()
      assert.deepEqual(saved.data, api.createSaveData(expected), before)
      if (before === 'p2-tenant-list') assert.ok(saved.data.inspectedTargets.includes('p2-tenant-list'))
      if (before === 'P4-05-Q2-1') assert.equal(saved.data.flags['Q2-1-solved'], true)
      await apply(run.operations[index + 1])
      assert.notEqual(await node(), expected.nodeId)
      await menu().click()
      await page.getByRole('button', { name: 'LOAD', exact: true }).click()
      await page.getByRole('dialog', { name: 'LOAD', exact: true }).getByRole('button', { name: 'SAVE １', exact: true }).click()
      await page.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
      assert.deepEqual(await snapshot(), screen, `${before}: LOAD後の画面`)
      const loaded = await save()
      assert.deepEqual(loaded.data, saved.data, `${before}: LOAD後の全進捗`)
      await page.reload()
      await page.getByRole('button', { name: 'CONTINUE', exact: true }).click()
      await page.getByRole('button', { name: 'SAVE １', exact: true }).click()
      assert.deepEqual(await snapshot(), screen, `${before}: 再起動後の画面`)
      await apply(run.operations[index + 1])
      const resumed = await save()
      assert.deepEqual(resumed.data, api.createSaveData(run.states[index + 2]), `${before}: 復帰後の次操作`)
    }
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})
