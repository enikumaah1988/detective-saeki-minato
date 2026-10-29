import test from 'node:test'
import assert from 'node:assert/strict'
import { loadEpisode } from './e01EpisodeHarness.mjs'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const base = (process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5187/').split('?')[0]
for (const [width,height] of [[1920,1080],[1366,768]]) test(`通常起動は消された記録、混在保存のCONTINUEと旧稿後のNEW GAME ${width}`, { skip: !path, timeout: 90000 }, async () => {
  const api = await loadEpisode(), legacy = api.scenarioCatalog.find(item => item.id === 'gray-testimony-ver001-part1')
  const save = (scenario,nodeId) => api.createSaveData({ ...api.createInitialState(scenario), nodeId })
  const slot = data => ({data,savedAt:'2026-10-28T00:00:00Z',label:data.scenarioId,history:[{nodeId:data.nodeId,speaker:'',text:'保存済み履歴'}]})
  const slots = {version:1,auto:slot(save(legacy,'part3-organize')),manual:[slot(save(api.scenario,'S16-menu')),slot(save(legacy,'P1-01-menu')),slot(save(api.firstPart,'S06-end'))]}
  const {chromium}=await import(path), browser=await chromium.launch()
  const page=await browser.newPage({viewport:{width,height}}), errors=[]
  page.on('pageerror',error=>errors.push(error.message))
  const current=()=>page.locator('.story').getAttribute('data-node-id')
  const returnToTitle=async()=>{
    await page.getByLabel('メニュー',{exact:true}).click()
    await page.getByRole('button',{name:'RETURN TO TITLE',exact:true}).click()
    await page.getByRole('dialog',{name:'タイトルに戻りますか？',exact:true}).getByRole('button',{name:'RETURN TO TITLE',exact:true}).click()
    await page.getByRole('region',{name:'タイトル画面',exact:true}).waitFor()
  }
  try{
    await page.goto(base)
    await page.evaluate(value=>{
      localStorage.setItem('detective-saeki-minato.speed','0')
      localStorage.setItem('detective-saeki-minato.slots.v1',JSON.stringify(value))
    },slots)
    await page.reload()
    assert.match(await page.locator('.title-screen-episode').textContent(),/消された記録/)
    assert.doesNotMatch(await page.locator('.title-screen').textContent(),/灰色の証言|全３０シーン/)
    const title=await page.locator('.title-screen-brand').boundingBox(), menu=await page.locator('.title-screen-menu').boundingBox()
    assert.ok(title.y+title.height<menu.y)
    if(process.env.SAEKI_SCREENSHOT_DIR) await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/release-title-${width}.png`})
    await page.getByRole('button',{name:'NEW GAME',exact:true}).click()
    await page.locator('[data-node-id="S01-opening-prologue-1"]').waitFor()
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('detective-saeki-minato.slots.v1'))),slots)
    await returnToTitle()
    for(const [label,entry] of [['SAVE １',slots.manual[0]],['SAVE ２',slots.manual[1]],['SAVE ３',slots.manual[2]],['AUTO',slots.auto]]){
      await page.reload()
      const expected=api.restoreSaveData(entry.data,api.scenarioCatalog)
      assert.equal(expected.ok,true)
      await page.getByRole('button',{name:'CONTINUE',exact:true}).click()
      await page.getByRole('dialog',{name:'CONTINUE',exact:true}).getByRole('button',{name:label,exact:true}).click()
      await page.waitForFunction(id=>document.querySelector('.story')?.dataset.nodeId===id,expected.state.nodeId)
      assert.equal(await current(),expected.state.nodeId)
      assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('detective-saeki-minato.slots.v1'))),slots)
      if(label==='SAVE ２'){
        await returnToTitle()
        assert.match(await page.locator('.title-screen-episode').textContent(),/消された記録/)
        await page.getByRole('button',{name:'NEW GAME',exact:true}).click()
        await page.locator('[data-node-id="S01-opening-prologue-1"]').waitFor()
      }
    }
    // Explicit scenario URLs retain the existing legacy development entry.
    await page.goto(base+'?scenario='+legacy.id)
    await page.getByRole('button',{name:'NEW GAME',exact:true}).click()
    await page.waitForFunction(id=>document.querySelector('.story')?.dataset.nodeId===id,legacy.start)
    assert.deepEqual(errors,[])
  }finally{await browser.close()}
})
