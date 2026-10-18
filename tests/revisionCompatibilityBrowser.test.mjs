import {loadForTest,saveForTest} from './saveUiHelpers.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
const playwrightPath=process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl=(process.env.SAEKI_PART1_URL??'http://127.0.0.1:5187').split('?')[0]
for(const [width,height] of [[1920,1080],[1366,768]]) test(`改訂版 旧ビル背景・旧セーブ・速度設定 ${width}`,{skip:!playwrightPath},async()=>{
 const {chromium}=await import(playwrightPath), browser=await chromium.launch(), page=await browser.newPage({viewport:{width,height}})
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 try{
  await page.goto(baseUrl)
  const menu=page.getByLabel('メニュー',{exact:true})
  const load=async value=>{
   await page.evaluate(v=>localStorage.removeItem('detective-saeki-minato.slots.v1') || localStorage.setItem('detective-saeki-minato.save.v1',JSON.stringify(v)),value)
   await menu.click();await loadForTest(page);await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
  }
  const old={version:2,scenarioId:'gray-testimony-ver001-part1',nodeId:'departure',flags:{request_accepted:true},heardTopics:['morning-contact-work'],inspectedTargets:[],acquiredInformation:['I01','search-photo']}
  await load(old)
  assert.equal(await page.locator('.story').getAttribute('data-node-id'),'P1-06-menu')
  assert.equal(await page.getByRole('button',{name:'見る',exact:true}).count(),1)
  assert.equal(await page.locator('.save-controls[open]').count(),0)
  await menu.click();await page.getByRole('button',{name:'メッセージスピード：ゆっくり',exact:true}).click();await menu.click()
  await page.reload();await menu.click();assert.equal(await page.getByLabel('メッセージスピード',{exact:true}).inputValue(),'0');await menu.click()
  for(const [nodeId,label,background] of [['company-menu','東成ビルサービス','company-reception'],['building-arrival','成子坂共同ビル前','building-exterior'],['stairs-inspect','成子坂共同ビル・階段','building-stairs'],['naoto-testimony','成子坂共同ビル・管理人室','building-room-evening'],['part4-start','成子坂共同ビル・旧事務室','old-office']]){
   await load({...old,nodeId})
   assert.equal(await page.locator('.scene-context span').first().textContent(),label)
   assert.equal(await page.locator('.stage').getAttribute('data-background-id'),background)
   await page.waitForFunction(()=>{const img=document.querySelector('.background-image');return img?.complete&&img.naturalWidth>0})
   assert.equal(await page.locator('.background-label').count(),0)
   if(process.env.SAEKI_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/${background}-${width}.png`})
  }
  assert.deepEqual(errors,[])
 }finally{await browser.close()}
})
