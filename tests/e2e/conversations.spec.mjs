import { readFileSync } from 'node:fs'
import { test, expect } from '@playwright/test'
import { command, press, capture, save, restore, start } from './episode-player.mjs'

const fixture = JSON.parse(readFileSync(new URL('../fixtures/save-v2-before-conversations.json', import.meta.url), 'utf8'))
const key = 'detective-saeki-minato.slots.v1'

test('本編の話す・人物別の話題・戻る・旧会話SAVE復元を確定仕様と照合する', async ({ page }, info) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await start(page)
  const expectLabels = values => expect(page.locator('nav .command-name')).toHaveText(values)
  const at = id => expect(page.locator('.story')).toHaveAttribute('data-node-id', id)
  for (const [id, people] of Object.entries({
    'S02-topic': { '相澤　澪': ['会社の窓口'] },
    'S12-talk': { '宮原　文雄': ['会社の確認手続き'], '黒田　征司': ['黒田の担当'] },
    'S21-talk': { '奥村　修一': ['新しい資料の扱い'], '瀬川　亮介': ['当時の調査'] },
  })) {
    const data = fixture.saves.find(save => save.nodeId === id)
    expect(data).toBeTruthy()
    const raw = JSON.stringify({ version: 1, auto: null, manual: [{ data, history: [], savedAt: '2026-10-30T00:00:00.000Z', label: '会話復旧前の保存' }] })
    // Only Playwright's isolated storage is populated; no user SAVE is accessed.
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key, raw })
    await press(page, page.getByLabel('メニュー', { exact: true }))
    await press(page, page.getByRole('button', { name: 'LOAD', exact: true }))
    await press(page, page.getByRole('dialog', { name: 'LOAD', exact: true }).getByRole('button', { name: 'SAVE １', exact: true }))
    await press(page, page.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }))
    await at(id)
    expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(raw)
    await expectLabels([...Object.keys(people), '戻る'])
    await capture(page, info, `${id}-people`)
    await press(page, command(page, '戻る'))
    const menu = `${id.slice(0, 3)}-menu`
    await at(menu)
    await expect(command(page, '話す')).toBeVisible()
    await expect(command(page, '聞く')).toHaveCount(0)
    await press(page, command(page, '話す'))
    await at(id)
    for (const [person, topics] of Object.entries(people)) {
      await press(page, command(page, person))
      await expectLabels([...topics, '戻る'])
      await capture(page, info, `${id}-${person}-topics`)
      const topicsId = await page.locator('.story').getAttribute('data-node-id')
      const slot = await save(page)
      expect(slot.data.heardTopics).toEqual(data.heardTopics)
      await press(page, command(page, '戻る'))
      await at(id)
      await restore(page, topicsId)
      await expectLabels([...topics, '戻る'])
      await press(page, command(page, topics[0]))
      await expect(page.locator('.story')).not.toHaveAttribute('data-node-id', topicsId)
      for (let count = 0; await page.locator('.story').getAttribute('data-node-id') !== topicsId; count++) {
        expect(count).toBeLessThan(30)
        const before = await page.locator('.story').getAttribute('data-node-id')
        const button = page.getByRole('button', { name: '会話を次へ進める', exact: true })
        await expect(page.locator('.next')).toBeVisible()
        const previous = await button.getAttribute('data-page')
        await press(page, button)
        await page.waitForFunction(({ before, previous }) => document.querySelector('.story')?.dataset.nodeId !== before
          || document.querySelector('.dialogue-button')?.getAttribute('data-page') !== previous, { before, previous })
      }
      await expectLabels([...topics, '戻る'])
      await press(page, command(page, '戻る'))
      await at(id)
    }
  }
  expect(errors).toEqual([])
})

