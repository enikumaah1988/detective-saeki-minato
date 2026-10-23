import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5432/'
const key = 'detective-saeki-minato.slots.v1'

test('実際の部境界で履歴表示を切り替え、保存配列を維持して別部へLOADする', { skip: !path, timeout: 60000 }, async () => {
  const api = await loadRevision(), run = buildPlaythrough(api, true)
  const before = run.states.find(state => state.nodeId === 'P1-08-REPORT-ending-3')
  assert.ok(before)
  const entries = [
    { speaker: '', text: 'テスト：プロローグの記録', nodeId: 'episode-prologue-1' },
    { speaker: '湊', text: 'テスト：第１部の記録', nodeId: 'P1-01-intro' },
    { speaker: '澪', text: 'テスト：旧保存の第１部', nodeId: 'opening-1' },
    { speaker: '湊', text: 'テスト：P２接頭辞だが第１部', nodeId: 'P2-01-intro' },
    { speaker: '湊', text: 'テスト：第２部の記録', nodeId: 'P2-07-intro' },
    { speaker: '', text: 'テスト：所属不明の記録', nodeId: 'unknown-old-node' },
  ]
  const { chromium } = await import(path), browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  const node = () => page.locator('.story').getAttribute('data-node-id')
  const opener = () => page.getByLabel('会話履歴を開く', { exact: true })
  const checkHistory = async expected => {
    const current = await node()
    await opener().click()
    const dialog = page.getByRole('dialog', { name: '会話履歴', exact: true })
    assert.deepEqual(await dialog.locator('article p').allTextContents(), expected)
    await dialog.getByRole('button', { name: '閉じる', exact: true }).press('Escape')
    assert.equal(await node(), current)
    await page.waitForFunction(() => document.activeElement === document.querySelector('.history-entry'))
    assert.equal(await opener().evaluate(button => button === document.activeElement), true)
  }
  const save = async () => {
    await page.getByLabel('メニュー', { exact: true }).click()
    await page.getByRole('button', { name: 'SAVE', exact: true }).click()
    await page.getByRole('dialog', { name: 'セーブしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
    return page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)
  }
  try {
    await page.goto(url)
    await page.evaluate(({ key, data, history }) => {
      localStorage.clear()
      localStorage.setItem('detective-saeki-minato.speed', '0')
      localStorage.setItem(key, JSON.stringify({ version: 1, auto: null, manual: [{ data, history, label: '部境界', savedAt: '' }] }))
    }, { key, data: api.createSaveData(before), history: entries })
    await page.reload()
    await page.getByRole('button', { name: 'CONTINUE', exact: true }).click()
    await page.getByRole('button', { name: 'SAVE １', exact: true }).click()
    await page.locator('.dialogue-button .next').waitFor()
    const part1 = entries.slice(1, 4).map(entry => entry.text)
    await checkHistory(part1)
    assert.deepEqual((await save()).manual[0].history, entries)
    for (const next of ['P1-08-REPORT-end', 'P2-07-start', 'P2-07-intro']) {
      if (api.scenario.nodes[await node()].illustration) await page.locator('.stage-input-area').click()
      else {
        await page.locator('.dialogue-button .next').waitFor()
        await page.locator('.dialogue-button').click()
      }
      await page.waitForFunction(id => document.querySelector('.story')?.dataset.nodeId === id, next)
    }
    await checkHistory([entries[4].text])
    const slots = await save()
    assert.deepEqual(slots.manual[0].history.slice(0, entries.length), entries, '別部へ移っても保存済み履歴を削除しない')
    assert.deepEqual(slots.auto.history.slice(0, entries.length), entries, 'AUTOにも表示前の全履歴を保持する')
    assert.equal(slots.manual[0].data.version, 2)
    await page.getByLabel('メニュー', { exact: true }).click()
    await page.getByRole('button', { name: 'LOAD', exact: true }).click()
    await page.getByRole('dialog', { name: 'LOAD', exact: true }).getByRole('button', { name: 'SAVE ２', exact: true }).click()
    await page.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
    assert.equal(await node(), before.nodeId)
    await checkHistory(part1)
    assert.deepEqual((await save()).manual[0].history, entries, '別部のセーブをロード後も履歴全件を再保存する')
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})
