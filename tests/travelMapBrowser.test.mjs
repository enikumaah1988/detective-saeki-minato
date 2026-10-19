import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const url = (process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5194/').split('?')[0]
for (const [width,height] of [[1920,1080],[1366,768]]) test(`実地理マップの座標・リサイズ・現在地・移動・取消 ${width}`, {skip:!path}, async () => {
  const {chromium} = await import(path)
  const browser = await chromium.launch(process.env.SAEKI_BROWSER_PATH ? {executablePath:process.env.SAEKI_BROWSER_PATH} : {})
  const page = await browser.newPage({viewport:{width,height}})
  const errors=[];page.on('pageerror',error=>errors.push(error.message))
  const api=await loadRevision(), run=buildPlaythrough(api,true)
  const initial={...run.checkpoints.find(p=>p.phase==='P2-01').state,nodeId:'P2-01-map'}
  const loadMap=async state=>{
    await page.goto(url)
    await page.evaluate(data=>localStorage.setItem('detective-saeki-minato.slots.v1',JSON.stringify({version:1,auto:null,manual:[{data,label:'地図検証',savedAt:'2026-10-19T00:00:00.000Z',history:[]}]})),api.createSaveData(state))
    await page.getByRole('button',{name:'CONTINUE',exact:true}).click()
    await page.getByRole('button',{name:'SAVE １',exact:true}).click()
    await page.locator('.travel-map').waitFor()
    await page.waitForFunction(()=>{const image=document.querySelector('.travel-map-image');return image?.complete&&image.naturalWidth===2400})
  }
  const verifyAlignment=async()=>{
    await page.waitForFunction(()=>{
      const img=document.querySelector('.travel-map-image')?.getBoundingClientRect()
      const viewport=document.querySelector('.travel-map-viewport')?.getBoundingClientRect()
      if(!img||!viewport)return false
      const scale=Math.max(viewport.width/2400,viewport.height/1600)
      return Math.abs(img.width-2400*scale)<.5&&Math.abs(img.height-1600*scale)<.5
    })
    const image=await page.locator('.travel-map-image').boundingBox()
    const pin=await page.getByRole('button',{name:'佐伯探偵事務所（現在地）',exact:true}).boundingBox()
    assert.ok(Math.abs(pin.x+pin.width/2-(image.x+image.width*.512632))<1)
    assert.ok(Math.abs(pin.y+pin.height/2-(image.y+image.height*.317105))<1)
    const viewport=await page.locator('.travel-map-viewport').boundingBox()
    assert.ok(image.x<=viewport.x+.5 && image.y<=viewport.y+.5)
    assert.ok(image.x+image.width>=viewport.x+viewport.width-.5)
    assert.ok(image.y+image.height>=viewport.y+viewport.height-.5)
    assert.equal(await page.locator('.travel-attribution').count(),0)
    assert.doesNotMatch(await page.locator('.travel-map').textContent(),/上が北|OpenStreetMap/)
    assert.equal(await page.locator('.travel-map h1').textContent(),'移動先を選択')
    assert.equal(await page.locator('.travel-map header p').textContent(),'西新宿周辺')
    assert.equal(await page.locator('.travel-map footer').count(),0)
    assert.doesNotMatch(await page.locator('.travel-map').textContent(),/調査エリア案内図|現在地：/)
    const menu=await page.getByLabel('メニュー',{exact:true}).boundingBox()
    const heading=await page.locator('.travel-map header').boundingBox()
    assert.ok(heading.y>=menu.y+menu.height+8,'Map heading clears enlarged MENU')
  }
  try {
    await loadMap(initial)
    await verifyAlignment()
    assert.equal(await page.locator('.travel-area-place').count(),0)
    assert.equal(await page.locator('.travel-map-surface .travel-pin').count(),2)
    assert.doesNotMatch(await page.locator('.travel-map').textContent(),/アイランド/)
    await page.getByRole('button',{name:'佐伯探偵事務所（現在地）',exact:true}).click()
    assert.equal(await page.getByRole('button',{name:'現在地',exact:true}).isDisabled(),true)
    await page.getByRole('button',{name:'東成ビルサービスを選択',exact:true}).click()
    assert.match(await page.locator('aside[aria-label="選択した場所"]').textContent(),/西新宿六丁目のオフィスビル/)
    const companyImage=await page.locator('.travel-map-image').boundingBox()
    const companyPin=await page.getByRole('button',{name:'東成ビルサービスを選択',exact:true}).boundingBox()
    assert.ok(Math.abs(companyPin.x+companyPin.width/2-(companyImage.x+companyImage.width*.3973684211))<1)
    assert.ok(Math.abs(companyPin.y+companyPin.height/2-(companyImage.y+companyImage.height*.52493648))<1)
    assert.equal(await page.locator('.story').getAttribute('data-node-id'),'P2-01-map')
    if(process.env.SAEKI_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/map-company-${width}.png`})
    await page.setViewportSize({width:width===1920?1366:1920,height:width===1920?768:1080})
    await verifyAlignment()
    await page.keyboard.press('Escape')
    assert.equal(await page.locator('.story').getAttribute('data-node-id'),'P2-01-outside')
    await page.setViewportSize({width,height})
    await loadMap(initial)
    await page.getByRole('button',{name:'東成ビルサービスを選択',exact:true}).click()
    await page.getByRole('button',{name:'ここへ移動 ›',exact:true}).click()
    await page.locator('.travel-map').waitFor({state:'hidden'})
    const expected=api.reduceGameState(api.scenario,initial,{type:'choose',choiceId:'company'})
    assert.equal(await page.locator('.story').getAttribute('data-node-id'),expected.nodeId)
    const buildingState={...run.checkpoints.find(p=>p.phase==='P4-05').state,nodeId:'P4-05-map'}
    await loadMap(buildingState)
    const buildingPin=page.getByRole('button',{name:'成子坂共同ビル（現在地）',exact:true})
    await buildingPin.click()
    assert.equal(await buildingPin.getAttribute('aria-pressed'),'true')
    const image=await page.locator('.travel-map-image').boundingBox()
    for(const [name,left,top]of [['成子坂共同ビル（現在地）',.270105,.2441],['西新宿警察署を選択',.449058,.464969]]){
      const pin=await page.getByRole('button',{name,exact:true}).boundingBox()
      assert.ok(Math.abs(pin.x+pin.width/2-(image.x+image.width*left))<1)
      assert.ok(Math.abs(pin.y+pin.height/2-(image.y+image.height*top))<1)
    }
    if(process.env.SAEKI_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SAEKI_SCREENSHOT_DIR}/map-building-${width}.png`})
    assert.deepEqual(errors,[])
  } finally {await browser.close()}
})
