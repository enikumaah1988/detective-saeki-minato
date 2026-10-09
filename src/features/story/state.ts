import type { GameState } from '../../types/gameState'
import type { Scenario } from '../../types/scenario'
import { getNode, transition } from './progression'
import type { StoryAction } from './progression'
import { applyUpdates, visibleChoices } from './freeAction'
import { SAVE_DATA_VERSION, restoreSaveData } from './saveData'
import { resolveThinking } from './thinking'

export type GameAction = StoryAction | { type: 'reset' } | { type: 'restore'; state: GameState }

export function createInitialState(scenario: Scenario): GameState {
  getNode(scenario, scenario.start)
  return { scenarioId: scenario.id, nodeId: scenario.start, flags: {}, heardTopics: [], inspectedTargets: [], acquiredInformation: [] }
}

export function selectCurrentNode(scenario: Scenario, state: GameState) {
  if (state.scenarioId !== scenario.id) {
    throw new Error('ゲーム状態とシナリオの ID が一致しません')
  }
  const node = getNode(scenario, state.nodeId)
  return node.type === 'think' ? resolveThinking(node, state) : node
}

export function reduceGameState(scenario: Scenario, state: GameState, action: GameAction): GameState {
  const node = selectCurrentNode(scenario, state)
  if (action.type === 'reset') return createInitialState(scenario)
  if (action.type === 'restore') {
    const result = restoreSaveData({ ...action.state, version: SAVE_DATA_VERSION }, [scenario])
    return result.ok ? result.state : state
  }
  if (node.type === 'choice' || node.type === 'topic' || node.type === 'inspect') {
    if (action.type !== 'choose') return state
    const option = visibleChoices(node, state).find((item) => item.id === action.choiceId)
    if (!option) return state
    getNode(scenario, option.next)
    return { ...applyUpdates(state, option.updates ?? []), nodeId: option.next }
  }
  const nodeId = node.type === 'dialogue' && action.type === 'advance'
    ? node.next : transition(scenario, state.nodeId, action)
  getNode(scenario, nodeId)
  return nodeId === state.nodeId ? state : { ...applyUpdates(state, node.type === 'dialogue' ? node.updates ?? [] : []), nodeId }
}
