import { test, expect } from '@playwright/test'
import { start, press, command, capture, save, restore } from './episode-player.mjs'

// Expected story order is specified here, independently of the generated route.
test('NEW GAMEの導入・作品扉・澪との日常操作・ノック後の来訪を画面で確認する', async ({ page }, info) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const current = () => page.locator('.story').getAttribute('data-node-id')
  const advance = async () => {
    await expect(page.getByRole('button', { name: '会話を次へ進める', exact: true })).toBeVisible()
    const before = await current()
    for (let count = 0; count < 16 && await current() === before; count++) {
      const button = page.getByRole('button', { name: '会話を次へ進める', exact: true })
      await expect(page.locator('.next')).toBeVisible()
      const previous = await button.getAttribute('data-page')
      await press(page, button)
      await page.waitForFunction(({ before, previous }) => document.querySelector('.story')?.dataset.nodeId !== before
        || document.querySelector('.dialogue-button')?.getAttribute('data-page') !== previous, { before, previous })
    }
    expect(await current()).not.toBe(before)
  }
  await start(page)
  for (let number = 1; number <= 4; number++) {
    await expect(page.locator('.story')).toHaveAttribute('data-node-id', `S01-opening-prologue-${number}`)
    await expect(page.locator('.character-image')).toHaveCount(0)
    await expect(page.getByRole('button', { name: '調査記録', exact: true })).toBeHidden()
    await advance()
  }
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S01-opening-cover')
  await expect(page.locator('.chapter-heading')).toContainText('消された記録')
  await expect(page.locator('.chapter-heading')).toContainText('消えた男')
  await capture(page, info, 'opening-title-cover')
  await press(page, page.locator('.stage-input-area'))
  await advance()
  await advance()
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S01-opening-menu')
  await expect(page.locator('.character-image')).toHaveCount(2)
  expect(await page.locator('nav .command-name').allTextContents()).toEqual(['話す', '調べる'])
  await capture(page, info, 'daily-before-akari')
  await press(page, command(page, '話す'))
  await expect(page.getByRole('navigation', { name: '相手を選ぶ' })).toBeVisible()
  await press(page, command(page, '澪'))
  await press(page, command(page, '今日の予定'))
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S01-opening-schedule')
  for (let count = 0; await current() !== 'S01-opening-topics'; count++) { expect(count).toBeLessThan(10); await advance() }
  await press(page, command(page, '戻る'))
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S01-opening-people')
  await press(page, command(page, '戻る'))
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S01-opening-menu')
  await press(page, command(page, '調べる'))
  await press(page, command(page, '窓'))
  await advance()
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S01-opening-targets')
  await press(page, command(page, '戻る'))
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S01-opening-menu')
  const saved = await save(page)
  expect(saved.data.acquiredInformation).toEqual([])
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('detective-saeki-minato.slots.v1')).auto)).toBeNull()
  const coffee = async () => {
    await press(page, command(page, '話す'))
    await press(page, command(page, '澪'))
    await press(page, command(page, 'コーヒー'))
  }
  await coffee()
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S01-intro')
  await restore(page, 'S01-opening-menu')
  expect((await save(page)).data).toEqual(saved.data)
  await coffee()
  await expect(page.locator('.dialogue .sr-only')).toHaveText('佐伯さん、コーヒーです。今日は少し深煎りにしました')
  for (let count = 0; await current() !== 'S01-intro-7'; count++) {
    expect(count).toBeLessThan(10)
    await expect(page.locator('.character-image')).toHaveCount(2)
    await advance()
  }
  await expect(page.locator('.dialogue .sr-only')).toHaveText('（ノック）')
  await advance()
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S01-intro-8')
  await expect(page.locator('.character-image')).toHaveCount(3)
  await capture(page, info, 'akari-after-knock')
  expect(errors).toEqual([])
})
