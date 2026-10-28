import test from 'node:test'
import assert from 'node:assert/strict'
import { loadEpisode, playEpisode } from './e01EpisodeHarness.mjs'
const path=process.env.SAEKI_PLAYWRIGHT_PATH
const base=(process.env.SAEKI_PART1_URL??'http://127.0.0.1:5187/').split('?')[0]
for(const [width,height] of [[1920,1080],[1366,768]]) test(`S27実表示の順序・3問再挑戦・旧終了保存 ${width}`,{skip:!path,timeout:120000},async()=>{
  const api=await loadEpisode(), whole=playEpisode(api)
  const ready=whole.states.find(state=>state.nodeId==='S27-menu')
  const run=playEpisode(api,{state:ready,wrong:true})
  const {chromium}=await import(path),browser=await chromium.launch(),page=await browser.newPage({viewport:{width,height}})
  const errors=[],displayed=[];page.on('pageerror',error=>errors.push(error.message))
  const current=()=>page.locator('.story').getAttribute('data-node-id')
  const load=async state=>{
    await page.goto(base)
    await page.evaluate(data=>{
      localStorage.setItem('detective-saeki-minato.speed','0')
      localStorage.setItem('detective-saeki-minato.slots.v1',JSON.stringify({version:1,auto:null,manual:[{data,label:'S27検証',savedAt:'',history:[]}]}))
    },api.createSaveData(state))
    await page.reload()
    await page.getByRole('button',{name:'CONTINUE',exact:true}).click()
    await page.getByRole('dialog',{name:'CONTINUE',exact:true}).getByRole('button',{name:'SAVE １',exact:true}).click()
    await page.waitForFunction(id=>document.querySelector('.story')?.dataset.nodeId===id,state.nodeId)
    await page.evaluate(()=>document.fonts.ready)
  }
  const advance=async()=>{
    const before=await current(), pages=new Map()
    for(let count=0;count<20&&await current()===before;count++){
      await page.locator('.dialogue-button .next').waitFor()
      pages.set(await page.locator('.dialogue-button').getAttribute('data-page'),await page.locator('.dialogue .sr-only').textContent())
      await page.locator('.dialogue-button').click();await page.waitForTimeout(25)
    }
    assert.notEqual(await current(),before)
    return [...pages.values()].join('')
  }
  try{
    await load(ready)
    for(const [index,operation] of run.operations.entries()){
      if(operation.before==='S28-intro')break
      assert.equal(await current(),operation.before)
      if(operation.action.type==='choose'){
        const options=api.visibleChoices(api.scenario.nodes[operation.before],run.states[index])
        await page.locator('.command-panel button').nth(options.findIndex(option=>option.id===operation.action.choiceId)).click()
      }else displayed.push({nodeId:operation.before,text:await advance()})
      await page.waitForFunction(id=>document.querySelector('.story')?.dataset.nodeId===id,operation.after)
    }
    const expected=api.source.find(scene=>scene.id==='S27').body.slice(3).map(line=>line.text)
    assert.deepEqual(displayed.filter(line=>line.nodeId.startsWith('S27-finish')).map(line=>line.text),expected)
    assert.equal(displayed.filter(line=>line.text==='（奥村に電話）').length,1)
    await load({...ready,nodeId:'S27-finish'})
    const restored=[]
    while(await current()!=='S28-intro')restored.push(await advance())
    assert.deepEqual(restored,expected)
    assert.deepEqual(errors,[])
  }finally{await browser.close()}
})
