import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, readdir } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'

const playwright = process.env.SAEKI_PLAYWRIGHT_PATH
const required = process.env.SAEKI_DISTRIBUTION_REQUIRED === '1'
const root = resolve('dist')
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }

test('配布dist: 静的HTTP・素材・本番タイトル・UI保存と再読込復帰', { skip: !playwright && !required, timeout: 120_000 }, async () => {
  assert.ok(playwright, 'SAEKI_PLAYWRIGHT_PATHに外部Playwrightモジュールを指定してください')
  await readFile(resolve(root, 'index.html')) // 未ビルドをスキップで隠さない。
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
      const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname))
      if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return }
      const body = await readFile(file)
      response.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' }).end(body)
    } catch { response.writeHead(404).end() }
  })
  let browser
  try {
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
    const url = `http://127.0.0.1:${server.address().port}/`
    // 全配布画像・フォントをHTTPで取得し、HTMLへの誤フォールバックやLFSポインターを検出。
    const assets = await readdir(resolve(root, 'assets'))
    for (const name of assets.filter(name => /\.(png|webp|jpg|svg|woff2)$/.test(name))) {
      const response = await fetch(url + 'assets/' + name)
      assert.equal(response.status, 200, name)
      assert.equal(response.headers.get('content-type'), mime[extname(name)], name)
      const body = Buffer.from(await response.arrayBuffer())
      assert.ok(body.length > 100, name)
      assert.ok(!body.subarray(0, 80).toString().includes('git-lfs.github.com/spec'), name)
      if (name.endsWith('.woff2')) assert.equal(body.subarray(0, 4).toString(), 'wOF2', name)
      if (name.endsWith('.png')) assert.equal(body.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', name)
      if (name.endsWith('.jpg')) assert.equal(body.subarray(0, 3).toString('hex'), 'ffd8ff', name)
      if (name.endsWith('.webp')) assert.equal(body.subarray(8, 12).toString(), 'WEBP', name)
      if (name.endsWith('.svg')) assert.match(body.toString(), /<svg[\s>]/, name)
    }
    assert.ok(assets.some(name => name.endsWith('.woff2')), '同梱フォントが必要')
    assert.ok(assets.some(name => name.endsWith('.png')), '配布画像が必要')
    const { chromium } = await import(playwright)
    browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('requestfailed', request => errors.push(`${request.failure()?.errorText} ${request.url()}`))
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`) })
    await page.goto(url + '?dev=1')
    await page.getByRole('region', { name: 'タイトル画面', exact: true }).waitFor()
    await page.waitForFunction(() => { const image = document.querySelector('.title-screen-background'); return image?.complete && image.naturalWidth > 0 })
    assert.equal(await page.locator('.scene-selector, .dev-label').count(), 0)
    await page.getByRole('button', { name: 'NEW GAME', exact: true }).click()
    await page.locator('[data-node-id="S01-intro"]').waitFor()
    await page.getByLabel('メニュー', { exact: true }).click()
    await page.getByRole('button', { name: 'メッセージスピード：一括表示', exact: true }).click()
    await page.getByLabel('BGM音量', { exact: true }).fill('37')
    await page.getByRole('button', { name: 'システムメニューを閉じる', exact: true }).click()
    // 実データをUIで読み進め、背景と人物がそろう最初の会話で保存する。
    for (let step = 0; step < 100 && (step === 0 || !await page.locator('.background-image, .character-image').evaluateAll(images => images.some(image => image.classList.contains('background-image')) && images.some(image => image.classList.contains('character-image')))); step++) {
      if (await page.locator('.chapter-heading').count()) await page.keyboard.press('Enter')
      else {
        await page.locator('.dialogue-button .next').waitFor()
        await page.locator('.dialogue-button').click()
      }
    }
    await page.waitForFunction(() => ['.background-image', '.character-image'].every(selector => {
      const image = document.querySelector(selector)
      return image?.complete && image.naturalWidth > 0
    }))
    const nodeId = await page.locator('.story').getAttribute('data-node-id')
    await page.getByLabel('メニュー', { exact: true }).click()
    await page.getByRole('button', { name: 'SAVE', exact: true }).click()
    await page.getByRole('dialog', { name: 'セーブしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
    const saved = await page.evaluate(() => localStorage.getItem('detective-saeki-minato.slots.v1'))
    assert.equal(JSON.parse(saved).manual[0].data.nodeId, nodeId)
    assert.ok(JSON.parse(saved).manual[0].history.length > 0)
    await page.reload()
    await page.getByRole('button', { name: 'CONTINUE', exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'SAVE １', exact: true }).click()
    await page.locator(`[data-node-id="${nodeId}"]`).waitFor()
    assert.equal(await page.evaluate(() => localStorage.getItem('detective-saeki-minato.slots.v1')), saved)
    await page.getByLabel('会話履歴を開く', { exact: true }).click()
    const history = page.getByRole('dialog', { name: '会話履歴', exact: true })
    for (const entry of JSON.parse(saved).manual[0].history) assert.ok((await history.textContent()).includes(entry.text))
    await page.keyboard.press('Escape')
    await page.getByLabel('メニュー', { exact: true }).click()
    assert.equal(await page.getByLabel('BGM音量', { exact: true }).inputValue(), '37')
    assert.equal(await page.locator('.scene-selector, .dev-label').count(), 0)
    const fonts = await page.evaluate(async () => {
      const loaded = await document.fonts.load('400 16px "Zen Kaku Gothic New"', '探偵')
      return loaded.map(face => ({ family: face.family, status: face.status }))
    })
    assert.ok(fonts.some(face => face.family === 'Zen Kaku Gothic New' && face.status === 'loaded'))
    assert.match(await page.locator('.story').evaluate(element => getComputedStyle(element).fontFamily), /Zen Kaku Gothic New/)
    await page.getByRole('button', { name: 'RETURN TO TITLE', exact: true }).click()
    await page.getByRole('dialog', { name: 'タイトルに戻りますか？', exact: true }).getByRole('button', { name: 'RETURN TO TITLE', exact: true }).click()
    await page.getByRole('region', { name: 'タイトル画面', exact: true }).waitFor()
    assert.equal(await page.evaluate(() => localStorage.getItem('detective-saeki-minato.slots.v1')), saved)
    assert.deepEqual(errors, [])
  } finally {
    await browser?.close()
    server.closeAllConnections()
    await new Promise(resolve => server.close(resolve))
  }
})
