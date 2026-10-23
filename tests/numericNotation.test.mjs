import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { revisionData } from '../src/data/scenario/revisionData.ts'
import { episodePrologue } from '../src/data/scenario/episodePrologue.ts'
import { displayText } from '../src/features/story/displayText.ts'

function messages(value) {
  if (Array.isArray(value)) return value.flatMap(messages)
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([key, child]) => key === 'text' && typeof child === 'string' ? [child] : messages(child))
}
const texts = messages(revisionData)
const scene = id => revisionData.scenes.find(value => value.id === id)

test('第1話の明確な日時・年齢・所在地・階数はアラビア数字、表示幅は既存仕様を保つ', () => {
  const all = [...texts, ...episodePrologue].join('\n')
  assert.doesNotMatch(all, /五日|三日|七時半|二十九|八つ違います|西新宿[六七]丁目|十二階|一階|二年前|十月|四時半|十時|午後一時|二年も前/)
  for (const phrase of ['5日の朝', '今日で3日', '7時半ごろ', '29です。私とは8つ違います。', '西新宿6丁目', '12階', '1階', '2年前の10月', '4時半', '10時', '午後1時', '2年も前']) assert.ok(all.includes(phrase), phrase)
  assert.equal(displayText('Episode 01／5日 7時半／29歳／12階／2年前の10月'), 'Episode 01／５日 ７時半／２９歳／１２階／２年前の１０月')
  assert.ok(episodePrologue[3].includes('西新宿7丁目'))
})

test('固有名詞・慣用語・判断を留保した関係性や間合いの表現は維持する', () => {
  const all = texts.join('\n')
  for (const phrase of ['三崎健です。', '一杯で終われば', '数字を一つ読み違え', '一桁ずつ', '一度だけ膝の上で握る', 'もう一度確かめて', 'お一人で全部説明', '兄と二人か？', '二人で決めたんだな。', '一緒に考えよう。']) assert.ok(all.includes(phrase), phrase)
  assert.ok(episodePrologue[0].includes('一人の会社員'))
})

test('数字表記は現行組込元JSONと第3〜4部の原稿JSONにも同期する', async () => {
  const directory = new URL('../docs/02-story/episode-01/', import.meta.url)
  const files = ['第1話_第1部共同改稿_組込データ_ver0.04.json', '第1話_改稿_ver0.03_第3部.json', '第1話_改稿_ver0.03_第4部.json']
  for (const file of files) {
    const source = JSON.parse(await readFile(new URL(file, directory), 'utf8'))
    for (const phase of source.scenes) {
      const current = messages(scene(phase.id))
      const quantitative = messages(phase).filter(text => /5日|3日|7時半|29です|8つ違います|2年前|10月|4時半|10時|午後1時|2年も前/.test(text))
      for (const text of quantitative) assert.ok(current.includes(text), `${file} ${phase.id}: ${text}`)
    }
  }
})
