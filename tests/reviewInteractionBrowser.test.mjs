import test from 'node:test'
import assert from 'node:assert/strict'
import {loadRevision,buildPlaythrough} from './revisionHarness.mjs'
const playwrightPath=process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl=process.env.SAEKI_PART1_URL??'http://127.0.0.1:5187/'
for(const [width,height]of [[1920,1080],[1366,768]])test(`導入と仮扉絵・喫煙背景クリック・現在地の再選択 ${width}`,{skip:!playwrightPath},async()=>{
  const api=await loadRevision(),run=buildPlaythrough(api,true)
  const {chromium}=await import(playwrightPath),browser=await chromium.launch(),page=await browser.newPage({viewport:{width,height}})
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  try{
    await page.addInitScript(()=>localStorage.setItem('detective-saeki-minato.speed','0'))
    await page.goto(baseUrl)
    for(let i=1;i<=4;i++){
      assert.equal(await page.locator('.story').getAttribute('data-node-id'),`episode-prologue-${i}`)
      await page.locator('.dialogue-button .next').waitFor();await page.locator('.stage-input-area').click({position:{x:20,y:200}})
    }
    await page.locator('.chapter-title-card').waitFor()
    assert.match(await page.locator('.chapter-title-card').textContent(),/灰色の証言/)
    if(process.env.SAEKI_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/review-title-${width}.png`})
    const restore=async state=>{
      await page.evaluate(v=>localStorage.setItem('detective-saeki-minato.save.v1',JSON.stringify(v)),api.createSaveData(state))
      await page.getByLabel('メニュー',{exact:true}).click();await page.getByRole('button',{name:'ロード',exact:true}).click()
      await page.getByRole('dialog',{name:'ロードしました',exact:true}).getByRole('button',{name:'OK',exact:true}).click()
    }
    await restore(run.checkpoints.find(p=>p.phase==='P1-01').state)
    const before=await page.locator('.story').getAttribute('data-node-id')
    await page.getByRole('button',{name:'タバコを吸う',exact:true}).click()
    const overlay=page.getByRole('dialog',{name:'喫煙ヒント',exact:true})
    await overlay.locator('.next').waitFor();await overlay.locator('.smoking-cut-in').click({position:{x:20,y:200}})
    await overlay.locator('.next').waitFor();await page.keyboard.press('Enter')
    assert.equal(await overlay.count(),0);assert.equal(await page.locator('.story').getAttribute('data-node-id'),before)
    await restore({...run.checkpoints.find(p=>p.phase==='P2-01').state,nodeId:'P2-01-map'})
    const current=page.getByRole('button',{name:'佐伯探偵事務所（現在地）',exact:true})
    await page.getByRole('button',{name:'東成ビルサービスを選択',exact:true}).click()
    assert.equal(await current.isDisabled(),false)
    await current.click()
    assert.equal(await current.getAttribute('aria-pressed'),'true')
    assert.equal(await page.getByRole('button',{name:'現在地',exact:true}).isDisabled(),true)
    await page.getByRole('button',{name:'東成ビルサービスを選択',exact:true}).click()
    assert.equal(await page.locator('.story').getAttribute('data-node-id'),'P2-01-map')
    await page.getByRole('button',{name:'× 戻る',exact:true}).click()
    assert.equal(await page.locator('.story').getAttribute('data-node-id'),'P2-01-outside')
    assert.deepEqual(errors,[])
  }finally{await browser.close()}
})
