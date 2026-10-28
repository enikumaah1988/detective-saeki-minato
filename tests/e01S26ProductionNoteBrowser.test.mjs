import test from 'node:test'
import assert from 'node:assert/strict'
import { loadEpisode,playEpisode } from './e01EpisodeHarness.mjs'
const path=process.env.SAEKI_PLAYWRIGHT_PATH
const base=(process.env.SAEKI_PART1_URL??'http://127.0.0.1:5187/').split('?')[0]
for(const [width,height]of [[1920,1080],[1366,768]])test(`S26旧冒頭保存から注記・重複なしで本文とS27へ復帰 ${width}`,{skip:!path,timeout:90000},async()=>{
  const api=await loadEpisode(),whole=playEpisode(api)
  const before=whole.states.find(state=>state.nodeId==='S26-intro'),source=api.source.find(scene=>scene.id==='S26')
  const {chromium}=await import(path),browser=await chromium.launch(),page=await browser.newPage({viewport:{width,height}})
  const errors=[];page.on('pageerror',error=>errors.push(error.message))
  const current=()=>page.locator('.story').getAttribute('data-node-id')
  try{
    for(const nodeId of ['S26-intro','S26-intro-1']){
      const initial={...before,nodeId},run=playEpisode(api,{state:initial}),displayed=[]
      await page.goto(base)
      await page.evaluate(({data,note})=>{
        localStorage.setItem('detective-saeki-minato.speed','0')
        localStorage.setItem('detective-saeki-minato.slots.v1',JSON.stringify({version:1,auto:null,manual:[{data,label:'S26旧位置',savedAt:'',history:[{nodeId:'S26-intro',speaker:'',text:note}]}]}))
      },{data:api.createSaveData(initial),note:source.body[0].text})
      await page.reload()
      await page.getByRole('button',{name:'CONTINUE',exact:true}).click()
      await page.getByRole('dialog',{name:'CONTINUE',exact:true}).getByRole('button',{name:'SAVE １',exact:true}).click()
      await page.waitForFunction(id=>document.querySelector('.story')?.dataset.nodeId===id,nodeId)
      await page.evaluate(()=>document.fonts.ready)
      assert.doesNotMatch(await page.locator('.story').textContent(),/S25の再聴取|警察内部の情報|プレイヤーの整理/)
      assert.equal(await page.locator('.speaker').textContent(),'相澤　澪')
      await page.getByLabel('会話履歴を開く',{exact:true}).click()
      const history=page.getByRole('dialog',{name:'会話履歴',exact:true})
      assert.doesNotMatch(await history.textContent(),/S25の再聴取|警察内部の情報/)
      assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('detective-saeki-minato.slots.v1')).manual[0].history[0].text),source.body[0].text)
      await history.getByRole('button',{name:'閉じる',exact:true}).click()
      for(const [index,operation]of run.operations.entries()){
        if(operation.before==='S27-intro')break
        assert.equal(await current(),operation.before)
        if(operation.action.type==='choose'){
          const choices=api.visibleChoices(api.scenario.nodes[operation.before],run.states[index])
          await page.locator('.command-panel button').nth(choices.findIndex(option=>option.id===operation.action.choiceId)).click()
        }else{
          const pages=new Map()
          for(let count=0;count<20&&await current()===operation.before;count++){
            await page.locator('.dialogue-button .next').waitFor()
            pages.set(await page.locator('.dialogue-button').getAttribute('data-page'),await page.locator('.dialogue .sr-only').textContent())
            await page.locator('.dialogue-button').click();await page.waitForTimeout(25)
          }
          displayed.push({nodeId:operation.before,text:[...pages.values()].join('')})
        }
        await page.waitForFunction(id=>document.querySelector('.story')?.dataset.nodeId===id,operation.after)
      }
      assert.deepEqual(displayed.filter(line=>line.nodeId.startsWith('S26-intro')).map(line=>line.text),source.body.slice(1).map(line=>line.text))
      assert.ok(!displayed.some(line=>/警察内部の情報|プレイヤーの整理/.test(line.text)))
      assert.equal(await current(),'S27-intro')
    }
    assert.deepEqual(errors,[])
  }finally{await browser.close()}
})
