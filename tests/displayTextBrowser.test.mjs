import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'
import { displayText } from '../src/features/story/displayText.ts'
const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5191/'
const text = '10月8日、14:30。2年前、35歳。二人で一日。か\u3099、👨‍👩‍👧‍👦。'.repeat(18)
for (const [width, height] of [[1920,1080], [1366,768]]) test(`全角数字の実寸改ページ・履歴・記録・日時・音量 ${width}`, {skip:!path}, async () => {
  const api = await loadRevision(), {chromium} = await import(path)
  const browser = await chromium.launch(), page = await browser.newPage({viewport:{width,height}})
  const errors = []; page.on('pageerror',error => errors.push(error.message))
  try {
    await page.addInitScript(() => localStorage.setItem('detective-saeki-minato.speed','0'))
    await page.route(/\/src\/data\/scenario\/episode1Part1\.ts(?:\?|$)/, async route => {
      const response = await route.fetch()
      await route.fulfill({response,body:`${await response.text()}\nepisode1Part1.nodes['P1-01-intro'].text = ${JSON.stringify(text)}; episode1Part1.nodes['P1-01-menu'].options[0].label = '話す1';`})
    })
    await page.goto(url)
    const restore = async state => {
      await page.evaluate(value => localStorage.setItem('detective-saeki-minato.save.v1',JSON.stringify(value)),api.createSaveData(state))
      await page.getByLabel('メニュー',{exact:true}).click()
      await page.getByRole('button',{name:'ロード',exact:true}).click()
      await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
    }
    await restore({...api.createInitialState(api.scenario),nodeId:'P1-01-intro'})
    await page.evaluate(() => document.fonts.ready)
    const dialogue = page.locator('.story-content .dialogue-button')
    const count = Number(await dialogue.getAttribute('data-pages')); assert.ok(count > 1)
    let joined = ''
    for(let i=0;i<count;i++) {
      await dialogue.locator('.next').waitFor()
      joined += await dialogue.locator('.dialogue > [aria-hidden]').textContent()
      const fits = await dialogue.evaluate(element => {
        const body = element.querySelector('.dialogue > [aria-hidden]'), range = document.createRange()
        range.selectNodeContents(body)
        const rects = [...range.getClientRects()].filter(rect => rect.width > 0)
        const bounds = element.querySelector('.dialogue').getBoundingClientRect()
        return rects.every(rect => rect.right <= bounds.right + 1 && rect.bottom <= element.querySelector('.next').getBoundingClientRect().top + 1)
          && new Set(rects.map(rect=>Math.round(rect.top))).size <= 3
      })
      assert.equal(fits,true)
      await dialogue.click()
    }
    assert.equal(joined,displayText(text))
    assert.match(await page.locator('.scene-context').textContent(),/１０月８日/)
    await page.getByRole('button',{name:'会話履歴',exact:true}).click()
    assert.equal(await page.locator('.history-list p').last().textContent(),displayText(text))
    await page.getByRole('dialog',{name:'会話履歴',exact:true}).getByRole('button',{name:'閉じる',exact:true}).click()
    // メニューを保存・再ロードしても保存値と内部IDは半角のまま。
    await restore({...api.createInitialState(api.scenario),nodeId:'P1-01-menu'})
    assert.ok((await page.locator('.command-name').allTextContents()).includes('話す１'))
    await page.getByLabel('メニュー',{exact:true}).click()
    await page.getByRole('button',{name:'BGM音量：４０%',exact:true}).click()
    assert.ok((await page.locator('.save-panel output').allTextContents()).includes('４０%'))
    assert.match(await page.locator('.save-panel [role=status]').textContent(),/１件/)
    assert.equal(await page.getByLabel('BGM音量',{exact:true}).inputValue(),'4')
    await page.getByLabel('メニュー',{exact:true}).click()
    const run = buildPlaythrough(api,true), point = run.checkpoints.find(p=>p.phase==='P2-06').state
    await restore(point)
    await page.getByRole('button',{name:'調査記録',exact:true}).click()
    await page.getByRole('tab',{name:'出来事',exact:true}).click()
    assert.doesNotMatch(await page.locator('.record-body').textContent(),/[0-9]/)
    assert.match(await page.locator('.record-body').textContent(),/[０-９]/)
    await page.getByRole('tab',{name:'証拠',exact:true}).click()
    await page.getByRole('button',{name:'休暇記録と面会申込み',exact:true}).click()
    assert.match(await page.locator('.record-detail').textContent(),/１０月５日/)
    await page.getByLabel('調査記録を閉じる',{exact:true}).click()
    await page.getByLabel('メニュー',{exact:true}).click()
    await page.getByRole('button',{name:'セーブ',exact:true}).click()
    const saved = await page.evaluate(()=>JSON.parse(localStorage.getItem('detective-saeki-minato.save.v1')))
    assert.equal(saved.version,2); assert.equal(saved.nodeId,'P2-06-menu')
    assert.ok(saved.acquiredInformation.includes('F01'))
    assert.deepEqual(errors,[])
    console.log(JSON.stringify({viewport:[width,height],pages:count,textPreserved:true,saveVersion:saved.version}))
  } finally {await browser.close()}
})
