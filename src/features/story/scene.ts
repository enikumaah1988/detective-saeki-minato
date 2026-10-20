import type { Scenario, Stage } from '../../types/scenario'

// シーンIDはノードに明示するため、履歴の保存なしにロード位置を復元できる。
export function selectSceneStage(scenario: Scenario, nodeId: string): Stage {
  const node = scenario.nodes[nodeId]
  let stage = node.stage
  if (node.sceneId) {
    const scene = scenario.scenes?.[node.sceneId]
    if (!scene) throw new Error(`シーンが見つかりません: ${node.sceneId}`)
    const { smokingAllowed: _smokingAllowed, ...sceneStage } = scene
    stage = sceneStage
  }
  if (node.type !== 'dialogue' || !node.expressions) return stage
  // 人物の追加・位置・表示条件はシーンに任せ、指定された表情だけを上書きする。
  return { ...stage, characters: stageCharacters(stage).map(person => ({
    ...person, expression: node.expressions?.[person.characterId] ?? person.expression,
  })) }
}

export function stageCharacters(stage: Stage) {
  const characters = stage.characters ?? (stage.characterId
    ? [{ characterId: stage.characterId, expression: stage.expression ?? 'normal', position: stage.characterPosition }]
    : [])
  return characters.map(character => ({ ...character,
    position: character.position ?? 'right',
  }))
}
