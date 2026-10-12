import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'
const playwrightPath=process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl=(process.env.SAEKI_PART1_URL??'http://127.0.0.1:5187/').split('?')[0]
for(const [width,height] of [[1920,1080],[1366,768]])test(`部の挿絵・読了とロード復帰 ${width}`,{skip:!playwrightPath},async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true)
 const {chromium}=await import(playwrightPath),browser=await chromium.launch(),page=await browser.newPage({viewport:{width,height}})
 try{
  await page.addInitScript(()=>localStorage.setItem('detective-saeki-minato.speed','0'))
  await page.goto(baseUrl)
  const nodes=Object.entries(api.scenario.nodes).filter(([,node])=>node.illustration?.imageSrc)
  assert.equal(nodes.length,8)
  for(const [nodeId,node]of nodes){
   const phaseId=node.sceneId.replace(/-boundary$/,'')
   const state={...run.checkpoints.find(point=>point.phase===phaseId).state,nodeId}
   await page.evaluate(value=>localStorage.setItem('detective-saeki-minato.save.v1',JSON.stringify(value)),api.createSaveData(state))
   await page.getByLabel('メニュー',{exact:true}).click();await page.getByRole('button',{name:'ロード',exact:true}).click()
   await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
   await page.waitForFunction(()=>{const image=document.querySelector('.chapter-illustration');return image?.complete&&image.naturalWidth>0})
   assert.equal(await page.locator('.character').count(),0)
   assert.equal(await page.locator('[data-illustration-id]').getAttribute('data-illustration-id'),node.illustration.id)
   const rect=await page.locator('.chapter-illustration').boundingBox();assert.ok(Math.abs(rect.width-width)<1);assert.ok(Math.abs(rect.height-height)<1)
   if(process.env.SAEKI_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/chapter-${node.illustration.id}-${width}.png`})
   await page.locator('.dialogue-button').click()
   assert.notEqual(await page.locator('.story').getAttribute('data-node-id'),nodeId)
  }
  for(const phaseId of ['P1-03','P3-04','P4-10']){
   const state=run.checkpoints.find(point=>point.phase===phaseId).state
   await page.evaluate(value=>localStorage.setItem('detective-saeki-minato.save.v1',JSON.stringify(value)),api.createSaveData(state))
   await page.getByLabel('メニュー',{exact:true}).click();await page.getByRole('button',{name:'ロード',exact:true}).click()
   await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
   await page.waitForFunction(()=>Array.from(document.querySelectorAll('.character-image')).every(image=>image.complete&&image.naturalWidth>0))
   if(phaseId==='P4-10')assert.deepEqual(await page.locator('[data-character-id]').evaluateAll(elements=>elements.map(element=>element.dataset.characterId)),['naoto','akari'])
   if(phaseId==='P1-03')assert.equal(await page.locator('[data-character-id="akari"]').getAttribute('data-expression'),'worried')
   if(process.env.SAEKI_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/characters-${phaseId}-${width}.png`})
  }
 }finally{await browser.close()}
})
