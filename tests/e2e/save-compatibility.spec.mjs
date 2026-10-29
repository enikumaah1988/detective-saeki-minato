import { readFileSync } from 'node:fs'
import { test, expect } from '@playwright/test'
import { loadCompleted, playCompleted } from '../e01CompletedHarness.mjs'
import { capture, display, press } from './episode-player.mjs'

const fixture = JSON.parse(readFileSync(new URL('../fixtures/save-v2-before-30-scenes.json', import.meta.url), 'utf8'))
const key = 'detective-saeki-minato.slots.v1'
let slots
test.beforeAll(async () => {
  const api = await loadCompleted()
  const state = playCompleted(api).states.find(value => value.nodeId === 'S02-menu')
  const part = { data: api.createSaveData(state), savedAt: fixture.slot.savedAt, label: '第1部限定版', history: [] }
  slots = [fixture.slot, part, { ...part, data: { ...part.data, scenarioId: 'erased-records-30-scenes' }, label: '全30シーン版' }]
})

test('ゲーム内LOADで旧稿・限定版・全編版へ復帰し、保存枠と履歴を保持する', async ({ page }, info) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await press(page, page.getByRole('button', { name: 'NEW GAME', exact: true }))
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S01-opening-prologue-1')
  const openLoad = async () => {
    await press(page, page.getByLabel('メニュー', { exact: true }))
    await press(page, page.getByRole('button', { name: 'LOAD', exact: true }))
  }
  const readRaw = () => page.evaluate(key => localStorage.getItem(key), key)
  for (const [index, slot] of slots.entries()) {
    // Seed only this test's isolated browser storage, never an existing user profile.
    const raw = JSON.stringify({ version: 1, auto: fixture.slot, manual: slots })
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key, raw })
    await openLoad()
    await press(page, page.getByRole('dialog', { name: 'LOAD', exact: true }).getByRole('button', { name: display(`SAVE ${index + 1}`), exact: true }))
    await expect(page.getByRole('dialog', { name: 'ロードしました', exact: true })).toBeVisible()
    expect(await readRaw()).toBe(raw)
    await press(page, page.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }))
    await expect(page.locator('.story')).toHaveAttribute('data-node-id', slot.data.nodeId)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.locator('nav .command-name').first()).toBeVisible()
    expect(await readRaw()).toBe(raw) // No AUTO overwrite when switching scenarios.
    if (index === 0) {
      expect(await page.locator('nav .command-name').allTextContents()).toEqual(fixture.expectedChoices.map(display))
      await capture(page, info, 'legacy-loaded-from-new-game')
    }
    await press(page, page.getByLabel('メニュー', { exact: true }))
    await press(page, page.getByRole('button', { name: 'SAVE', exact: true }))
    await press(page, page.getByRole('dialog', { name: 'セーブしました', exact: true }).getByRole('button', { name: 'OK', exact: true }))
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)
    expect(saved.manual[0].data).toEqual(slot.data)
    expect(saved.manual[0].history).toEqual(slot.history)
    expect(saved.auto).toEqual(fixture.slot)
    // Same-scenario LOAD and a fresh title CONTINUE must also restore the saved session.
    await openLoad()
    await press(page, page.getByRole('dialog', { name: 'LOAD', exact: true }).getByRole('button', { name: 'SAVE １', exact: true }))
    await press(page, page.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }))
    await expect(page.locator('.story')).toHaveAttribute('data-node-id', slot.data.nodeId)
    await page.reload()
    await press(page, page.getByRole('button', { name: 'CONTINUE', exact: true }))
    await press(page, page.getByRole('dialog', { name: 'CONTINUE', exact: true }).getByRole('button', { name: 'SAVE １', exact: true }))
    await expect(page.locator('.story')).toHaveAttribute('data-node-id', slot.data.nodeId)
  }
  // AUTO must also switch back from the full episode to the original scenario.
  const rawAuto = JSON.stringify({ version: 1, auto: fixture.slot, manual: slots })
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key, raw: rawAuto })
  await openLoad()
  await press(page, page.getByRole('dialog', { name: 'LOAD', exact: true }).getByRole('button', { name: 'AUTO', exact: true }))
  await press(page, page.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }))
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', fixture.slot.data.nodeId)
  expect(await readRaw()).toBe(rawAuto)
  // Invalid saved locations must fail without resetting gameplay or rewriting data.
  for (const patch of [{ scenarioId: 'missing-scenario' }, { nodeId: 'missing-node' }, { version: 999 }]) {
    const raw = JSON.stringify({ version: 1, auto: null, manual: [{ ...fixture.slot, data: { ...fixture.slot.data, ...patch } }] })
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key, raw })
    await openLoad()
    await press(page, page.getByRole('dialog', { name: 'LOAD', exact: true }).getByRole('button', { name: 'SAVE １', exact: true }))
    await expect(page.getByRole('dialog', { name: 'LOAD', exact: true }).getByRole('status')).toHaveText('この保存データを読み込めません。')
    expect(await readRaw()).toBe(raw)
    await expect(page.locator('.story')).toHaveAttribute('data-node-id', fixture.slot.data.nodeId)
    await press(page, page.getByRole('dialog', { name: 'LOAD', exact: true }).getByRole('button', { name: '戻る', exact: true }))
    await press(page, page.getByRole('button', { name: 'システムメニューを閉じる', exact: true }))
  }
  await press(page, page.getByLabel('メニュー', { exact: true }))
  await press(page, page.getByRole('button', { name: 'RETURN TO TITLE', exact: true }))
  await press(page, page.getByRole('dialog', { name: 'タイトルに戻りますか？', exact: true }).getByRole('button', { name: 'RETURN TO TITLE', exact: true }))
  await press(page, page.getByRole('button', { name: 'NEW GAME', exact: true }))
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S01-opening-prologue-1')
  expect(errors).toEqual([])
})

test('旧単一SAVEをNEW GAME後にLOADしても原本と履歴を保持する', async ({ page }) => {
  await page.goto('/')
  await press(page, page.getByRole('button', { name: 'NEW GAME', exact: true }))
  const original = JSON.stringify(fixture.slot.data)
  await page.evaluate(({ original, history }) => {
    localStorage.setItem('detective-saeki-minato.save.v1', original)
    const data = JSON.parse(original)
    localStorage.setItem('detective-saeki-minato.history.v1', JSON.stringify({ scenarioId: data.scenarioId, nodeId: data.nodeId, entries: history }))
  }, { original, history: fixture.slot.history })
  await press(page, page.getByLabel('メニュー', { exact: true }))
  await press(page, page.getByRole('button', { name: 'LOAD', exact: true }))
  const migrated = await page.evaluate(key => localStorage.getItem(key), key)
  expect(JSON.parse(migrated).manual[0].data).toEqual(fixture.slot.data)
  expect(JSON.parse(migrated).manual[0].history).toEqual(fixture.slot.history)
  await press(page, page.getByRole('dialog', { name: 'LOAD', exact: true }).getByRole('button', { name: 'SAVE １', exact: true }))
  await press(page, page.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }))
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', fixture.slot.data.nodeId)
  expect(await page.evaluate(() => localStorage.getItem('detective-saeki-minato.save.v1'))).toBe(original)
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(migrated)
})
