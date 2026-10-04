import test from 'node:test'
import assert from 'node:assert/strict'
import { demoScenario } from '../src/data/scenario/demo.ts'
import { getNode, transition } from '../src/features/story/progression.ts'

const advance = (id) => transition(demoScenario, id, { type: 'advance' })
const choose = (id, choiceId) => transition(demoScenario, id, { type: 'choose', choiceId })

test('開始から会話を進め、両方の分岐を通って終了する', () => {
  const reply = advance(demoScenario.start)
  assert.equal(getNode(demoScenario, reply).speaker, '相澤澪')
  const decision = advance(reply)
  assert.equal(getNode(demoScenario, decision).type, 'choice')
  const listen = choose(decision, 'listen')
  const coffee = choose(decision, 'coffee')
  assert.notEqual(getNode(demoScenario, listen).text, getNode(demoScenario, coffee).text)
  for (const branch of [listen, coffee]) {
    const end = advance(advance(branch))
    assert.equal(getNode(demoScenario, end).type, 'end')
    assert.equal(advance(end), end)
  }
})

test('選択肢は次へで飛ばせず、無効な操作も進行しない', () => {
  const decision = advance(advance(demoScenario.start))
  assert.equal(advance(decision), decision)
  assert.equal(choose(decision, 'unknown'), decision)
  assert.equal(choose(demoScenario.start, 'coffee'), demoScenario.start)
})

test('すべての遷移先が存在する', () => {
  getNode(demoScenario, demoScenario.start)
  for (const node of Object.values(demoScenario.nodes)) {
    if (node.type === 'dialogue') getNode(demoScenario, node.next)
    if (node.type === 'choice') {
      assert.ok(node.options.length > 0)
      assert.equal(new Set(node.options.map((option) => option.id)).size, node.options.length)
      for (const option of node.options) getNode(demoScenario, option.next)
    }
  }
})
