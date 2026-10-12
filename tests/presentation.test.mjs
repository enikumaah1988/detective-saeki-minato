import { stageCharacters } from '../src/features/story/scene.ts'
import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveBackground, resolveCharacter, resolveExpression, resolveSpeakerName } from '../src/data/presentation.ts'
import { demoScenario } from '../src/data/scenario/demo.ts'

test('登録済み話者・背景・人物・表情を解決する', () => {
  assert.equal(resolveSpeakerName('minato'), '佐伯湊')
  assert.equal(resolveSpeakerName('mio'), '相澤澪')
  assert.equal(resolveBackground('office-afternoon').name, '佐伯探偵事務所')
  assert.equal(resolveCharacter('minato').id, 'minato')
  assert.equal(resolveExpression('minato', 'serious').name, '真剣')
  assert.equal(resolveExpression('mio', 'normal').name, '通常')
})

test('未登録 ID とオブジェクトの組み込み名も安全に解決する', () => {
  for (const id of ['unknown', '', 'toString', '__proto__']) {
    assert.equal(resolveBackground(id).name, '未登録の背景')
    assert.equal(resolveCharacter(id).name, '未登録の人物')
    assert.equal(resolveSpeakerName(id), '未登録の人物')
    assert.equal(resolveExpression('minato', id).name, '未登録の表情')
    assert.equal(resolveExpression(id, 'normal').name, '未登録の表情')
  }
})

test('画像未設定でも有効な表示情報があり、未登録表情は画像なしで戻る', () => {
  assert.equal(resolveBackground('unknown').imageSrc, undefined)
  assert.equal(resolveExpression('unknown', 'normal').imageSrc, undefined)
  assert.equal(resolveExpression('minato', 'unknown').imageSrc, undefined)
})

test('仮シナリオの全 ID が登録済みで、シナリオに画像パスは含まれない', () => {
  for (const node of Object.values(demoScenario.nodes)) {
    assert.notEqual(resolveBackground(node.stage.backgroundId).name, '未登録の背景')
    for (const person of stageCharacters(node.stage)) {
      assert.notEqual(resolveCharacter(person.characterId).name, '未登録の人物')
      assert.notEqual(resolveExpression(person.characterId, person.expression).name, '未登録の表情')
    }

    if (node.type === 'dialogue') assert.notEqual(resolveSpeakerName(node.speakerId), '未登録の人物')
  }
  assert.doesNotMatch(JSON.stringify(demoScenario), /imageSrc|\.(png|jpg|webp|svg)/)
})


test('背景と各表情の画像が存在し、同一人物の表情は別画像を解決する', async () => {
  const { readFile } = await import('node:fs/promises')
  const images = [resolveBackground('office-afternoon').imageSrc,
    resolveExpression('minato', 'normal').imageSrc,
    resolveExpression('minato', 'serious').imageSrc,
    resolveExpression('mio', 'normal').imageSrc]
  assert.equal(new Set(images).size, 4)
  for (const image of images) {
    assert.ok(image)
    const bytes = await readFile(new URL(image))
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  }
})
