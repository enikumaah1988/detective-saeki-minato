import test from 'node:test'
import assert from 'node:assert/strict'
const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5187'
for (const [width,height] of [[1920,1080],[1366,768]]) test(`灰色の証言 改訂版4部 実プレイ ${width}×${height}`, {skip:!playwrightPath}, async()=>{
 const {chromium}=await import(playwrightPath)
 const browser=await chromium.launch({headless:true})
 const page=await browser.newPage({viewport:{width,height}})
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 const menu=page.getByLabel('メニュー',{exact:true})
 const choose=async name=>{await page.getByRole('button',{name:name.replace(/未実行$|NEW$/u,''),exact:false}).click();await page.waitForTimeout(180)}
 const imageCheck=async()=>{await page.waitForFunction(()=>[...document.querySelectorAll('.character-image')].every(img=>img.complete&&img.naturalWidth>0))}
 const screenshot=async name=>{if(process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/${name}-${width}.png`})}
 const read=async()=>{
  for(let i=0;i<300;i++){
   const acquisition=page.getByRole('dialog',{name:'高瀬直人の写真を受け取った',exact:true})
   if(await acquisition.count()) { await screenshot('photo-received'); await acquisition.getByRole('button',{name:'OK',exact:true}).click();await page.waitForTimeout(30);continue }
   const b=page.locator('.story-content .dialogue-button')
   if(!await b.count())break
   await b.click();await page.waitForTimeout(20)
  }
  assert.equal(await page.locator('.story-content .dialogue-button').count(),0)
 }
 const save=async()=>{await menu.click();await page.getByRole('button',{name:'セーブ',exact:true}).click();await menu.click();return page.evaluate(()=>JSON.parse(localStorage.getItem('detective-saeki-minato.save.v1')))}
 const load=async()=>{await menu.click();await page.getByRole('button',{name:'ロード',exact:true}).click();const dialog=page.getByRole('dialog',{name:'ロードしました',exact:true});await dialog.waitFor();await page.keyboard.press('Escape');assert.equal(await dialog.count(),1);await dialog.getByRole('button',{name:'OK',exact:true}).click();assert.equal(await page.locator('.save-controls[open]').count(),0)}
 const ask=async name=>{await choose('聞く');await choose(name);await read()}
 const inspect=async name=>{await choose('調べる');await choose(name);await read()}
 const travel=async name=>{await choose('移動');assert.equal(await page.locator('.story-toolbar').count(),0);await choose(`${name}を選択`);await choose('ここへ移動 ›');await page.waitForTimeout(350);await read()}
 try{
  await page.goto(baseUrl.split('?')[0]);await page.evaluate(()=>document.fonts.ready)
  await imageCheck();assert.equal(await page.locator('[data-character-id="akari"]').count(),0)
  const narratorTop=await page.locator('.dialogue').evaluate(el=>el.getBoundingClientRect().top)
  await screenshot('opening')
  await page.locator('.dialogue-button').click();await page.locator('.dialogue-button').click();await page.waitForTimeout(25)
  const speakerTop=await page.locator('.dialogue').evaluate(el=>el.getBoundingClientRect().top)
  assert.ok(Math.abs(narratorTop-speakerTop)<2)
  await menu.click();await page.getByLabel('メッセージスピード',{exact:true}).selectOption('0');await menu.click()
  await read();await imageCheck();await screenshot('akari-interview')
  await choose('聞く')
  assert.equal(await page.getByRole('button',{name:/最後の朝・連絡・勤務先/}).count(),0)
  await choose('最後の朝未実行');const midway=await save();assert.equal(midway.acquiredInformation.includes('morning'),false)
  await read();assert.equal((await save()).acquiredInformation.includes('morning'),true)
  await page.evaluate(value=>localStorage.setItem('detective-saeki-minato.save.v1',JSON.stringify(value)),midway)
  await load();await read()
  await ask('連絡を試したこと未実行');await ask('勤務先未実行')
  await choose('会話履歴');const history=page.getByRole('dialog',{name:'会話履歴',exact:true});assert.match(await history.textContent(),/月曜日/);await history.getByRole('button',{name:'閉じる',exact:true}).click()
  await ask('捜索の依頼について')
  const accepted=await save();assert.ok(accepted.acquiredInformation.includes('search-photo'))
  await page.getByRole('button',{name:'調査記録',exact:true}).click();await page.getByRole('button',{name:'高瀬直人',exact:true}).click();assert.match(await page.locator('.record-detail').textContent(),/UNKNOWN/)
  await page.getByRole('tab',{name:'持ち物',exact:true}).click();await page.getByRole('button',{name:'高瀬直人の写真',exact:true}).click();await screenshot('inventory');await choose('使用する');await read()
  await choose('整理する');await read();const beforeMap=await save();assert.equal(beforeMap.flags.part1_completed,true)
  await choose('移動');await screenshot('travel-map');await page.keyboard.press('Escape');assert.equal((await save()).nodeId,beforeMap.nodeId)
  await travel('東成ビルサービス');await ask('休暇記録と面会申込み未実行');await ask('黒田部長との面会');await ask('直人との面会未実行')
  await travel('成子坂共同ビル');await ask('昨日の直人と伝言未実行');await inspect('管理日誌NEW');await inspect('階段と出入口NEW');await ask('当時の事故説明を確認NEW');await inspect('預かった封筒NEW')
  await travel('佐伯探偵事務所');await choose('整理する');await read()
  await choose('仕事中に突然巻き込まれた');await read();assert.equal(await page.getByRole('button',{name:'休暇を取り、面会へ向かった',exact:true}).count(),1)
  await choose('休暇を取り、面会へ向かった');await choose('二年前の事故の本当の説明');await choose('何も見ていないと言った兄が、真相を求めている');await read()
  await travel('成子坂共同ビル');await imageCheck();await ask('黒田との面会と、当時の目撃未実行');await ask('今回、帰れなくなった理由NEW');await ask('目撃した位置と書類NEW');await choose('整理する');await read()
  await inspect('報告書の原本と控え未実行');await ask('宮原が見た動作NEW');await inspect('二人の位置を現場図で照合NEW');await choose('整理する');await read();await screenshot('reasoning')
  await choose('鍵の日誌・受領原本・直人の目撃');await choose('宮原が見た背中を押す動作');await choose('退出先と直後の人物目撃の位置、その接触の文書');await read()
  assert.match(await page.locator('.end-window').textContent(),/灰色の証言/)
  const end=await save();assert.equal(end.nodeId,'episode-complete');assert.equal(end.flags.part4_completed,true)
  await page.reload();await load();assert.match(await page.locator('.end-window').textContent(),/灰色の証言/)
  assert.deepEqual(errors,[])
  console.log(JSON.stringify({viewport:[width,height],end:end.nodeId,information:end.acquiredInformation,fullEpisode:true}))
 } finally{await browser.close()}
})
