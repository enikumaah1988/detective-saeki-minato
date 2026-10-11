import type { Scenario } from '../../types/scenario'
import type { GameState } from '../../types/gameState'
import { matchesCondition } from './freeAction'

// 表示用の導出だけを行い、進捗や保存データを更新しない。
export function selectSmokingPresentation(scenario: Scenario, state: GameState) {
  const node = scenario.nodes[state.nodeId]
  const allowed = node?.sceneId ? scenario.scenes?.[node.sceneId]?.smokingAllowed === true : false
  const hint = scenario.smokingHints?.rules.find(rule =>
    (!rule.nodeIds || rule.nodeIds.includes(state.nodeId))
    && matchesCondition(state, rule.condition)
    && (!rule.missingInformation || rule.missingInformation.some(id => !state.acquiredInformation.includes(id))))
  return {
    allowed,
    hintId: hint?.id,
    hint: hint?.text ?? scenario.smokingHints?.fallback ?? '今わかっていることを、調査記録で確認してみよう。',
  }
}
