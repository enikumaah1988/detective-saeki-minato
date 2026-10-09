import type { GameState } from '../../types/gameState'
import type { Choice, Condition, ScenarioNode, StateUpdate } from '../../types/scenario'

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

// 順序と実装有無は進行側で管理し、通常の分岐IDとは区別する。
export const FREE_ACTION_COMMANDS = [
  { id: 'talk', label: '聞く', implemented: true },
  { id: 'look', label: '調べる', implemented: true },
  { id: 'think', label: '考える', implemented: true },
  { id: 'organize', label: '整理する', implemented: false },
  { id: 'move', label: '移動', implemented: false },
] as const

export function isFreeAction(node: ScenarioNode) {
  return node.type === 'choice' && node.mode === 'free-action'
}

export function visibleChoices(node: ScenarioNode, state: GameState) {
  if (!('options' in node)) return []
  const selectable = node.options.filter((option) => option.implemented !== false && matchesCondition(state, option.condition))
  if (node.type === 'topic' || node.type === 'inspect') {
    return [...selectable.filter(option => option.id !== 'return'), { id: 'return', label: '戻る', next: node.parent.nodeId }]
  }
  if (!isFreeAction(node)) return selectable
  return FREE_ACTION_COMMANDS.flatMap((command) => {
    if (!command.implemented) return []
    const option = selectable.find((candidate) => candidate.id === command.id)
    return option ? [{ ...option, label: command.label }] : []
  })
}

export function applyUpdates(state: GameState, updates: StateUpdate[]): GameState {
  return updates.reduce((current, update) => {
    if (update.type === 'setFlag') return { ...current, flags: { ...current.flags, [update.id]: update.value } }
    const field = update.type === 'addHeardTopic' ? 'heardTopics'
      : update.type === 'addInspectedTarget' ? 'inspectedTargets' : 'acquiredInformation'
    return current[field].includes(update.id) ? current : { ...current, [field]: [...current[field], update.id] }
  }, state)
}

// ラベル・項目ID・実行済みID・可否は別々に扱う。UIはこの結果を描画するだけ。
export function choiceStatus(node: ScenarioNode, option: Choice, state: GameState): string | undefined {
  if (option.id === 'return') return undefined
  const progressId = option.progressId ?? option.id
  const done = node.type === 'topic' ? state.heardTopics.includes(progressId)
    : node.type === 'inspect' ? state.inspectedTargets.includes(progressId) : undefined
  return done === undefined ? undefined : done ? (node.type === 'topic' ? '既読' : '調査済み')
    : option.condition ? 'NEW' : '未実行'
}

export function menuTitle(node: ScenarioNode) {
  return node.type === 'topic' || node.type === 'inspect'
    ? FREE_ACTION_COMMANDS.find(command => command.id === node.parent.commandId)?.label : undefined
}

export function emptyContinuation(node: ScenarioNode, state: GameState) {
  return node.type === 'choice' && isFreeAction(node) && visibleChoices(node, state).length === 0 ? node.empty : undefined
}
