import { test, expect } from '@playwright/test'
import { loadEpisode, playEpisode } from '../e01EpisodeHarness.mjs'
import { start, step, capture, command, press, save, restore } from './episode-player.mjs'
let api
test.beforeAll(async () => { api = await loadEpisode() })

test('S01段階解放と澪の任意会話・一人称・地図から12階受付と宮原まで', async ({ page }, info) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await start(page)
  const run = playEpisode(api)
  for (const [index, op] of run.operations.entries()) {
    if (op.before === 'S01-menu') break
    await step(page, op, run.states[index], api)
  }
  let state = run.states.find(s => s.nodeId === 'S01-menu')
  const act = async action => {
    const after = api.reduceGameState(api.scenario, state, action)
    expect(after.nodeId).not.toBe(state.nodeId)
    await step(page, { before: state.nodeId, after: after.nodeId, action }, state, api)
    state = after
  }
  const choose = id => act({ type: 'choose', choiceId: id })
  const read = async () => {
    for (let count = 0; api.scenario.nodes[state.nodeId].type === 'dialogue'; count++) {
      expect(count).toBeLessThan(80)
      await act({ type: 'advance' })
    }
  }
  const labels = expected => expect(page.locator('nav .command-name')).toHaveText(expected)
  const person = async id => {
    await expect(page.locator('.character')).toHaveCount(1)
    await expect(page.locator('.character')).toHaveAttribute('data-character-id', id)
    await expect(page.locator('.character')).toHaveClass(/character--center/)
  }
  await person('akari')
  await expect(page.locator('.character')).toHaveAttribute('data-expression', 'worried')
  await choose('speak')
  await labels(['高瀬　あかり', '相澤　澪', '戻る'])
  await choose('mio')
  await person('mio')
  await labels(['聞き取りについて', '戻る'])
  const before = await save(page)
  await choose('S01-mio-interview')
  await read()
  const after = await save(page)
  expect(after.data.flags).toEqual(before.data.flags)
  expect(after.data.acquiredInformation).toEqual(before.data.acquiredInformation)
  await choose('return')
  await choose('akari')
  await labels(['最後に会ったとき', '戻る'])
  await choose('S01-last-seen')
  await read()
  await labels(['最後に会ったとき', '直人の仕事', '最近の様子', '戻る'])
  await expect(command(page, '直人の仕事').locator('.item-status')).toHaveText('NEW')
  await choose('S01-recent')
  await read()
  await labels(['最後に会ったとき', '直人の仕事', '最近の様子', '家族について', '戻る'])
  await choose('S01-work')
  await read()
  await labels(['最後に会ったとき', '直人の仕事', '最近の様子', '家族について', '連絡先・交友関係', '戻る'])
  const checkpoint = state
  await save(page)
  await choose('return')
  await restore(page, checkpoint.nodeId)
  state = checkpoint
  await choose('S01-last-seen')
  await read()
  await labels(['最後に会ったとき', '直人の仕事', '最近の様子', '家族について', '連絡先・交友関係', '戻る'])
  await choose('return')
  await choose('mio')
  await labels(['聞き取りについて', '勤務先について', 'これからのこと', '戻る'])
  for (const id of ['S01-mio-work', 'S01-mio-next']) { await choose(id); await read() }
  await capture(page, info, 'mio-optional-topics')
  await choose('return')
  await choose('return')
  await expect(command(page, '依頼を受ける')).toBeVisible()
  await expect(command(page, '続ける')).toHaveCount(0)
  await capture(page, info, 'accept-request')
  await choose('proceed')
  await read()
  await person('mio')
  await choose('move')
  await read()
  expect(state.nodeId).toBe('S02-travel-map')
  await expect(page.locator('.character')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '佐伯探偵事務所（現在地）', exact: true })).toBeVisible()
  // Selecting a pin and cancelling does not move the player or grant information.
  await press(page, page.getByRole('button', { name: '東成ビルサービスを選択', exact: true }))
  await page.keyboard.press('Escape')
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', 'S02-menu')
  state = { ...state, nodeId: 'S02-menu' }
  await choose('move'); await read()
  await choose('company')
  await capture(page, info, 'company-exterior')
  await choose('enter')
  await choose('move')
  await expect(command(page, '12Fに移動')).toHaveCount(0)
  // Return from the pre-unlock room list through the exterior to the lobby.
  await choose('return'); await choose('enter')
  await choose('look'); await choose('S02-tenant-list'); await read()
  await choose('return'); await choose('move')
  await expect(command(page, '12Fに移動')).toBeVisible()
  const lobby = state, slot = await save(page)
  await choose('reception')
  await restore(page, lobby.nodeId)
  state = lobby
  expect((await save(page)).data).toEqual(slot.data)
  // CONTINUE must restore the same new node and its floor-unlock state.
  await page.reload()
  await press(page, page.getByRole('button', { name: 'CONTINUE', exact: true }))
  await press(page, page.getByRole('dialog', { name: 'CONTINUE', exact: true }).getByRole('button', { name: 'SAVE １', exact: true }))
  await expect(page.locator('.story')).toHaveAttribute('data-node-id', lobby.nodeId)
  await choose('reception')
  await expect(page.locator('.command-heading')).toHaveText('１２階受付')
  await capture(page, info, 'company-reception')
  await choose('lounge')
  await person('miyahara')
  await read()
  await choose('speak')
  await labels(['宮原　文雄', '戻る'])
  await choose('miyahara')
  await labels(['月曜の作業', '捜索範囲', '直人の性格', '藤井', '戻る'])
  await capture(page, info, 'miyahara-conversation')
  expect(errors).toEqual([])
})
