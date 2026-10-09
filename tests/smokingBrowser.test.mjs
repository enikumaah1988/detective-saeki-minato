import test from 'node:test'
import assert from 'node:assert/strict'
const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = process.env.SAEKI_BASE_URL ?? 'http://127.0.0.1:5176'
const saveKey = 'detective-saeki-minato.save.v1'
for (const [width,height] of [[1920,1080],[1366,768]]) test(`喫煙ヒント演出 ${width}×${height}: 両場所・読了・状態維持`, {skip:!playwrightPath}, async()=>{
 const {chromium}=await import(playwrightPath), browser=await chromium.launch(), page=await browser.newPage({viewport:{width,height}})
 try {
  await page.goto(baseUrl)
  const dialogue=page.locator('.story-content .dialogue-button'), initialPage=await dialogue.getAttribute('data-page')
  const before=await page.evaluate(key=>localStorage.getItem(key),saveKey)
  await page.locator('.scene-selector').filter({hasText:'喫煙演出プレビュー'}).locator('summary').click()
  for(const [place,phrase] of [['吸える場所','ひと息ついた'],['吸えない場所','吸えないと思い直した']]){
   await page.getByRole('button',{name:place,exact:true}).click()
   await page.evaluate(()=>document.querySelector('.game-shell').scrollIntoView({block:'start'}))
   await page.locator('.toolbar-actions').getByRole('button',{name:'タバコを吸う'}).click()
   const overlay=page.locator('.smoking-overlay .dialogue-button')
   await overlay.waitFor(); assert.equal(await dialogue.isVisible(),false)
   await overlay.click(); assert.match(await overlay.textContent(),new RegExp(phrase))
   await overlay.click()
   await page.waitForFunction(()=>document.querySelector('.smoking-overlay .dialogue-button .dialogue')?.textContent.includes('澪から話を聞き直し'))
   assert.equal(await dialogue.isVisible(),false)
   await overlay.click(); await overlay.click()
   await page.waitForFunction(()=>!document.querySelector('.smoking-overlay'))
   assert.equal(await dialogue.isVisible(),true)
   assert.equal(await dialogue.getAttribute('data-page'),initialPage)
   assert.equal(await page.evaluate(key=>localStorage.getItem(key),saveKey),before)
  }
  // Free Actionでの呼び出しも、同じ選択状態へ戻る。
  for(let i=0;i<40 && await page.locator('.free-action-panel').count()===0;i++) await dialogue.click()
  const actions=page.locator('.free-action-panel')
  await actions.waitFor()
  await page.locator('.toolbar-actions').getByRole('button',{name:'タバコを吸う'}).click()
  const overlay=page.locator('.smoking-overlay .dialogue-button'); await overlay.waitFor()
  await overlay.click(); await overlay.click()
  await page.waitForFunction(()=>document.querySelector('.smoking-overlay .dialogue-button .dialogue')?.textContent.includes('澪から話を聞き直し'))
  await overlay.click(); await overlay.click(); await page.waitForFunction(()=>!document.querySelector('.smoking-overlay'))
  await actions.waitFor()
  await actions.getByRole('button',{name:/聞く/}).click()
  await page.getByLabel('聞く話題',{exact:true}).waitFor()
 }finally{await browser.close()}
})
