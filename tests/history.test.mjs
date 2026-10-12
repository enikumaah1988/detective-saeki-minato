import test from 'node:test'
import assert from 'node:assert/strict'
import { saveHistory, loadHistory, MAX_HISTORY_ENTRIES } from '../src/features/story/history.ts'
test('500件を超える全編の履歴を保存・復元し、別位置へは混ぜない', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis,'localStorage'), values = new Map()
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)}})
  try {
    const full = Array.from({length:1000},(_,index)=>({speaker:'湊',text:`会話${index}`,nodeId:`dialogue-${index}`}))
    saveHistory('episode','end',full); assert.deepEqual(loadHistory('episode','end'),full)
    assert.deepEqual(loadHistory('episode','different'),[])
    const repeated = Array.from({length:MAX_HISTORY_ENTRIES+5},(_,index)=>({speaker:'',text:`再聴取${index}`,nodeId:`line-${index}`}))
    saveHistory('episode','end',repeated); assert.deepEqual(loadHistory('episode','end'),repeated.slice(5))
  } finally { if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage }
})
