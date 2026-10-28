import test from 'node:test'
import assert from 'node:assert/strict'
import { MESSAGE_SPEEDS, loadMessageSpeed, saveMessageSpeed } from '../src/features/story/settings.ts'

test('4速度は同じ既存キーで保存・読込できる', () => {
  const values = new Map()
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } })
  try {
    assert.equal(loadMessageSpeed(), 35)
    for (const speed of MESSAGE_SPEEDS) {
      saveMessageSpeed(speed)
      assert.equal(values.get('detective-saeki-minato.speed'), String(speed))
      assert.equal(loadMessageSpeed(), speed)
    }
    saveMessageSpeed(999)
    assert.equal(loadMessageSpeed(), 0)
  } finally { if (original) Object.defineProperty(globalThis, 'localStorage', original); else delete globalThis.localStorage }
})

test('未知値は35、Number変換で受理していた既存値の扱いは維持する', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  try {
    for (const [raw, expected] of [[null, 35], ['999', 35], ['bad', 35], ['NaN', 35], ['Infinity', 35], ['-1', 35], ['', 0], [' 15 ', 15], ['35.0', 35]]) {
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => raw } })
      assert.equal(loadMessageSpeed(), expected, String(raw))
    }
  } finally { if (original) Object.defineProperty(globalThis, 'localStorage', original); else delete globalThis.localStorage }
})

test('storage取得・読込・保存の拒否を外へ投げず、既定値へ戻る', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const denied = () => { throw new Error('denied') }
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get: denied })
    assert.equal(loadMessageSpeed(), 35)
    assert.doesNotThrow(() => saveMessageSpeed(15))
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: denied, setItem: denied } })
    assert.equal(loadMessageSpeed(), 35)
    assert.doesNotThrow(() => saveMessageSpeed(70))
  } finally { if (original) Object.defineProperty(globalThis, 'localStorage', original); else delete globalThis.localStorage }
})
