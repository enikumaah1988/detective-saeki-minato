import type { GameState } from '../../types/gameState'
import type { Scenario } from '../../types/scenario'
import type { LoadResult } from '../../types/saveData'
import { createSaveData, parseSaveData } from './saveData'

export const SAVE_STORAGE_KEY = 'detective-saeki-minato.save.v1'
export type SaveStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
export type StorageResult = { ok: true } | { ok: false; reason: 'storage-unavailable' }
export type StoredLoadResult = LoadResult | { ok: false; reason: 'no-save' | 'storage-unavailable' }

// localStorage の取得自体も拒否される場合があるため、各操作の try 内でアクセスする。
export function saveGame(state: GameState, storage?: SaveStorage): StorageResult {
  try {
    (storage ?? window.localStorage).setItem(SAVE_STORAGE_KEY, JSON.stringify(createSaveData(state)))
    return { ok: true }
  } catch {
    return { ok: false, reason: 'storage-unavailable' }
  }
}

export function loadGame(scenarios: readonly Scenario[], storage?: SaveStorage): StoredLoadResult {
  try {
    const json = (storage ?? window.localStorage).getItem(SAVE_STORAGE_KEY)
    if (json === null) return { ok: false, reason: 'no-save' }
    return parseSaveData(json, scenarios)
  } catch {
    return { ok: false, reason: 'storage-unavailable' }
  }
}

export function deleteSave(storage?: SaveStorage): StorageResult {
  try {
    (storage ?? window.localStorage).removeItem(SAVE_STORAGE_KEY)
    return { ok: true }
  } catch {
    return { ok: false, reason: 'storage-unavailable' }
  }
}
