import test from 'node:test'
import assert from 'node:assert/strict'
import {loadRevision,buildPlaythrough} from './revisionHarness.mjs'
const path=process.env.SAEKI_PLAYWRIGHT_PATH,url=process.env.SAEKI_PART1_URL??'http://127.0.0.1:5187/'
for(const [width,height]of [[1920,1080],[1366,768]])test(`最新人物素材・新しい脇役・記録の顔表示 ${width}`,{skip:!path},async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true),{chromium}=await import(path)
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width,height}}),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 try{
  await page.addInitScript(()=>localStorage.setItem('detective-saeki-minato.speed','0'))
  await page.goto(url)
  const restore=async id=>{
   const state=run.checkpoints.find(point=>point.phase===id).state
   await page.evaluate(value=>localStorage.setItem('detective-saeki-minato.save.v1',JSON.stringify(value)),api.createSaveData(state))
   await page.getByLabel('メニュー',{exact:true}).click();await page.getByRole('button',{name:'ロード',exact:true}).click()
   await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
   await page.waitForFunction(()=>[...document.querySelectorAll('.character-image')].every(image=>image.complete&&image.naturalWidth>0))
  }
  for(const id of ['P1-01','P1-03','P2-03','P2-05','P2-08','P3-04','P4-10']){
   await restore(id)
   for(const src of await page.locator('.character-image').evaluateAll(images=>images.map(image=>image.src)))assert.match(src,/assets\/images\/characters\//)
   assert.equal(await page.locator('.character-silhouette').count(),0)
   if(process.env.SAEKI_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/refreshed-${id}-${width}.png`})
  }
  await restore('P2-03')
  await page.getByRole('button',{name:'調査記録',exact:true}).click()
  await page.getByRole('button',{name:'黒田　征司',exact:true}).click()
  await page.locator('.record-portrait img').waitFor()
  assert.doesNotMatch(await page.locator('.record-detail').textContent(),/UNKNOWN/)
  await page.getByRole('button',{name:'調査記録を閉じる',exact:true}).click()
  assert.deepEqual(errors,[])
 }finally{await browser.close()}
})
