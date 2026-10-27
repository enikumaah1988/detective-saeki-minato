import test from 'node:test'
import assert from 'node:assert/strict'
import { loadEpisode } from './e01EpisodeHarness.mjs'

const path = process.env.SAEKI_PLAYWRIGHT_PATH
const base = (process.env.SAEKI_PART1_URL ?? 'http://127.0.0.1:5187/').split('?')[0]
for (const [width, height] of [[1920,1080],[1366,768]]) test(`BARの杏奈は返答まで表示し、途中v2保存から復元できる ${width}`, { skip: !path, timeout: 60000 }, async () => {
  const api = await loadEpisode()
  const url = new URL(base)
  url.searchParams.set('scenario', api.scenario.id)
  const { chromium } = await import(path), browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width, height } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const current = () => page.locator('.story').getAttribute('data-node-id')
  const anna = () => page.locator('.stage [data-character-id="anna"]')
  try {
    for (const id of ['BAR-A','BAR-B']) {
      const source = api.source.find(scene => scene.id === id)
      const index = source.actions.findIndex(action => action.kind === 'talk' && action.lines.some(line => line.speakerId === 'anna'))
      const start = `${id}-action-${index}`
      // Direct restoration of both the question and Minato's answer must derive the same cast.
      for (const nodeId of [start, api.scenario.nodes[start].next]) {
        await page.goto(url.href)
        await page.evaluate(data => {
          localStorage.setItem('detective-saeki-minato.speed','0')
          localStorage.setItem('detective-saeki-minato.slots.v1', JSON.stringify({version:1,auto:null,manual:[{data,label:'表示復元',savedAt:'',history:[]}]}))
        }, api.createSaveData({ ...api.createInitialState(api.scenario), nodeId }))
        await page.reload()
        await page.getByRole('button',{name:'CONTINUE',exact:true}).click()
        await page.getByRole('dialog',{name:'CONTINUE',exact:true}).getByRole('button',{name:'SAVE １',exact:true}).click()
        await page.waitForFunction(value => document.querySelector('.story')?.dataset.nodeId === value, nodeId)
        assert.equal(await current(), nodeId)
        await page.waitForFunction(() => document.querySelectorAll('.stage .character-silhouette').length === 0 && document.querySelector('.stage [data-character-id="anna"] .character-image')?.naturalWidth > 0)
        assert.equal(await anna().count(),1)
        let before = nodeId
        while (api.scenario.nodes[before].type === 'dialogue') {
          const next = api.scenario.nodes[before].next
          await page.locator('.dialogue-button .next').waitFor()
          await page.locator('.dialogue-button').click()
          await page.waitForFunction(value => document.querySelector('.story')?.dataset.nodeId === value, next)
          assert.equal(await anna().count(), next === `${id}-menu` ? 0 : 1)
          before = next
        }
      }
    }
    assert.deepEqual(errors,[])
  } finally { await browser.close() }
})
