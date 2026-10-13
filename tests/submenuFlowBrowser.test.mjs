import {loadForTest,saveForTest} from './saveUiHelpers.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {loadRevision} from './revisionHarness.mjs'
const path=process.env.SAEKI_PLAYWRIGHT_PATH,url=process.env.SAEKI_PART1_URL??'http://127.0.0.1:5187/'
for(const [width,height]of [[1920,1080],[1366,768]])test(`サブメニュー保持・人物観察・自然な来訪・途中保存 ${width}`,{skip:!path},async()=>{
 const api=await loadRevision(),{chromium}=await import(path),browser=await chromium.launch(),page=await browser.newPage({viewport:{width,height}})
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 try{
  await page.addInitScript(()=>localStorage.setItem('detective-saeki-minato.speed','0'))
  await page.goto(url)
  const state={...api.createInitialState(api.scenario),nodeId:'P1-01-menu'}
  await page.evaluate(value=>localStorage.removeItem('detective-saeki-minato.slots.v1') || localStorage.setItem('detective-saeki-minato.save.v1',JSON.stringify(value)),api.createSaveData(state))
  const menu=page.getByLabel('メニュー',{exact:true})
  await menu.click();await loadForTest(page);await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
  const choose=async label=>{const before=await page.locator('.story').getAttribute('data-node-id');await page.locator('.command-panel button').filter({has:page.locator('.command-name',{hasText:new RegExp('^'+label+'$')})}).click();await page.waitForFunction(id=>document.querySelector('.story')?.getAttribute('data-node-id')!==id,before)}
  const read=async()=>{while(await page.locator('.dialogue-button').count()){await page.locator('.dialogue-button .next').waitFor();await page.locator('.dialogue-button').click()}}
  assert.deepEqual(await page.locator('.free-action-panel .command-name').allTextContents(),['見る','話す'])
  await choose('話す');await choose('相澤　澪');await choose('今日の予定');await read()
  assert.equal(await page.locator('.story').getAttribute('data-node-id'),'P1-01-speak-mio')
  await menu.click();await saveForTest(page);await loadForTest(page);await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
  assert.equal(await page.locator('.story').getAttribute('data-node-id'),'P1-01-speak-mio')
  await choose('コーヒー');await read();assert.equal(await page.locator('.story').getAttribute('data-node-id'),'P1-01-speak-mio')
  await choose('戻る');await choose('戻る');await choose('見る');await choose('相澤　澪');await read()
  assert.equal(await page.locator('.story').getAttribute('data-node-id'),'P1-01-targets')
  if(process.env.SAEKI_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/submenu-people-${width}.png`})
  await choose('帳簿');await read()
  assert.equal(await page.locator('.story').getAttribute('data-node-id'),'P1-02-menu')
  assert.equal(await page.getByRole('button',{name:/仕事に戻る|兄の事情を確かめる/}).count(),0)
  assert.deepEqual(errors,[])
 }finally{await browser.close()}
})
