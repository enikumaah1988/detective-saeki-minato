import test from 'node:test'
import assert from 'node:assert/strict'
import {loadRevision,buildPlaythrough} from './revisionHarness.mjs'
const path=process.env.SAEKI_PLAYWRIGHT_PATH,url=process.env.SAEKI_PART1_URL??'http://127.0.0.1:5187/'
for(const [width,height]of [[1920,1080],[1366,768]])test(`統合会話の継続・電話表示・会話中の資料使用 ${width}`,{skip:!path},async()=>{
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
   for(let n=0;n<35&&await page.locator('.story').getAttribute('data-node-id')!==id;n++){
    const before=await page.locator('.story').getAttribute('data-node-id')
    await page.locator('.dialogue-button .next').waitFor();await page.locator('.dialogue-button').click()
    await page.waitForFunction(value=>document.querySelector('.story')?.getAttribute('data-node-id')!==value,before)
   }
   assert.equal(await page.locator('.story').getAttribute('data-node-id'),id)
  }
  const point=run.checkpoints.find(p=>p.phase==='P1-02').state
  await restore({...point,nodeId:'P1-03-menu'})
  assert.equal(await page.locator('.free-action-panel .command-name').filter({hasText:'聞く'}).count(),0)
  await choose('話す');await choose('高瀬　あかり')
  const labels=()=>page.locator('.command-panel .command-name').allTextContents()
  assert.deepEqual(await labels(),['帰らなくなった日','最後の朝','連絡','戻る'])
  for(const label of ['最後の朝','連絡','帰らなくなった日']){await choose(label);await readTo('P1-03-speak-akari')}
  assert.deepEqual(await labels(),['勤務先','ほかに捜したところ','戻る'])
  for(const label of ['勤務先','会社へ聞いたこと','ほかに捜したところ','警察への相談']){await choose(label);await readTo('P1-03-speak-akari')}
  assert.deepEqual(await labels(),['兄の年齢','普段の連絡','一緒に暮らす家族','相談内容の確認','戻る'])
  if(process.env.SAEKI_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/akari-staged-topics-${width}.png`})
  await choose('相談内容の確認');await readTo('P1-04-menu')
  await restore({...run.checkpoints.find(p=>p.phase==='P3-03').state,nodeId:'P3-03-speak-people'})
  assert.match(await page.locator('.command-panel').textContent(),/相澤　澪（電話）/)
  await restore({...run.checkpoints.find(p=>p.phase==='P2-03').state,nodeId:'P2-03-speak-kuroda'})
  await page.getByRole('button',{name:'調査記録',exact:true}).click();await page.getByRole('tab',{name:'持ち物',exact:true}).click()
  await page.getByRole('button',{name:'高瀬　直人の写真',exact:true}).click();await page.getByRole('button',{name:'使用する',exact:true}).click()
  await readTo('P2-03-speak-kuroda')
  assert.deepEqual(errors,[])
 }finally{await browser.close()}
})

