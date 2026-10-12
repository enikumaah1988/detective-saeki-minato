import type { GameState } from '../../types/gameState'
import type { Scenario } from '../../types/scenario'
import { getNode, transition } from './progression'
import type { StoryAction } from './progression'
import { applyUpdates, emptyContinuation, visibleChoices, matchesCondition } from './freeAction'
import { SAVE_DATA_VERSION, restoreSaveData } from './saveData'
import { selectSceneStage } from './scene'
import { resolveThinking } from './thinking'

export type GameAction = StoryAction | { type: 'use-item'; itemId: string } | { type: 'continue' } | { type: 'reset' } | { type: 'restore'; state: GameState }

export function createInitialState(scenario: Scenario): GameState {
  getNode(scenario, scenario.start)
  for (const scene of Object.values(scenario.scenes ?? {})) {
    const people = scene.characters ?? []
    if (people.length > 2 || new Set(people.map(person => person.characterId)).size !== people.length) throw new Error('シーンの人物構成が不正です')
    if (people.length === 2 && (people.some(person => !person.position || person.position === 'center') || new Set(people.map(person => person.position)).size !== 2)) throw new Error('2人シーンは左右を明示してください')
  }
  for (const node of Object.values(scenario.nodes)) {
    if (node.sceneId && !scenario.scenes?.[node.sceneId]) throw new Error(`シーンが見つかりません: ${node.sceneId}`)
    if (node.type === 'choice' && node.mode === 'free-action') {
      if (!node.empty || !node.empty.label.trim()) throw new Error('Free Actionには0件時の進行先が必要です')
      getNode(scenario, node.empty.next)
      if (scenario.nodes[node.empty.next].type !== 'dialogue') throw new Error('0件時は会話へ復帰してください')
    }
    if (node.type === 'topic' || node.type === 'inspect') {
      const parent = getNode(scenario, node.parent.nodeId)
      if (parent.type !== 'choice' || parent.mode !== 'free-action') throw new Error('サブメニューの親が不正です')
    }
  }
  return { scenarioId: scenario.id, nodeId: scenario.start, flags: {}, heardTopics: [], inspectedTargets: [], acquiredInformation: [] }
}

export function selectCurrentNode(scenario: Scenario, state: GameState) {
  if (state.scenarioId !== scenario.id) {
    throw new Error('ゲーム状態とシナリオの ID が一致しません')
  }
  const definition = getNode(scenario, state.nodeId)
  const node = { ...definition, stage: selectSceneStage(scenario, state.nodeId) }
  return node.type === 'think' ? resolveThinking(node, state) : node
}

export function reduceGameState(scenario: Scenario, state: GameState, action: GameAction): GameState {
  const node = selectCurrentNode(scenario, state)
  if (action.type === 'reset') return createInitialState(scenario)
  if (action.type === 'restore') {
    const result = restoreSaveData({ ...action.state, version: SAVE_DATA_VERSION }, [scenario])
    return result.ok ? result.state : state
  }
  if (action.type === 'use-item') {
    const use = scenario.itemUses?.find(use => use.itemId === action.itemId && use.nodeIds.includes(state.nodeId) && matchesCondition(state, use.condition))
    return use ? { ...state, nodeId: use.next } : state
  }
  if (node.type === 'choice' || node.type === 'topic' || node.type === 'inspect') {
    if (action.type === 'continue') {
      const continuation = emptyContinuation(node, state)
      if (!continuation) return state
      getNode(scenario, continuation.next)
      return { ...state, nodeId: continuation.next }
    }
    if (action.type !== 'choose') return state
    const option = visibleChoices(node, state).find((item) => item.id === action.choiceId)
    if (!option) return state
    const progressId = option.progressId ?? option.id
    const next = option.repeatNext && (node.type === 'topic' ? state.heardTopics.includes(progressId) : state.inspectedTargets.includes(progressId)) ? option.repeatNext : option.next
    getNode(scenario, next)
    // 戻るには更新を適用しない。next/updatesを改ざんした項目でも親指定を優先する。
    const returning = (node.type === 'topic' || node.type === 'inspect') && option.id === 'return'
    return { ...applyUpdates(state, returning ? [] : option.updates ?? []), nodeId: next }
  }
  if (action.type === 'continue') return state
  const nodeId = node.type === 'dialogue' && action.type === 'advance'
    ? node.next : transition(scenario, state.nodeId, action)
  getNode(scenario, nodeId)
  if (nodeId === state.nodeId) return state
  let updated = applyUpdates(state, node.type === 'dialogue' ? node.updates ?? [] : [])
  for (const milestone of scenario.milestones ?? []) {
    if (milestone.required.every(id => updated.acquiredInformation.includes(id))) updated = applyUpdates(updated, [{ type: 'addInformation', id: milestone.id }])
  }
  return { ...updated, nodeId }
}
