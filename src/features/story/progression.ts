import type { Scenario, ScenarioNode } from '../../types/scenario'

export type StoryAction = { type: 'advance' } | { type: 'choose'; choiceId: string }

export function getNode(scenario: Scenario, nodeId: string): ScenarioNode {
  const node = scenario.nodes[nodeId]
  if (!node) throw new Error(`シナリオのノードが見つかりません: ${nodeId}`)
  return node
}

export function transition(scenario: Scenario, nodeId: string, action: StoryAction): string {
  const node = getNode(scenario, nodeId)
  let next = nodeId
  if (node.type === 'dialogue' && action.type === 'advance') next = node.next
  if (node.type === 'choice' && action.type === 'choose') {
    next = node.options.find((option) => option.id === action.choiceId)?.next ?? nodeId
  }
  getNode(scenario, next)
  return next
}
