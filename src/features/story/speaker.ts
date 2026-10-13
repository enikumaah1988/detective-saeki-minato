import type { ScenarioNode } from '../../types/scenario'
import type { GameState } from '../../types/gameState'
import { resolveSpeakerName } from '../../data/presentation'
import { matchesCondition } from './freeAction'
export function dialogueSpeaker(node: Extract<ScenarioNode, { type: 'dialogue' }>, state: GameState) {
  return node.speakerName !== undefined && (!node.speakerNameCondition || !matchesCondition(state, node.speakerNameCondition))
    ? node.speakerName : resolveSpeakerName(node.speakerId)
}
