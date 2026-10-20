import test from 'node:test'
import assert from 'node:assert/strict'
import { displayText } from '../src/features/story/displayText.ts'

test('数字の表示だけを全角化し、漢数字・記号・結合文字を保持する', () => {
  const text = '10月8日 14:30／第1話・2年前・35歳・100%・二人・一日・か\u3099👨‍👩‍👧‍👦'
  const result = '１０月８日 １４:３０／第１話・２年前・３５歳・１００%・二人・一日・か\u3099👨‍👩‍👧‍👦'
  assert.equal(displayText(text), result)
  assert.equal(displayText(result), result)
  assert.equal(text.includes('14:30'), true)
})

test('Episode番号は半角の指定表記を保ち、日時・部番号は全角化する', () => {
  assert.equal(displayText('Episode 01　灰色の証言 — 第1部 10月8日'), 'Episode 01　灰色の証言 — 第１部 １０月８日')
})
