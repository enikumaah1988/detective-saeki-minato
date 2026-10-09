import type { GameState } from './gameState'

export type SaveDataV1 = {
  version: 1
  scenarioId: string
  nodeId: string
}

// 対応バージョンを増やす際は、ここにバージョン別の型を追加する。
export type SaveDataV2 = GameState & { version: 2 }
export type SaveData = SaveDataV1 | SaveDataV2

export type LoadFailureReason =
  | 'invalid-format'
  | 'unsupported-version'
  | 'unknown-scenario'
  | 'unknown-node'

export type LoadResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: LoadFailureReason }
