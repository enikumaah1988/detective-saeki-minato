import {loadForTest,saveForTest} from './saveUiHelpers.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {loadRevision,buildPlaythrough} from './revisionHarness.mjs'
const path=process.env.SAEKI_PLAYWRIGHT_PATH,url=process.env.SAEKI_PART1_URL??'http://127.0.0.1:5191/'
for(const [width,height] of [[1920,1080],[1366,768]]) test(`出発前の段取り連続会話・途中ロード・任意話題・移動 ${width}`,{skip:!path},async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true),{chromium}=await import(path)
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width,height}}),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 try{
  await page.addInitScript(()=>localStorage.setItem('detective-saeki-minato.speed','0'))
  await page.goto(url)
  const restore=async state=>{
   await page.evaluate(value=>localStorage.removeItem('detective-saeki-minato.slots.v1') || localStorage.setItem('detective-saeki-minato.save.v1',JSON.stringify(value)),api.createSaveData(state))
   await page.getByLabel('メニュー',{exact:true}).click();await loadForTest(page)
   await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
  }
  const choose=async label=>{
   const before=await page.locator('.story').getAttribute('data-node-id')
   await page.locator('.command-panel button').filter({has:page.locator('.command-name',{hasText:new RegExp('^'+label+'$')})}).click()
   await page.waitForFunction(id=>document.querySelector('.story')?.getAttribute('data-node-id')!==id,before)
  }
  const base=run.checkpoints.find(p=>p.phase==='P1-05').state
  await restore({...base,nodeId:'P1-06-menu'})
  await choose('見る');await choose('机の写真')
  const seen=[]
  while(await page.locator('.dialogue-button').count()){
   const id=await page.locator('.story').getAttribute('data-node-id');seen.push(id)
   if(id==='p1-company-call-3'){
    await page.getByLabel('メニュー',{exact:true}).click();await saveForTest(page)
    await loadForTest(page)
    await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
    assert.equal(await page.locator('.story').getAttribute('data-node-id'),id)
   }
   await page.locator('.dialogue-button .next').waitFor();await page.locator('.dialogue-button').click()
  }
  for(const id of ['p1-company-call','p1-mio-role','p2-depart'])assert.ok(seen.includes(id),id)
  assert.equal(await page.locator('.story').getAttribute('data-node-id'),'P2-01-menu')
  await choose('話す');await choose('相澤　澪')
  assert.ok((await page.locator('.command-name').allTextContents()).includes('あかりの様子'))
  await choose('戻る');await choose('戻る');await choose('移動')
  assert.ok((await page.locator('.command-name').allTextContents()).includes('外に出る'))
  await choose('戻る')
  await restore({...base,nodeId:'P1-06-speak-mio',acquiredInformation:[...base.acquiredInformation,'F10']})
  assert.equal(await page.locator('.story').getAttribute('data-node-id'),'p1-company-call')
  assert.deepEqual(errors,[])
 }finally{await browser.close()}
})
