import type { Scenario, Stage } from '../../types/scenario'

// シーンIDはノードに明示するため、履歴の保存なしにロード位置を復元できる。
export function selectSceneStage(scenario: Scenario, nodeId: string): Stage {
  const node = scenario.nodes[nodeId]
  if (node.sceneId) {
    const scene = scenario.scenes?.[node.sceneId]
    if (!scene) throw new Error(`シーンが見つかりません: ${node.sceneId}`)
    const { smokingAllowed: _smokingAllowed, ...stage } = scene
    return stage
  }
  return node.stage // 旧形式のローカルシナリオも読める。
}

export function stageCharacters(stage: Stage) {
  const characters = stage.characters ?? (stage.characterId
    ? [{ characterId: stage.characterId, expression: stage.expression ?? 'normal', position: stage.characterPosition }]
    : [])
  return characters.map(character => ({ ...character,
    position: character.position ?? (character.characterId === 'minato' ? 'left' : 'right'),
  }))
}
