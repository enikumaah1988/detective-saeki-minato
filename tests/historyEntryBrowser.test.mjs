import test from 'node:test'
import assert from 'node:assert/strict'
import {loadRevision} from './revisionHarness.mjs'
const path=process.env.SAEKI_PLAYWRIGHT_PATH,url=process.env.SAEKI_PART1_URL??'http://127.0.0.1:5194/'
for(const [width,height] of [[1920,1080],[1366,768]])test(`履歴入口の表示・停止・入力・復帰 ${width}`,{skip:!path},async()=>{
 const {chromium}=await import(path),browser=await chromium.launch({channel:process.env.SAEKI_BROWSER_CHANNEL||undefined}),page=await browser.newPage({viewport:{width,height}})
 try{
  await page.goto(url)
  const entry=page.getByRole('button',{name:'会話履歴を開く',exact:true}),dialog=page.getByRole('dialog',{name:'会話履歴',exact:true}),text=page.locator('.story-content .dialogue [aria-hidden]'),box=page.locator('.story-content .dialogue-button')
  await page.waitForFunction(()=>document.querySelector('.story-content .dialogue [aria-hidden]')?.textContent.length>2)
  const node=await page.locator('.story').getAttribute('data-node-id'),initialPage=await box.getAttribute('data-page')
  for(const [open,close] of [['click','Escape'],['Enter','Enter'],['Space','Space']]){
   if(open==='click')await entry.click();else await entry.press(open)
   await dialog.waitFor();assert.equal(await entry.count(),0)
   const paused=await text.textContent();await page.waitForTimeout(120)
   assert.equal(await text.textContent(),paused)
   const closeButton=dialog.getByRole('button',{name:'閉じる',exact:true})
   assert.equal(await closeButton.evaluate(el=>el===document.activeElement),true)
   await page.keyboard.press('Tab');assert.equal(await closeButton.evaluate(el=>el===document.activeElement),true)
   if(close==='Escape')await page.keyboard.press(close);else await closeButton.press(close)
   await entry.waitFor();await page.waitForFunction(()=>document.activeElement?.matches('.history-entry'));assert.equal(await entry.evaluate(el=>el===document.activeElement),true)
   assert.equal(await page.locator('.story').getAttribute('data-node-id'),node)
   assert.equal(await box.getAttribute('data-page'),initialPage)
  }
  const resume=await text.textContent();await page.waitForTimeout(120);assert.ok((await text.textContent()).length>=resume.length)
  for(const name of ['メニュー','調査記録','タバコを吸う']){
   if(name==='メニュー')await page.getByLabel(name,{exact:true}).click();else await page.getByRole('button',{name,exact:true}).click()
   assert.equal(await entry.count(),0)
   await page.reload();await entry.waitFor()
  }
  const api=await loadRevision()
  for(const type of ['choice','topic','inspect']){
   const target=Object.entries(api.scenario.nodes).find(([id,n])=>id.startsWith('P1-01-') && !id.endsWith('-exit') && n.type===type && (type!=='choice'||!n.map))
   if(!target)continue
   const data=api.createSaveData({...api.createInitialState(api.scenario),nodeId:target[0]})
   await page.evaluate(data=>localStorage.setItem('detective-saeki-minato.slots.v1',JSON.stringify({version:1,auto:null,manual:[{data,savedAt:'',label:'test',history:[]}]})),data)
   await page.getByLabel('メニュー',{exact:true}).click();await page.getByRole('button',{name:'LOAD',exact:true}).click()
   await page.getByRole('button',{name:'SAVE １',exact:true}).click();await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
   assert.equal(await page.locator('.story').getAttribute('data-node-id'),target[0]);assert.equal(await entry.count(),0)
  }
 }finally{await browser.close()}
})
