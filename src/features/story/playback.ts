import type { GameState } from '../../types/gameState'
import type { Scenario } from '../../types/scenario'
import { createInitialState, reduceGameState } from './state'
import type { GameAction } from './state'

export type InputOrigin = { nodeId: string; generation: number }
export type PlaybackState = { game: GameState; generation: number; paused: boolean }
export type PlaybackAction =
  | { type: 'input'; origin: InputOrigin; action: GameAction }
  | { type: 'menu'; open: boolean }
  | { type: 'restore'; state: GameState }

export function createPlayback(scenario: Scenario): PlaybackState {
  return { game: createInitialState(scenario), generation: 0, paused: false }
}

// 世代は保存しない。ロードや同じノードへの再訪でも古いイベントを拒否する。
export function reducePlayback(scenario: Scenario, current: PlaybackState, event: PlaybackAction): PlaybackState {
  if (event.type === 'menu') return event.open === current.paused ? current
    : { ...current, paused: event.open, generation: current.generation + 1 }
  if (event.type === 'restore') {
    const game = reduceGameState(scenario, current.game, event)
    return game === current.game ? current : { ...current, game, generation: current.generation + 1 }
  }
  if (current.paused || event.origin.nodeId !== current.game.nodeId || event.origin.generation !== current.generation
    || event.action.type === 'restore') return current
  const game = reduceGameState(scenario, current.game, event.action)
  return game === current.game ? current : { ...current, game, generation: current.generation + 1 }
}

// 一つのメニュー全体で選択演出を排他化する（ボタン単位ではない）。
export class SelectionGate {
  private busy = false
  acquire = () => { if (this.busy) return false; this.busy = true; return true }
  release = () => { this.busy = false }
}
