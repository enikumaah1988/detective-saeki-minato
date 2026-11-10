import type { GameState } from '../../types/gameState'
import type { Choice, Condition, ScenarioNode, StateUpdate } from '../../types/scenario'

export function matchesCondition(state: GameState, condition?: Condition): boolean {
  if (!condition) return true
  switch (condition.type) {
    case 'not': return !matchesCondition(state, condition.condition)
    case 'any': return condition.conditions.some(item => matchesCondition(state, item))
    case 'all': return condition.conditions.every(item => matchesCondition(state, item))
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
  { id: 'speak', label: '話す', implemented: true },
  { id: 'look', label: '調べる', implemented: true },
  { id: 'investigate', label: '調べる', implemented: false },
  { id: 'think', label: '考える', implemented: true },
  { id: 'organize', label: '整理する', implemented: false },
  { id: 'move', label: '移動', implemented: false },
  { id: 'proceed', label: '続ける', implemented: false },
] as const

export function isFreeAction(node: ScenarioNode) {
  return node.type === 'choice' && node.mode === 'free-action'
}

export function visibleChoices(node: ScenarioNode, state: GameState) {
  if (!('options' in node)) return []
  const selectable = node.options.filter((option) => option.implemented !== false && matchesCondition(state, option.condition))
    .map(option => option.labelWhen && matchesCondition(state, option.labelWhen.condition) ? { ...option, label: option.labelWhen.label } : option)
  if (node.type === 'topic' || node.type === 'inspect') {
    const topics = selectable.filter(option => option.id !== 'return')
    if (node.type === 'topic' && node.appendUnlockedTopics && node.selection !== 'person') {
      // 取得情報の順序から解放時点を復元する。新しい保存項目や時刻には依存しない。
      const prefixes = Array.from({ length: state.acquiredInformation.length + 1 }, (_, length) => ({ ...state, acquiredInformation: state.acquiredInformation.slice(0, length) }))
      const rank = new Map(topics.map(option => [option.id, prefixes.findIndex(prefix => matchesCondition(prefix, option.condition))]))
      topics.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0))
    }
    return [...topics, { id: 'return', label: '戻る', next: node.parent.nodeId }]
  }
  if (!isFreeAction(node)) return selectable
  // 必須情報が揃ったら思考を次フェーズへの単独トリガーにする。
  if (node.type === 'choice' && !node.keepQuestions && selectable.some(option => option.id === 'think')) {
    return selectable.filter(option => option.id === 'think').map(option => ({ ...option, label: '考える' }))
  }
  const order = ['look', 'speak', 'investigate', 'talk', 'think', 'organize', 'move', 'proceed']
  const currentRevision = node.type === 'choice' && node.implementedCommands?.includes('investigate')
  const commands = currentRevision ? [...FREE_ACTION_COMMANDS].sort((a,b) => order.indexOf(a.id)-order.indexOf(b.id)) : FREE_ACTION_COMMANDS
  return commands.flatMap((command) => {
    if (!(node.type === 'choice' && node.implementedCommands ? node.implementedCommands.includes(command.id) : command.implemented)) return []
    const option = selectable.find((candidate) => candidate.id === command.id)
    return option ? [{ ...option, label: currentRevision || command.id === 'proceed' ? option.label : command.label }] : []
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
  if (node.type === 'topic' && node.selection === 'person') return undefined
  const progressId = option.progressId ?? option.id
  const done = node.type === 'topic' ? state.heardTopics.includes(progressId)
    : node.type === 'inspect' ? state.inspectedTargets.includes(progressId) : undefined
  return done === undefined ? undefined : done ? (node.type === 'topic' ? '既読' : '調査済み')
    : option.condition ? 'NEW' : '未実行'
}

export function menuTitle(node: ScenarioNode, state?: GameState) {
  return node.type === 'topic' || node.type === 'inspect'
    ? state && node.headingWhen && matchesCondition(state, node.headingWhen.condition) ? node.headingWhen.heading : node.heading ?? FREE_ACTION_COMMANDS.find(command => command.id === node.parent.commandId)?.label : undefined
}

export function emptyContinuation(node: ScenarioNode, state: GameState) {
  return node.type === 'choice' && isFreeAction(node) && visibleChoices(node, state).length === 0 ? node.empty : undefined
}
