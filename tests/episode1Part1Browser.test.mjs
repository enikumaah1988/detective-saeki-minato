import test from 'node:test'
import assert from 'node:assert/strict'
const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5187'
for (const [width,height] of [[1920,1080],[1366,768]]) test(`ver0.01第1部 実プレイ ${width}×${height}`, {skip:!playwrightPath}, async()=>{
 const {chromium}=await import(playwrightPath)
 const browser=await chromium.launch({headless:true})
 const page=await browser.newPage({viewport:{width,height}})
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 const choose=async name=>{await page.getByRole('button',{name,exact:false}).click();await page.waitForTimeout(210)}
 const read=async()=>{
  for(let i=0;i<200 && await page.locator('.dialogue-button').count();i++){
   const b=page.locator('.dialogue-button');await b.click();await page.waitForTimeout(35)
  }
  assert.equal(await page.locator('.dialogue-button').count(),0)
 }
 const menu=page.getByLabel('メニュー',{exact:true})
 const save=async()=>{await menu.click();await page.getByRole('button',{name:'セーブ',exact:true}).click();await menu.click();return page.evaluate(()=>JSON.parse(localStorage.getItem('detective-saeki-minato.save.v1')))}
 try{
  await page.goto(baseUrl.split('?')[0]);await page.evaluate(()=>document.fonts.ready)
  await page.locator('.dialogue-button').waitFor();await read()
  assert.equal(await page.getByRole('button',{name:'考える',exact:true}).count(),0)
  await choose('聞く');await choose('最後の朝・連絡・勤務先')
  const midway=await save();assert.deepEqual(midway.acquiredInformation,[])
  await read()
  const acquired=await save();assert.deepEqual(acquired.acquiredInformation,['I01'])
  // 実際のロード操作で会話途中へ戻し、再取得しても重複しない。
  await page.evaluate(value=>localStorage.setItem('detective-saeki-minato.save.v1',JSON.stringify(value)),midway)
  await menu.click();await page.getByRole('button',{name:'ロード',exact:true}).click();await menu.click()
  await read();assert.deepEqual((await save()).acquiredInformation,['I01'])
  await page.locator('.toolbar-actions').getByRole('button',{name:'調査記録'}).click()
  await page.getByRole('tab',{name:'証拠',exact:true}).click()
  assert.match(await page.locator('.investigation-records').textContent(),/I01/)
  await page.keyboard.press('Escape')
  await choose('考える');await read();await choose('移動');await choose('東成ビルサービス');await read()
  const companySave=await save();assert.equal(companySave.nodeId,'company-menu')
  await page.reload();await menu.click();await page.getByRole('button',{name:'ロード',exact:true}).click();await menu.click()
  await choose('聞く');await choose('休暇記録と面会申込み');await read()
  assert.match(await page.locator('.end-window').textContent(),/第2部/)
  const end=await save();assert.equal(end.nodeId,'part2-boundary');assert.equal(end.flags.part1_completed,true)
  assert.ok(end.acquiredInformation.includes('I01')&&end.acquiredInformation.includes('I02'))
  assert.deepEqual(end.inspectedTargets,[]);assert.deepEqual(errors,[])
  console.log(JSON.stringify({viewport:[width,height],end:end.nodeId,information:end.acquiredInformation}))
 } finally{await browser.close()}
})


