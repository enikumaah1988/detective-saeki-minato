import {loadForTest,saveForTest} from './saveUiHelpers.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5186'
const key = 'detective-saeki-minato.save.v1'
const required = ['brother_profile','disappearance_timing','last_known_activity','past_accident']
for (const width of [1920,1366]) {
  test(`進捗別喫煙ヒント ${width}: シーン判定・不足順・ロード・状態不変`, { skip:!playwrightPath }, async () => {
    const { chromium } = await import(playwrightPath)
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport:{ width, height:width===1920?1080:768 } })
    try {
      await page.goto(baseUrl)
      const menu = page.getByLabel('メニュー',{exact:true})
      const hud = page.locator('.toolbar-actions').getByRole('button',{name:'タバコを吸う'})
      for (const [count, phrase] of [[0,'普段どんな人'],[1,'いつから'],[2,'最近の兄'],[3,'事故について'],[4,'考えをまとめ']]) {
        const save = {version:2,scenarioId:'gray-testimony-part1-demo',nodeId:'menu',flags:{},heardTopics:['brother','recent-brother'],inspectedTargets:[],acquiredInformation:required.slice(0,count)}
        await page.evaluate(([key,save])=>localStorage.setItem(key,JSON.stringify(save)),[key,save])
        await menu.click(); await loadForTest(page); await page.getByRole('dialog', { name: 'ロードしました', exact: true }).getByRole('button', { name: 'OK', exact: true }).click()
        await page.locator('.free-action-panel').waitFor()
        const labels = await page.locator('.free-action-panel .command-name').allTextContents()
        await hud.click()
        assert.equal(await page.locator('.smoking-cut-in').getAttribute('data-variant'),'smoking')
        let dialogue = page.locator('.smoking-overlay .dialogue-button')
        await dialogue.click(); await dialogue.locator('.next').waitFor(); await dialogue.click()
        await page.waitForFunction(phrase=>document.querySelector('.smoking-overlay .dialogue .sr-only')?.textContent.includes(phrase),phrase)
        dialogue = page.locator('.smoking-overlay .dialogue-button')
        await dialogue.click(); await dialogue.locator('.next').waitFor(); await dialogue.click()
        await page.waitForFunction(()=>!document.querySelector('.smoking-overlay'))
        assert.deepEqual(await page.locator('.free-action-panel .command-name').allTextContents(),labels)
        assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),save)
      }
      // テスト応答だけで同じ場所を禁煙指定にし、DEV上書きなしで判定を検証する。
      await page.route('**/src/data/scenario/freeActionDemo.ts*', async route => {
        const response = await route.fetch()
        await route.fulfill({response,body:(await response.text()).replaceAll('smokingAllowed: true','smokingAllowed: false')})
      })
      await page.reload()
      await hud.click()
      assert.equal(await page.locator('.smoking-cut-in').getAttribute('data-variant'),'non-smoking')
      assert.match(await page.locator('.smoking-overlay .sr-only').last().textContent(),/吸えない/)
    } finally { await browser.close() }
  })
}
