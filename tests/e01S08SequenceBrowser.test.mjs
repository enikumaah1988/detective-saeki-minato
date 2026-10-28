import test from 'node:test'
import assert from 'node:assert/strict'
import { loadEpisode,playEpisode } from './e01EpisodeHarness.mjs'
const path=process.env.SAEKI_PLAYWRIGHT_PATH
const base=(process.env.SAEKI_PART1_URL??'http://127.0.0.1:5187/').split('?')[0]
for(const [width,height]of [[1920,1080],[1366,768]])test(`S08実表示の安全確保・案内・地下への移動と戻る ${width}`,{skip:!path,timeout:90000},async()=>{
  const api=await loadEpisode(),whole=playEpisode(api)
  const ready=whole.states.find(state=>state.nodeId==='S08-menu'),run=playEpisode(api,{state:ready})
  const {chromium}=await import(path),browser=await chromium.launch(),page=await browser.newPage({viewport:{width,height}})
  const errors=[],displayed=[];page.on('pageerror',error=>errors.push(error.message))
  const current=()=>page.locator('.story').getAttribute('data-node-id')
  const choose=async(state,id)=>{
    const options=api.visibleChoices(api.scenario.nodes[state.nodeId],state)
    await page.locator('.command-panel button').nth(options.findIndex(option=>option.id===id)).click()
  }
  try{
    await page.goto(base)
    await page.evaluate(data=>{
      localStorage.setItem('detective-saeki-minato.speed','0')
      localStorage.setItem('detective-saeki-minato.slots.v1',JSON.stringify({version:1,auto:null,manual:[{data,label:'S08検証',savedAt:'',history:[]}]}))
    },api.createSaveData(ready))
    await page.reload()
    await page.getByRole('button',{name:'CONTINUE',exact:true}).click()
    await page.getByRole('dialog',{name:'CONTINUE',exact:true}).getByRole('button',{name:'SAVE １',exact:true}).click()
    await page.waitForFunction(id=>document.querySelector('.story')?.dataset.nodeId===id,ready.nodeId)
    await page.evaluate(()=>document.fonts.ready)
    for(const [index,operation]of run.operations.entries()){
      if(operation.before==='S09-intro')break
      const state=run.states[index]
      assert.equal(await current(),operation.before)
      if(operation.before==='S08-route'){
        await choose(state,'return')
        await page.waitForFunction(()=>document.querySelector('.story')?.dataset.nodeId==='S08-menu')
        const back=api.reduceGameState(api.scenario,state,{type:'choose',choiceId:'return'})
        const route=api.visibleChoices(api.scenario.nodes[back.nodeId],back).find(option=>option.next==='S08-route')
        await choose(back,route.id)
        await page.waitForFunction(()=>document.querySelector('.story')?.dataset.nodeId==='S08-route')
        assert.match(await page.locator('.scene-context').textContent(),/１０月８日.*朝/)
      }
      if(operation.action.type==='choose')await choose(state,operation.action.choiceId)
      else{
        const before=operation.before,pages=new Map()
        for(let count=0;count<20&&await current()===before;count++){
          await page.locator('.dialogue-button .next').waitFor()
          pages.set(await page.locator('.dialogue-button').getAttribute('data-page'),await page.locator('.dialogue .sr-only').textContent())
          await page.locator('.dialogue-button').click();await page.waitForTimeout(25)
        }
        displayed.push({nodeId:before,text:[...pages.values()].join('')})
      }
      await page.waitForFunction(id=>document.querySelector('.story')?.dataset.nodeId===id,operation.after)
      const expected=api.selectCurrentNode(api.scenario,run.states[index+1]).stage.backgroundId
      assert.equal(await page.locator('.stage').getAttribute('data-background-id'),expected)
    }
    const source=api.source.find(scene=>scene.id==='S08')
    const expected=[...source.actions.find(action=>action.id==='発見演出').lines,source.body[7],...source.actions.find(action=>action.id==='移動').lines,...source.body.slice(8)].map(line=>line.text)
    assert.deepEqual(displayed.filter(line=>line.nodeId.startsWith('S08-discovery')||line.nodeId.startsWith('S08-finish')).map(line=>line.text),expected)
    assert.equal(await current(),'S09-intro')
    assert.equal(await page.locator('.stage').getAttribute('data-background-id'),'building-storage-door')
    await page.waitForFunction(()=>document.querySelector('.stage .background-image')?.naturalWidth>0)
    assert.deepEqual(errors,[])
  }finally{await browser.close()}
})
