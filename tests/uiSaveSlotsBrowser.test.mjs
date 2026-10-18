import test from 'node:test'
import assert from 'node:assert/strict'
import {loadRevision,buildPlaythrough} from './revisionHarness.mjs'
const path=process.env.SAEKI_PLAYWRIGHT_PATH,url=process.env.SAEKI_PART1_URL??'http://127.0.0.1:5191/'
for(const [width,height] of [[1920,1080],[1366,768]])test(`UI・SAVE3/AUTO1・旧移行・履歴競合・連続音量 ${width}`,{skip:!path},async()=>{
 const api=await loadRevision(),run=buildPlaythrough(api,true),{chromium}=await import(path)
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width,height}}),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 const menu=()=>page.getByLabel('メニュー',{exact:true})
 const node=()=>page.locator('.story').getAttribute('data-node-id')
 const load=async(id='SAVE １')=>{await menu().click();await page.getByRole('button',{name:'LOAD',exact:true}).click();await page.getByRole('dialog',{name:'LOAD',exact:true}).getByRole('button',{name:id,exact:true}).click();await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()}
 try{
  await page.goto(url)
  assert.equal(await page.locator('.scene-selector').count(),0)
  const before=await node();await page.waitForFunction(()=>document.querySelector('.dialogue [aria-hidden]')?.textContent.length>2)
  const text=await page.locator('.dialogue [aria-hidden]').textContent()
  await page.getByRole('button',{name:'会話履歴を開く',exact:true}).click()
  const history=page.getByRole('dialog',{name:'会話履歴',exact:true})
  const pausedText=await page.locator('.dialogue [aria-hidden]').textContent();assert.ok(pausedText.startsWith(text))
  assert.equal(await history.getByRole('button',{name:'閉じる',exact:true}).evaluate(el=>el===document.activeElement),true)
  await page.keyboard.press('Tab');assert.equal(await history.getByRole('button',{name:'閉じる',exact:true}).evaluate(el=>el===document.activeElement),true)
  await page.waitForTimeout(100);assert.equal(await page.locator('.dialogue [aria-hidden]').textContent(),pausedText)
  await page.keyboard.press('Escape');assert.equal(await node(),before)
  assert.equal(await page.getByRole('button',{name:'会話履歴を開く',exact:true}).evaluate(el=>el===document.activeElement),true)
  await menu().click();await page.getByRole('button',{name:'メッセージスピード：一括表示',exact:true}).click()
  await page.getByLabel('BGM音量',{exact:true}).fill('37');await page.getByLabel('SE音量',{exact:true}).fill('63')
  assert.equal(await page.locator('.slider-stops').count(),1)
  await page.getByLabel('BGM音量',{exact:true}).press('ArrowRight')
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('detective-saeki-minato.audio'))),{bgm:38,se:63})
  await menu().click()
  const legacy={...run.checkpoints.find(p=>p.phase==='P1-01').state,nodeId:'P1-01-menu'}
  const raw=JSON.stringify(api.createSaveData(legacy))
  await page.evaluate(value=>{localStorage.setItem('detective-saeki-minato.save.v1',value);localStorage.removeItem('detective-saeki-minato.slots.v1')},raw)
  await load();assert.equal(await node(),'P1-01-menu')
  assert.equal(await page.evaluate(()=>localStorage.getItem('detective-saeki-minato.save.v1')),raw)
  const command=page.locator('.free-action-panel .command-name').first()
  const commandSize=await command.evaluate(el=>getComputedStyle(el).fontSize)
  await page.getByRole('button',{name:'会話履歴を開く',exact:true}).press('Enter')
  await history.getByRole('button',{name:'閉じる',exact:true}).press('Space');assert.equal(await node(),'P1-01-menu')
  // 四回のSAVEで旧枠を押し出しても３枠・v2を維持。SAVE後の別通知なし。
  for(let i=0;i<4;i++){
   await menu().click();await page.getByRole('button',{name:'SAVE',exact:true}).click()
   await page.getByRole('dialog',{name:'セーブしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
   assert.equal(await page.locator('.save-controls[open]').count(),0);assert.equal(await page.locator('.save-panel [role=status]').count(),0)
  }
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('detective-saeki-minato.slots.v1')).manual.length),3)
  const choose=async label=>{const old=await node();await page.locator('.command-panel button').filter({has:page.locator('.command-name',{hasText:new RegExp('^'+label+'$')})}).click();await page.waitForFunction(id=>document.querySelector('.story').dataset.nodeId!==id,old)}
  await choose('見る')
  const back=page.locator('.command-name',{hasText:/^戻る$/})
  assert.equal(await back.evaluate(el=>getComputedStyle(el).fontSize),commandSize)
  assert.equal(await back.locator('..').locator('.ui-icon').count(),1)
  await choose('帳簿')
  while(await page.locator('.dialogue-button').count()){await page.locator('.dialogue-button .next').waitFor();await page.locator('.dialogue-button').click()}
  assert.equal(await node(),'P1-02-menu')
  const auto=await page.evaluate(()=>JSON.parse(localStorage.getItem('detective-saeki-minato.slots.v1')).auto)
  assert.ok(auto);assert.equal(auto.data.version,2)
  await choose('話す')
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('detective-saeki-minato.slots.v1')).auto.savedAt),auto.savedAt)
  await load('AUTO');assert.equal(await node(),auto.data.nodeId)
  const checkpoint=run.checkpoints.find(p=>p.phase==='P2-06').state
  const dialogueId=Object.entries(api.scenario.nodes).find(([id,n])=>!api.scenario.saveNodeAliases?.[id]&&n.type==='dialogue'&&!n.illustration&&!n.acquisition&&n.sceneId===api.scenario.nodes[checkpoint.nodeId].sceneId)?.[0]
  assert.ok(dialogueId)
  const point={...checkpoint,nodeId:dialogueId}
  await page.evaluate(data=>localStorage.setItem('detective-saeki-minato.slots.v1',JSON.stringify({version:1,auto:null,manual:[{data,savedAt:'',label:'test',history:[]}]})),api.createSaveData(point))
  await load()
  await page.getByRole('button',{name:'調査記録',exact:true}).click()
  assert.equal(await page.locator('.record-list button').first().evaluate(el=>getComputedStyle(el).fontSize),commandSize)
  await page.getByLabel('調査記録を閉じる',{exact:true}).click()
  const bounds=await page.locator('.scene-context').boundingBox(),toolbar=await page.locator('.toolbar-actions').boundingBox()
  assert.ok(bounds.x>=toolbar.x+toolbar.width);assert.ok(bounds.x+bounds.width<=width&&bounds.y>=0)
  const size=await page.locator('.scene-context').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));assert.ok(Math.abs(size-36*width/1920)<1)
  if(process.env.SAEKI_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/ui-save-slots-${width}.png`})
  await page.reload();await menu().click();assert.equal(await page.getByLabel('BGM音量',{exact:true}).inputValue(),'38')
  await page.goto(url+(url.includes('?')?'&':'?')+'dev=1');assert.ok(await page.locator('.scene-selector').count()>0)
  assert.deepEqual(errors,[])
 }finally{await browser.close()}
})
