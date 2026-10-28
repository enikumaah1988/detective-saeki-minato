import test from 'node:test'
import assert from 'node:assert/strict'
const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = (process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5292/').split('?')[0]
const labels = ['ゆっくり', '標準', '速い', '一括表示']
const speeds = [70, 35, 15, 0]
const slider = page => page.getByRole('slider', { name: 'メッセージスピード', exact: true })
const select = (page, index) => page.getByRole('button', { name: `メッセージスピード：${labels[index]}`, exact: true }).click()
async function title(page) {
  await page.getByRole('button', { name: 'RETURN TO TITLE', exact: true }).click()
  await page.getByRole('dialog', { name: 'タイトルに戻りますか？', exact: true }).getByRole('button', { name: 'RETURN TO TITLE', exact: true }).click()
  await page.getByRole('button', { name: 'SETTINGS', exact: true }).click()
}
for (const [width, height] of [[1920, 1080], [844, 390]]) test(`速度設定の4候補・タイトルと本編の往復・再起動 ${width}`, { skip: !path }, async () => {
  const { chromium } = await import(path), browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width, height } })
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  try {
    await page.goto(url)
    await page.evaluate(() => localStorage.setItem('detective-saeki-minato.speed', 'unknown'))
    await page.reload()
    await page.getByRole('button', { name: 'SETTINGS', exact: true }).click()
    assert.equal(await slider(page).inputValue(), '1')
    for (let index = 0; index < speeds.length; index++) {
      await select(page, index)
      await page.getByRole('button', { name: '戻る', exact: true }).click()
      await page.getByRole('button', { name: 'NEW GAME', exact: true }).click()
      await page.getByLabel('メニュー', { exact: true }).click()
      assert.equal(await slider(page).inputValue(), String(index))
      const next = (index + 1) % speeds.length
      await select(page, next)
      assert.equal(await page.evaluate(() => localStorage.getItem('detective-saeki-minato.speed')), String(speeds[next]))
      await title(page)
      assert.equal(await slider(page).inputValue(), String(next))
      await page.reload()
      await page.getByRole('button', { name: 'SETTINGS', exact: true }).click()
      assert.equal(await slider(page).inputValue(), String(next))
    }
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})

for (const mode of ['read', 'write']) test(`storage ${mode}拒否でも両画面のセッション中速度を保持`, { skip: !path }, async () => {
  const { chromium } = await import(path), browser = await chromium.launch()
  const page = await browser.newPage()
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(mode => {
    if (mode === 'read') Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied') } })
    else Storage.prototype.setItem = () => { throw new Error('denied') }
  }, mode)
  try {
    await page.goto(url)
    await page.getByRole('button', { name: 'SETTINGS', exact: true }).click()
    assert.equal(await slider(page).inputValue(), '1')
    await select(page, 0)
    assert.equal(await slider(page).inputValue(), '0')
    await page.getByRole('button', { name: '戻る', exact: true }).click()
    await page.getByRole('button', { name: 'SETTINGS', exact: true }).click()
    assert.equal(await slider(page).inputValue(), '0')
    await page.getByRole('button', { name: '戻る', exact: true }).click()
    await page.getByRole('button', { name: 'NEW GAME', exact: true }).click()
    await page.getByLabel('メニュー', { exact: true }).click()
    assert.equal(await slider(page).inputValue(), '1')
    await select(page, 2)
    await page.getByRole('button', { name: 'システムメニューを閉じる', exact: true }).click()
    await page.getByLabel('メニュー', { exact: true }).click()
    assert.equal(await slider(page).inputValue(), '2')
    await title(page)
    assert.equal(await slider(page).inputValue(), '1')
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})
