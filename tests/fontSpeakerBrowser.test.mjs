import test from 'node:test'
import assert from 'node:assert/strict'

const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5176'
const text = '「三日前、兄から連絡がありました。」句読点、か\u3099、👨‍👩‍👧‍👦、🇯🇵、👍🏽を確認する。'.repeat(6)
  + '\n改行後も全文を読み、情報の欠落がないことを確認する。'.repeat(3)

// 採用済みの表示を調整せず、未確認だった読み込みと長い名前だけを検証する。
for (const [width, height] of [[1920, 1080], [1366, 768]]) {
  for (const mode of ['loaded', 'delayed', 'blocked']) {
    test(`フォント・話者B ${width}×${height} ${mode}: 長短名・改ページ`, { skip: !playwrightPath }, async () => {
      const { chromium } = await import(playwrightPath)
      const browser = await chromium.launch()
      try {
        for (const speaker of ['湊', '佐伯 湊／相澤 澪から聞いた証言を整理中']) {
          const page = await browser.newPage({ viewport: { width, height } })
          let release
          const gate = new Promise(resolve => { release = resolve })
          try {
            await page.route(/\/src\/data\/scenario\/freeActionDemo\.ts(?:\?|$)/, async route => {
              const response = await route.fetch()
              await route.fulfill({ response, body: `${await response.text()}\nfreeActionDemo.nodes['office-daily'].text = ${JSON.stringify(text)};` })
            })
            await page.route(/\/src\/data\/presentation\.ts(?:\?|$)/, async route => {
              const response = await route.fetch()
              await route.fulfill({ response, body: `${await response.text()}\ncharacters.minato.name = ${JSON.stringify(speaker)};` })
            })
            await page.route(/\.woff2(?:\?|$)/, async route => {
              if (mode === 'blocked') return route.abort()
              if (mode === 'delayed') await gate
              await route.continue()
            })
            await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
            const dialogue = page.locator('.story-content .dialogue-button')
            await dialogue.waitFor()
            if (mode === 'delayed') {
              await page.waitForFunction(() => document.fonts.status === 'loading')
              // swapで表示される代替フォントの文字を読んだ途中で、読み込みを完了させる。
              await page.waitForFunction(() => (document.querySelector('.dialogue [aria-hidden]')?.textContent.length ?? 0) >= 5)
              await page.getByLabel('メニュー', { exact: true }).click()
              const before = await dialogue.locator('.dialogue > [aria-hidden]').textContent()
              release()
              await page.evaluate(() => document.fonts.ready)
              assert.equal(await dialogue.locator('.dialogue > [aria-hidden]').textContent(), before)
              await page.getByLabel('メニュー', { exact: true }).click()
            } else {
              await page.evaluate(() => document.fonts.ready)
            }
            const fontFaces = await page.evaluate(() => [...document.fonts]
              .filter(font => font.family.includes('Zen Kaku Gothic New')).map(font => ({ weight: font.weight, status: font.status })))
            assert.equal(fontFaces.length, 2)
            for (const font of fontFaces) assert.equal(font.status, mode === 'blocked' ? 'error' : 'loaded')
            assert.equal(await dialogue.locator('.speaker').textContent(), speaker)
            let joined = ''
            const pages = Number(await dialogue.getAttribute('data-pages'))
            for (let i = 0; i < pages; i++) {
              if (!await dialogue.locator('.next').count()) await dialogue.click()
              await dialogue.locator('.next').waitFor()
              joined += await dialogue.locator('.dialogue > [aria-hidden]').textContent()
              const layout = await dialogue.evaluate(el => {
                const name = el.querySelector('.speaker'), body = el.querySelector('.dialogue'), next = el.querySelector('.next')
                const rect = el.getBoundingClientRect(), n = name.getBoundingClientRect(), b = body.getBoundingClientRect()
                const range = document.createRange(); range.selectNodeContents(body.querySelector('[aria-hidden]'))
                const lines = [...range.getClientRects()].filter(r => r.width > 0)
                const nameRange = document.createRange(); nameRange.selectNodeContents(name)
                const nameLines = [...nameRange.getClientRects()].filter(r => r.width > 0)
                const style = getComputedStyle(name), underline = getComputedStyle(name, '::after')
                return { scale: el.closest('.story').getBoundingClientRect().width / 1920,
                  size: parseFloat(style.fontSize), weight: style.fontWeight, color: style.color,
                  lineWidth: parseFloat(underline.width), lineHeight: parseFloat(underline.height),
                  gap: b.top - n.bottom, nameRight: n.right, right: rect.right,
                  nameTextRight: Math.max(...nameLines.map(r => r.right)),
                  textRight: Math.max(...lines.map(r => r.right)), bodyRight: b.right,
                  textTop: b.top, nameBottom: n.bottom,
                  textBottom: Math.max(...lines.map(r => r.bottom)), nextTop: next.getBoundingClientRect().top,
                  lines: new Set(lines.map(r => Math.round(r.top))).size,
                  overflow: el.scrollHeight > el.clientHeight + 1 }
              })
              assert.ok(Math.abs(layout.size - 40 * layout.scale) < 1)
              assert.equal(layout.weight, '600')
              assert.equal(layout.color, 'rgb(212, 183, 128)')
              assert.ok(layout.lineWidth >= 160 * layout.scale - 1 && layout.nameRight <= layout.right + 1)
              assert.ok(Math.abs(layout.lineHeight - 2 * layout.scale) < 1)
              assert.ok(Math.abs(layout.gap - 12 * layout.scale) < 1)
              assert.ok(layout.nameRight <= layout.right && layout.textTop > layout.nameBottom)
              assert.ok(layout.nameTextRight <= layout.nameRight && layout.textRight <= layout.bodyRight)
              assert.ok(layout.textBottom <= layout.nextTop + 1)
              assert.ok(layout.lines <= 3)
              assert.equal(layout.overflow, false)
              if (i < pages - 1) await dialogue.click()
            }
            assert.equal(joined, text)
            console.log(JSON.stringify({ viewport: [width, height], mode, speaker, pages, fontFaces, textPreserved: true }))
          } finally { release(); await page.close() }
        }
      } finally { await browser.close() }
    })
  }
}
