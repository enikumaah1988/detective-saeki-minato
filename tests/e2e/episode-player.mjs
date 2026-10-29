import { expect, test } from '@playwright/test'

export const display = text => text.replace(/Episode [0-9]{2}\b|[0-9]/g, token => token.startsWith('Episode ') ? token : String.fromCharCode(token.charCodeAt(0) + 0xfee0))
export const nodeId = page => page.locator('.story').getAttribute('data-node-id')
export async function press(page, target) {
  await expect(target).toBeVisible()
  if (test.info().project.use.hasTouch) await target.tap()
  else await target.click()
}
export async function start(page) {
  await page.goto('/')
  await press(page, page.getByRole('button', { name: 'NEW GAME', exact: true }))
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S01-opening-prologue-1')
  await press(page, page.getByLabel('メニュー', { exact: true }))
  await press(page, page.getByRole('button', { name: 'メッセージスピード：一括表示', exact: true }))
  await press(page, page.getByRole('button', { name: 'システムメニューを閉じる' }))
}
export function command(page, label) {
  return page.getByRole('navigation').getByRole('button').filter({ has: page.locator('.command-name').filter({ hasText: new RegExp(`^${display(label).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }) })
}
export async function step(page, operation, state, api) {
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', operation.before)
  const node = api.scenario.nodes[operation.before]
  let text = ''
  if (operation.action.type === 'advance') {
    if (node.illustration) {
      await press(page, page.locator('.stage-input-area'))
      await expect(page.locator('.story')).toHaveAttribute('data-node-id', operation.after)
      return text
    }
    const acquisition = page.getByRole('dialog').filter({ hasText: '持ち物に加えます。' })
    if (await acquisition.isVisible()) await press(page, acquisition.getByRole('button', { name: 'OK', exact: true }))
    else {
      for (let count = 0; count < 20; count++) {
        await expect(page.locator('.next')).toBeVisible()
        const dialogue = page.getByRole('button', { name: '会話を次へ進める', exact: true })
        const previous = await dialogue.getAttribute('data-page')
        text += await page.locator('.dialogue .sr-only').innerText()
        await press(page, dialogue)
        await page.waitForFunction(({ before, previous }) => document.querySelector('.story')?.getAttribute('data-node-id') !== before || document.querySelector('.dialogue-button')?.getAttribute('data-page') !== previous, { before: operation.before, previous })
        if (await nodeId(page) !== operation.before) break
      }
      expect(text.replace(/\s/g, '')).toBe(display(node.text).replace(/\s/g, ''))
    }
  } else {
    const options = api.visibleChoices(node, state)
    const labels = await page.locator('nav .command-name').allTextContents()
    expect(labels).toEqual(options.map(option => display(option.label)))
    const selected = options.find(option => option.id === operation.action.choiceId)
    await press(page, command(page, selected.label))
  }
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', operation.after)
  return text
}
export async function save(page) {
  await press(page, page.getByLabel('メニュー', { exact: true }))
  await press(page, page.getByRole('button', { name: 'SAVE', exact: true }))
  await press(page, page.getByRole('dialog', { name: 'セーブしました', exact: true }).getByRole('button', { name: 'OK', exact: true }))
  return page.evaluate(() => JSON.parse(localStorage.getItem('detective-saeki-minato.slots.v1')).manual[0])
}
export async function restore(page, id) {
  await press(page, page.getByLabel('メニュー', { exact: true }))
  await press(page, page.getByRole('button', { name: 'LOAD', exact: true }))
  await press(page, page.getByRole('button', { name: 'SAVE １', exact: true }))
  await press(page, page.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }))
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', id)
}
export async function capture(page, info, name) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  const dialogue = page.locator('.dialogue-button .dialogue')
  if (await dialogue.count()) expect(await dialogue.evaluate(element => element.scrollHeight <= element.clientHeight + 1 && element.scrollWidth <= element.clientWidth + 1)).toBe(true)
  const target = page.locator('nav button:visible, .dialogue-button:visible').first()
  if (await target.count()) {
    expect(await target.evaluate(element => {
      const box = element.getBoundingClientRect()
      const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
      return box.width > 0 && box.height > 0 && box.x >= 0 && box.right <= innerWidth + 1 && box.y >= 0 && box.bottom <= innerHeight + 1 && (hit === element || element.contains(hit))
    })).toBe(true)
  }
  await page.screenshot({ path: info.outputPath(`${name}.png`) })
  await info.attach(name, { path: info.outputPath(`${name}.png`), contentType: 'image/png' })
}

export async function records(page) {
  await press(page, page.getByRole('button', { name: '調査記録', exact: true }))
  const result = {}
  for (const category of ['人物', '証拠', '出来事', '持ち物']) {
    await press(page, page.getByRole('tab', { name: category, exact: true }))
    result[category] = []
    const list = page.getByRole('region', { name: `${category}の一覧`, exact: true })
    await expect(list).toBeVisible()
    const entries = list.getByRole('button')
    for (let index = 0; index < await entries.count(); index++) {
      await press(page, entries.nth(index))
      result[category].push(await page.getByRole('region', { name: '選択した記録の詳細', exact: true }).innerText())
    }
  }
  await press(page, page.getByRole('button', { name: '調査記録を閉じる', exact: true }))
  expect(Object.values(result).flat().length).toBeGreaterThan(0)
  return result
}
