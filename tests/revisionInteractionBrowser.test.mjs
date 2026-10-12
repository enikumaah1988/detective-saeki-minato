import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRevision, buildPlaythrough } from './revisionHarness.mjs'
const playwrightPath = process.env.SAEKI_PLAYWRIGHT_PATH
const baseUrl = (process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5187').split('?')[0]
for (const [width, height] of [[1920,1080],[1366,768]]) test(`読了時の記録更新・持ち物の使用先選択 ${width}`, { skip: !playwrightPath }, async () => {
  const api = await loadRevision(), run = buildPlaythrough(api)
  const { chromium } = await import(playwrightPath), browser = await chromium.launch(), page = await browser.newPage({ viewport: { width,height } })
  try {
    await page.addInitScript(() => localStorage.setItem('detective-saeki-minato.speed','0'))
    await page.goto(baseUrl)
    const restore = async state => {
      await page.evaluate(value => localStorage.setItem('detective-saeki-minato.save.v1', JSON.stringify(value)), api.createSaveData(state))
      await page.getByLabel('メニュー', {exact:true}).click(); await page.getByRole('button', {name:'ロード',exact:true}).click()
      await page.getByRole('dialog', {name:'ロードしました',exact:true}).getByRole('button', {name:'OK',exact:true}).click()
    }
    const before = run.checkpoints.find(point => point.phase === 'P1-01').state
    const namingId = Object.keys(api.scenario.nodes).find(id => id.startsWith('p1-visitor') && api.scenario.nodes[id].updates?.some(update => update.type === 'addInformation' && update.id === 'named-akari'))
    assert.ok(namingId)
    await restore({...before,nodeId:namingId})
    await page.getByRole('button',{name:'調査記録',exact:true}).click()
    assert.equal(await page.getByRole('button',{name:'高瀬あかり',exact:true}).count(),0)
    await page.getByRole('button',{name:'調査記録を閉じる',exact:true}).click()
    await page.locator('.dialogue-button').click()
    await page.getByRole('button',{name:'調査記録',exact:true}).click()
    assert.equal(await page.getByRole('button',{name:'高瀬あかり',exact:true}).count(),1)
    await page.getByRole('button',{name:'調査記録を閉じる',exact:true}).click()
    const checkpoint = run.checkpoints.find(point => point.phase === 'P4-04').state
    await restore(checkpoint)
    await page.getByRole('button',{name:'調査記録',exact:true}).click(); await page.getByRole('tab',{name:'持ち物',exact:true}).click()
    await page.getByRole('button',{name:'現場図',exact:true}).click(); await page.getByRole('button',{name:'使用する',exact:true}).click()
    const selection = page.getByRole('dialog',{name:'使用する相手・目的',exact:true}); await selection.waitFor()
    await selection.getByRole('button',{name:/高瀬直人/}).click()
    assert.equal(await page.locator('.story').getAttribute('data-node-id'),'p4-map-naoto')
    assert.equal(await page.locator('.investigation-records').count(),0)
    const entries = Array.from({length:1000},(_,index)=>({speaker:'湊',text:`履歴${index}`,nodeId:`line-${index}`}))
    await page.evaluate(value=>localStorage.setItem('detective-saeki-minato.history.v1',JSON.stringify(value)),{scenarioId:checkpoint.scenarioId,nodeId:checkpoint.nodeId,entries})
    await restore(checkpoint)
    await page.getByRole('button',{name:'会話履歴',exact:true}).click()
    const history = page.getByRole('dialog',{name:'会話履歴',exact:true})
    assert.equal(await history.locator('article').count(),1000)
    assert.equal(await history.locator('article p').first().textContent(),'履歴0')
    assert.equal(await history.locator('article p').last().textContent(),'履歴999')
    await history.getByRole('button',{name:'閉じる',exact:true}).click()
  } finally { await browser.close() }
})
