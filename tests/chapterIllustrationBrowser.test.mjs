import {loadForTest,saveForTest} from './saveUiHelpers.mjs'
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
  const nodes=Object.entries(api.scenario.nodes).filter(([,node])=>node.illustration)
  assert.equal(nodes.length,8)
  for(const [nodeId,node]of nodes){
   const phaseId=node.sceneId.replace(/-boundary$/,'')
   const state={...run.checkpoints.find(point=>point.phase===phaseId).state,nodeId}
   await page.evaluate(value=>localStorage.removeItem('detective-saeki-minato.slots.v1') || localStorage.setItem('detective-saeki-minato.save.v1',JSON.stringify(value)),api.createSaveData(state))
   await page.getByLabel('メニュー',{exact:true}).click();await loadForTest(page)
   await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
   await page.locator('.chapter-title-card').waitFor()
   await page.waitForFunction(()=>{const image=document.querySelector('.chapter-illustration');return image?.complete&&image.naturalWidth>0})
   assert.match(await page.locator('.chapter-title-card').textContent(),/探偵 佐伯湊.*DETECTIVE SAEKI MINATO.*第1話 灰色の証言/s)
   const title=await page.locator('.chapter-title-card strong').boundingBox()
   assert.ok(title.x>width*.56 && title.x+title.width<width*.96)
   if(node.illustration.id==='C1-IN'){
    await page.locator('.chapter-illustration').evaluate(image=>{image.src='/missing-episode-cover.png'})
    await page.waitForFunction(()=>{const image=document.querySelector('.chapter-illustration');return image?.src.includes('default-title.png')&&image.complete&&image.naturalWidth>0})
   }
   assert.equal(await page.locator('.character').count(),0)
   assert.equal(await page.locator('.message-window, .history-entry').count(),0)
   assert.equal(await page.locator('[data-illustration-id]').getAttribute('data-illustration-id'),node.illustration.id)
   const rect=await page.locator('.chapter-title-card').boundingBox();assert.ok(Math.abs(rect.width-width)<1);assert.ok(Math.abs(rect.height-height)<1)
   if(process.env.SAEKI_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/chapter-${node.illustration.id}-${width}.png`})
   await page.getByLabel('メニュー',{exact:true}).click()
   await page.locator('.stage-input-area').click({position:{x:width*.8,y:height*.75}})
   await page.keyboard.press('Enter')
   assert.equal(await page.locator('.story').getAttribute('data-node-id'),nodeId)
   await page.getByLabel('メニュー',{exact:true}).click()
   if(node.illustration.id.endsWith('-IN'))await page.locator('.stage-input-area').click({position:{x:width*.8,y:height*.75}})
   else {
    await page.locator('.stage-input-area').click({position:{x:width*.8,y:height*.75},trial:true})
    await page.evaluate(()=>document.activeElement?.blur())
    await page.keyboard.press('Enter')
   }
   await page.waitForFunction(id=>document.querySelector('.story')?.getAttribute('data-node-id')!==id,nodeId)
   assert.notEqual(await page.locator('.story').getAttribute('data-node-id'),nodeId)
   assert.equal(await page.locator('.story').getAttribute('data-node-id'),node.next)
   if(api.scenario.nodes[node.next].type==='dialogue' && !api.scenario.nodes[node.next].illustration){
    assert.equal(await page.locator('.message-window').count(),1)
    assert.equal(await page.locator('.history-entry').count(),1)
   }
  }
  for(const phaseId of ['P1-03','P2-08','P3-04','P4-10']){
   const state=run.checkpoints.find(point=>point.phase===phaseId).state
   await page.evaluate(value=>localStorage.removeItem('detective-saeki-minato.slots.v1') || localStorage.setItem('detective-saeki-minato.save.v1',JSON.stringify(value)),api.createSaveData(state))
   await page.getByLabel('メニュー',{exact:true}).click();await loadForTest(page)
   await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
   await page.waitForFunction(()=>Array.from(document.querySelectorAll('.character-image')).every(image=>image.complete&&image.naturalWidth>0))
   if(phaseId==='P4-10'){
    assert.deepEqual(await page.locator('[data-character-id]').evaluateAll(elements=>elements.map(element=>element.dataset.characterId)),['akari','minato','naoto'])
    assert.equal(await page.locator('.character--left[data-character-id="akari"]').getAttribute('data-expression'),'right-sad')
    assert.equal(await page.locator('.character--center[data-character-id="minato"]').getAttribute('data-expression'),'front-normal')
   }
   if(phaseId==='P2-08'){
    assert.deepEqual(await page.locator('[data-character-id]').evaluateAll(elements=>elements.map(element=>element.dataset.characterId)),['segawa','minato','okumura'])
    assert.equal(await page.locator('[data-character-id="minato"]').getAttribute('data-expression'),'front-normal')
    assert.equal(await page.locator('.stage--three .character--center').count(),1)
   }
   if(phaseId==='P1-03')assert.equal(await page.locator('[data-character-id="akari"]').getAttribute('data-expression'),'worried')
   if(process.env.SAEKI_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/characters-${phaseId}-${width}.png`})
  }
 }finally{await browser.close()}
})
