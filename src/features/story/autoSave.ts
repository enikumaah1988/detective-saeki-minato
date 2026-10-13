import type { Scenario } from '../../types/scenario'
import type { GameState } from '../../types/gameState'
export function savePhase(scenario: Scenario, state: GameState): string | undefined {
  const node=scenario.nodes[state.nodeId]
  return node.savePhaseId ? `${node.savePhaseId}:${(node.savePhaseMarkers??[]).filter(id=>state.acquiredInformation.includes(id)).join(',')}` : undefined
}
