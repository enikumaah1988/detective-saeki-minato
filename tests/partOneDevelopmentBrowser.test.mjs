import test from 'node:test'
import assert from 'node:assert/strict'
import {loadRevision,buildPlaythrough} from './revisionHarness.mjs'
const path=process.env.SAEKI_PLAYWRIGHT_PATH,url=process.env.SAEKI_PART1_URL??'http://127.0.0.1:5187/'
for(const [width,height]of [[1920,1080],[1366,768]])test(`新第1部の受諾後の段階・つなぎ・帰所・部末 ${width}`,{skip:!path},async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true),{chromium}=await import(path)
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width,height}}),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 try{
  await page.addInitScript(()=>localStorage.setItem('detective-saeki-minato.speed','0'))
  await page.goto(url)
  const restore=async state=>{
   await page.evaluate(value=>localStorage.setItem('detective-saeki-minato.save.v1',JSON.stringify(value)),api.createSaveData(state))
   await page.getByLabel('メニュー',{exact:true}).click();await page.getByRole('button',{name:'ロード',exact:true}).click()
   await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
  }
  const choose=async label=>{
   const before=await page.locator('.story').getAttribute('data-node-id')
   await page.locator('.command-panel button').filter({has:page.locator('.command-name',{hasText:new RegExp('^'+label+'$')})}).click()
   await page.waitForFunction(id=>document.querySelector('.story')?.getAttribute('data-node-id')!==id,before)
  }
  const readTo=async id=>{
   const visited=[]
   for(let count=0;count<50&&await page.locator('.story').getAttribute('data-node-id')!==id;count++){
    const before=await page.locator('.story').getAttribute('data-node-id');visited.push(before)
    const acquisition=page.getByRole('dialog',{name:/を受け取った/})
    if(await acquisition.count())await acquisition.getByRole('button',{name:'OK',exact:true}).click()
    else{await page.locator('.dialogue-button .next').waitFor();await page.locator('.dialogue-button').click()}
    await page.waitForFunction(value=>document.querySelector('.story')?.getAttribute('data-node-id')!==value,before)
   }
   assert.equal(await page.locator('.story').getAttribute('data-node-id'),id)
   return visited
  }
  const labels=()=>page.locator('.command-panel .command-name').allTextContents()
  await restore({...run.checkpoints.find(point=>point.phase==='P1-04').state,nodeId:'P1-05-menu'})
  await choose('話す');await choose('高瀬　あかり')
  assert.deepEqual(await labels(),['調査の進め方','調査の範囲','戻る'])
  await choose('調査の進め方');assert.ok((await readTo('P1-05-speak-akari')).includes('p1-request-to-materials'))
  assert.deepEqual(await labels(),['兄の写真','戻る'])
  await choose('兄の写真');await readTo('P1-05-speak-akari')
  assert.deepEqual(await labels(),['兄の写真','連絡先','戻る'])
  await choose('連絡先');assert.ok((await readTo('P1-05-speak-akari')).includes('p1-materials-to-farewell'))
  assert.deepEqual(await labels(),['帰ってきたら','お見送り','戻る'])
  if(process.env.SAEKI_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/part1-farewell-${width}.png`})
  await choose('お見送り');await readTo('P1-06-menu')
  assert.equal(await page.locator('.chapter-title-card').count(),0)
  await restore({...run.checkpoints.find(point=>point.phase==='P1-07-RETURN').state,nodeId:'P1-08-REPORT-intro'})
  await readTo('P1-08-REPORT-menu');await choose('話す');await choose('相澤　澪')
  assert.deepEqual(await labels(),['会社で分かったこと','戻る'])
  await choose('会社で分かったこと');await readTo('P1-08-REPORT-speak-mio')
  await choose('ビルで見たもの');await readTo('P1-08-REPORT-speak-mio')
  assert.deepEqual(await labels(),['会社で分かったこと','ビルで見たもの','あかりへの伝え方','次に確かめること','戻る'])
  if(process.env.SAEKI_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/part1-return-report-${width}.png`})
  await choose('次に確かめること');await readTo('P1-08-REPORT-end')
  assert.match(await page.locator('.chapter-title-card').textContent(),/依頼と初動.*終/)
  assert.match(await page.locator('.story').textContent(),/14:30/)
  await page.getByLabel('メニュー',{exact:true}).click();await page.getByRole('button',{name:'セーブ',exact:true}).click()
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('detective-saeki-minato.save.v1')))
  assert.equal(saved.flags.part1_completed,true)
  for(const id of ['E02','F36','F41','F42'])assert.equal(saved.acquiredInformation.includes(id),false,id)
  if(process.env.SAEKI_SCREENSHOT_DIR){await page.getByLabel('メニュー',{exact:true}).click();await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/part1-new-ending-${width}.png`})}
  assert.deepEqual(errors,[])
 }finally{await browser.close()}
})
