import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from './viteServer.mjs'

let TravelMap, point, size
before(async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    ;({ TravelMap } = await server.ssrLoadModule('/src/features/story/TravelMap.tsx'))
    const geometry = await server.ssrLoadModule('/src/features/story/travelMapGeometry.ts')
    point = geometry.travelMapPoint; size = geometry.travelMapSize
  } finally { await server.close() }
})
test('実地理の参照点と架空の会社の設定位置を使用する', () => {
  assert.ok(Math.abs(point('office').left - 51.2632) < .001)
  assert.ok(Math.abs(point('office').top - 31.7105) < .001)
  assert.ok(Math.abs(point('building').left - 27.0105) < .001)
  assert.ok(Math.abs(point('police').top - 46.4969) < .001)
  assert.ok(point('company').left > 39 && point('company').left < 40)
  assert.ok(point('company').top > 52 && point('company').top < 53)
  assert.equal(point('takase-home'), undefined)
  assert.deepEqual(size(900,650), { width:975, height:650 })
  assert.deepEqual(size(1200,600), { width:1200, height:800 })
})
test('解放済みの場所だけを表示し、現在地と会社の選択を維持する', () => {
  const html = renderToStaticMarkup(createElement(TravelMap, {
    current:'office', options:[{id:'company',label:'東成ビルサービス',next:'arrival'}], onBack(){}, onMove(){},
  }))
  assert.match(html,/nishi-shinjuku-geographic-05\.png/)
  assert.match(html,/<h1>移動先を選択<\/h1><p>西新宿周辺<\/p>/)
  assert.doesNotMatch(html,/<footer|調査エリア案内図|現在地：/)
  assert.match(html,/佐伯探偵事務所（現在地）/)
  assert.equal((html.match(/travel-destination travel-pin/g)??[]).length,2)
  assert.doesNotMatch(html,/travel-area-place|アイランド/)
  assert.match(html,/東成ビルサービスを選択/)
  assert.doesNotMatch(html,/成子坂共同ビルを選択|西新宿警察署を選択/)
  assert.doesNotMatch(html,/上が北|travel-attribution|openstreetmap\.org/)
})
