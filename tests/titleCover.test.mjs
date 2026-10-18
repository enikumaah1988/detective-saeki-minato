import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultTitleCover, episodeTitleCovers, resolveTitleCover } from '../src/data/titleCover.ts'

test('扉絵はノード専用、話専用、共通の順で選び、未知の話も共通へ戻る', () => {
  for (const id of ['gray-testimony-ver001-part1', 'future-episode', 'toString', '__proto__']) {
    assert.equal(resolveTitleCover(id), defaultTitleCover)
  }
  episodeTitleCovers['future-episode'] = '/future-cover.png'
  try {
    assert.equal(resolveTitleCover('future-episode'), '/future-cover.png')
    assert.equal(resolveTitleCover('future-episode', '/node-cover.png'), '/node-cover.png')
    assert.equal(resolveTitleCover('future-episode', ''), '/future-cover.png')
  } finally { delete episodeTitleCovers['future-episode'] }
})
