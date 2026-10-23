import type { ScenarioNode } from '../../types/scenario'
import type { GameState } from '../../types/gameState'
import { resolveSpeakerName } from '../../data/presentation'
import { matchesCondition } from './freeAction'
// 制作上の文章種別ラベルは、プレイヤー向けの話者名として表示しない。
// 保存済みの会話履歴にも同じ正規化を適用する。
export function visibleSpeakerName(speaker: string): string {
  return /^(?:地の文|地の文[-－ー・／/]心の声|心の声)$/.test(speaker.trim()) ? '' : speaker
}

export function dialogueSpeaker(node: Extract<ScenarioNode, { type: 'dialogue' }>, state: GameState) {
  const speaker = node.speakerName !== undefined && (!node.speakerNameCondition || !matchesCondition(state, node.speakerNameCondition))
    ? node.speakerName : resolveSpeakerName(node.speakerId)
  return node.speakerId === 'narrator' ? '' : visibleSpeakerName(speaker)
}
