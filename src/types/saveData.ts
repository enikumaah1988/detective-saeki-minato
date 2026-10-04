import type { GameState } from './gameState'

export type SaveDataV1 = {
  version: 1
  scenarioId: string
  nodeId: string
}

// 対応バージョンを増やす際は、ここにバージョン別の型を追加する。
export type SaveData = SaveDataV1

export type LoadFailureReason =
  | 'invalid-format'
  | 'unsupported-version'
  | 'unknown-scenario'
  | 'unknown-node'

export type LoadResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: LoadFailureReason }
