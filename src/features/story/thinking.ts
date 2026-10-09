import type { GameState } from '../../types/gameState'
import type { ScenarioNode } from '../../types/scenario'

// 仮シナリオの必須情報だけを整理する。推理ルールや解放状態は持たない。
export function resolveThinking(node: Extract<ScenarioNode, { type: 'think' }>, state: GameState): Extract<ScenarioNode, { type: 'dialogue' }> {
  const known = node.requiredInformation.filter((info) => state.acquiredInformation.includes(info.id))
  const missing = node.requiredInformation.filter((info) => !state.acquiredInformation.includes(info.id))
  const reaction = missing.length === 0 ? node.complete
    : state.acquiredInformation.length === 0 ? node.insufficient : node.partial
  const text = reaction === node.partial
    ? `${reaction.text}\n分かっていること：${known.length ? known.map((info) => info.summary).join('、') : '判断に必要な材料はまだ確認できていない'}。\n不足していること：${missing.map((info) => info.summary).join('、')}。`
    : reaction.text
  return { type: 'dialogue', stage: node.stage, speakerId: node.speakerId, text, next: reaction.next }
}
