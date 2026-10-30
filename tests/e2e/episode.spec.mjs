import { test, expect } from '@playwright/test'
import { loadEpisode, playEpisode } from '../e01EpisodeHarness.mjs'
import { capture, command, display, press, records, restore, save, start, step } from './episode-player.mjs'

let api
const errors = new WeakMap()
test.beforeEach(({ page }) => { const messages = []; errors.set(page, messages); page.on('pageerror', error => messages.push(error.message)) })
test.afterEach(({ page }) => { expect(errors.get(page)).toEqual([]) })
test.beforeAll(async () => { api = await loadEpisode() })
test('タイトルからS01・必須の聞き込み', async ({ page }, info) => {
  await start(page)
  const route = playEpisode(api)
  let checked = false
  for (const [index, operation] of route.operations.entries()) {
    if (operation.before === 'S01-menu' && !checked) {
      await expect(command(page, '続ける')).toHaveCount(0)
      await capture(page, info, 'S01-required-hearing')
      checked = true
    }
    if (operation.before.startsWith('S02-')) break
    await step(page, operation, route.states[index], api)
  }
  expect(checked).toBe(true)
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S02-intro')
})

for (const bar of [false, true]) test(`全30シーン・誤答再挑戦・保存復帰・BAR${bar ? 'あり' : 'なし'}`, async ({ page }, info) => {
  await start(page)
  // The reducer supplies a route, never browser state. Every operation is a visible UI action.
  const route = playEpisode(api, { bar, wrong: true })
  const visited = new Set(), texts = new Map(), police = new Map(), gates = new Set()
  const questionVisits = new Map()
  let returned = false
  const policeScenes = new Set(['S22', 'S24', 'S25', 'S28'])
  for (const [index, operation] of route.operations.entries()) {
    const state = route.states[index], id = operation.before, scene = id.slice(0, 3)
    visited.add(id)
    if (/^S(?:17|23|27)-question\d$/.test(id)) questionVisits.set(id, (questionVisits.get(id) ?? 0) + 1)
    const gate = { 'S01-menu': ['F_LAST_SEEN', 'F_WORK_SITE', '依頼を受ける'], 'S08-menu': ['F_ROUTE_BEND', '移動'], 'S14-menu': ['F_ALTERNATIVES', '移動'] }[id]
    if (gate) {
      const ready = gate.slice(0, -1).every(flag => state.acquiredInformation.includes(flag))
      await expect(command(page, gate.at(-1))).toHaveCount(ready ? 1 : 0)
      gates.add(`${id}/${ready}`)
    }
    if (id === 'S08-route' && !returned) {
      await press(page, command(page, '戻る'))
      await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S08-menu')
      expect((await save(page)).data.flags.F_ROUTE_SELECTED).not.toBe(true)
      await press(page, command(page, api.visibleChoices(api.scenario.nodes['S08-menu'], state).find(option => option.next === 'S08-route').label))
      await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S08-route')
      returned = true
    }
    if (id === 'S09-menu' && !visited.has('S09-wait')) {
      await press(page, command(page, '移動'))
      await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S09-wait')
      let temporary = api.reduceGameState(api.scenario, state, { type: 'choose', choiceId: 'move' })
      while (temporary.nodeId !== id) {
        const before = temporary.nodeId
        const after = api.reduceGameState(api.scenario, temporary, { type: 'advance' })
        await step(page, { before, after: after.nodeId, action: { type: 'advance' } }, temporary, api)
        temporary = after
      }
      visited.add('S09-wait')
    }
    if (['S08-route', 'S17-question2', 'S27-question3'].includes(id) && !visited.has(`${id}-saved`)) {
      const slot = await save(page)
      expect(slot.data.version).toBe(2)
      expect(slot.data.nodeId).toBe(id)
      expect(slot.data.acquiredInformation).toEqual(state.acquiredInformation)
      const choices = await page.locator('nav .command-name').allTextContents()
      await step(page, operation, state, api)
      await restore(page, id)
      expect(await page.locator('nav .command-name').allTextContents()).toEqual(choices)
      const restored = await save(page)
      expect(restored.data).toEqual(slot.data)
      expect(restored.history).toEqual(slot.history)
      visited.add(`${id}-saved`)
    }
    if (policeScenes.has(scene) && !police.has(scene)) police.set(scene, { data: (await save(page)).data, records: await records(page) })
    if (id === 'S26-intro-2' && !visited.has('S26-history-checked')) {
      await press(page, page.getByLabel('会話履歴を開く', { exact: true }))
      const history = page.getByRole('dialog', { name: '会話履歴', exact: true })
      expect.soft(await history.innerText(), '#237: 履歴に制作注記を表示しない').not.toContain(display('S25の再聴取内容は警察内部の情報'))
      await press(page, history.getByRole('button', { name: '閉じる', exact: true }))
      visited.add('S26-history-checked')
    }
    const nextScene = operation.after.slice(0, 3)
    const text = await step(page, operation, state, api)
    texts.set(id, text)
    if (policeScenes.has(scene) && nextScene !== scene) {
      const after = (await save(page)).data, before = police.get(scene).data
      for (const key of ['flags', 'acquiredInformation', 'heardTopics', 'inspectedTargets']) expect(after[key], `${scene}/${key}`).toEqual(before[key])
      expect(api.selectInvestigationRecords(after, api.scenario.records)).toEqual(api.selectInvestigationRecords(before, api.scenario.records))
      expect(await records(page)).toEqual(police.get(scene).records)
    }
    if (['S08-finish-2', 'S17-question1', 'S26-menu', 'S27-question3', 'S30-menu'].includes(operation.after)) await capture(page, info, operation.after)
  }
  for (let number = 1; number <= 30; number++) expect([...visited].some(id => id.startsWith(`S${String(number).padStart(2, '0')}-`))).toBe(true)
  for (const [scene, count] of [['S17', 3], ['S23', 2], ['S27', 3]]) for (let index = 1; index <= count; index++) {
    expect(visited.has(`${scene}-question${index}-wrong`)).toBe(true)
    expect(visited.has(`${scene}-question${index}-answer`)).toBe(true)
    expect(questionVisits.get(`${scene}-question${index}`)).toBe(2)
  }
  expect(returned).toBe(true)
  expect(visited.has('S09-wait')).toBe(true)
  for (const scene of ['BAR-A', 'BAR-B']) expect([...visited].some(id => id.startsWith(`${scene}-`))).toBe(bar)
  // Independent regression assertions: these must fail before #235/#236/#237 are integrated.
  const order = [...texts.keys()]
  expect.soft(order.filter(id => /^S08-(discovery|finish)/.test(id)), '#236: S08の安全確保→案内→発見').toEqual(['S08-discovery', 'S08-discovery-1', 'S08-finish-1', 'S08-finish', 'S08-finish-2', 'S08-finish-3'])
  expect.soft(order.filter(id => /^S27-finish/.test(id)), '#235: S27の電話を1回にする').toEqual(['S27-finish-2', 'S27-finish-3', 'S27-finish-4', 'S27-finish-5'])
  expect([...texts.values()].filter(text => text === '（奥村に電話）')).toHaveLength(1)
  expect.soft([...texts].filter(([, text]) => text.includes(display('S25の再聴取内容は警察内部の情報'))), '#237: S26制作注記を表示しない').toEqual([])
  for (const id of ['S01-menu', 'S08-menu', 'S14-menu']) for (const ready of [false, true]) expect(gates.has(`${id}/${ready}`)).toBe(true)
  await expect(page.getByText('Episode 01「消された記録」完', { exact: true })).toBeVisible()
  await capture(page, info, 'S30-ending')
})
