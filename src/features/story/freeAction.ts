import type { GameState } from '../../types/gameState'
import type { Condition, ScenarioNode, StateUpdate } from '../../types/scenario'

export function matchesCondition(state: GameState, condition?: Condition): boolean {
  if (!condition) return true
  switch (condition.type) {
    case 'flag': return (Object.hasOwn(state.flags, condition.id) ? state.flags[condition.id] : false) === (condition.value ?? true)
    case 'heardTopic': return state.heardTopics.includes(condition.id)
    case 'inspectedTarget': return state.inspectedTargets.includes(condition.id)
    case 'hasInformation': return state.acquiredInformation.includes(condition.id)
    case 'hasAllInformation': return condition.ids.every((id) => state.acquiredInformation.includes(id))
  }
}

export function visibleChoices(node: ScenarioNode, state: GameState) {
  return 'options' in node ? node.options.filter((option) => matchesCondition(state, option.condition)) : []
}

export function applyUpdates(state: GameState, updates: StateUpdate[]): GameState {
  return updates.reduce((current, update) => {
    if (update.type === 'setFlag') return { ...current, flags: { ...current.flags, [update.id]: update.value } }
    const field = update.type === 'addHeardTopic' ? 'heardTopics'
      : update.type === 'addInspectedTarget' ? 'inspectedTargets' : 'acquiredInformation'
    return current[field].includes(update.id) ? current : { ...current, [field]: [...current[field], update.id] }
  }, state)
}
