import type { GameState } from '../../types/gameState'
import type { Scenario } from '../../types/scenario'
import { getNode, transition } from './progression'
import type { StoryAction } from './progression'
import { createSaveData, restoreSaveData } from './saveData'

export type GameAction = StoryAction | { type: 'reset' } | { type: 'restore'; state: GameState }

export function createInitialState(scenario: Scenario): GameState {
  getNode(scenario, scenario.start)
  return { scenarioId: scenario.id, nodeId: scenario.start }
}

export function selectCurrentNode(scenario: Scenario, state: GameState) {
  if (state.scenarioId !== scenario.id) {
    throw new Error('ゲーム状態とシナリオの ID が一致しません')
  }
  return getNode(scenario, state.nodeId)
}

export function reduceGameState(scenario: Scenario, state: GameState, action: GameAction): GameState {
  selectCurrentNode(scenario, state)
  if (action.type === 'reset') return createInitialState(scenario)
  if (action.type === 'restore') {
    const result = restoreSaveData(createSaveData(action.state), [scenario])
    return result.ok ? result.state : state
  }
  const nodeId = transition(scenario, state.nodeId, action)
  return nodeId === state.nodeId ? state : { ...state, nodeId }
}
