import type { GameState } from '../../types/gameState'
import type { Scenario } from '../../types/scenario'
import type { SaveData } from '../../types/saveData'
import type { HistoryEntry } from './history'
import { createSaveData, restoreSaveData } from './saveData'
import { SAVE_STORAGE_KEY } from './storage'
import type { SaveStorage } from './storage'

export const SLOT_STORAGE_KEY = 'detective-saeki-minato.slots.v1'
export type SaveSlot = { data: SaveData; savedAt: string; label: string; history: HistoryEntry[] }
type Slots = { version: 1; auto: SaveSlot | null; manual: SaveSlot[] }
export type SlotId = 'auto' | 0 | 1 | 2
export function readSlots(storage: SaveStorage = window.localStorage): Slots {
  const raw = storage.getItem(SLOT_STORAGE_KEY)
  if (raw !== null) {
    const slots = JSON.parse(raw)
    if (slots?.version !== 1 || !Array.isArray(slots.manual) || slots.manual.length > 3 || !('auto' in slots)) throw new Error('invalid slots')
    const isSlot = (slot: SaveSlot) => slot && typeof slot.savedAt === 'string' && typeof slot.label === 'string' && Array.isArray(slot.history) && slot.data && typeof slot.data === 'object'
    if (slots.auto !== null && !isSlot(slots.auto) || slots.manual.some((slot: SaveSlot) => !isSlot(slot))) throw new Error('invalid slots')
    return slots
  }
  const slots: Slots = {version:1,auto:null,manual:[]}
  const legacy = storage.getItem(SAVE_STORAGE_KEY)
  if (legacy !== null) {
    const data = JSON.parse(legacy)
    // 正式な復元検査はLOAD時に実行。旧JSONは削除せず失敗時も保持する。
    if (data && typeof data.scenarioId === 'string' && typeof data.nodeId === 'string') {
      let history: HistoryEntry[] = []
      try { const old = JSON.parse(storage.getItem('detective-saeki-minato.history.v1') ?? 'null'); if (old?.scenarioId===data.scenarioId && old?.nodeId===data.nodeId && Array.isArray(old.entries)) history=old.entries } catch { /* 旧履歴なし */ }
      slots.manual = [{data,savedAt:'',label:'旧セーブ',history}]
      storage.setItem(SLOT_STORAGE_KEY,JSON.stringify(slots))
    } else throw new Error('invalid legacy save')
  }
  return slots
}
export function writeSlot(state: GameState, kind: 'auto'|'manual', label: string, history: HistoryEntry[], storage?: SaveStorage) {
  try {
    const target=storage??window.localStorage, slots=readSlots(target)
    const slot: SaveSlot={data:createSaveData(state),savedAt:new Date().toISOString(),label,history:history.slice(-2000)}
    if(kind==='auto') slots.auto=slot
    else slots.manual=[slot,...slots.manual].slice(0,3)
    target.setItem(SLOT_STORAGE_KEY,JSON.stringify(slots))
    return {ok:true as const}
  } catch {return {ok:false as const,reason:'storage-unavailable' as const}}
}
export function loadSlot(id: SlotId, scenarios: readonly Scenario[], storage?: SaveStorage) {
  try {
    const slots=readSlots(storage??window.localStorage),slot=id==='auto'?slots.auto:slots.manual[id]
    if(!slot) return {ok:false as const,reason:'no-save' as const}
    const result=restoreSaveData(slot.data,scenarios)
    return result.ok ? {...result,history:slot.history.filter(entry=>entry && typeof entry.text==='string' && typeof entry.speaker==='string' && typeof entry.nodeId==='string').slice(-2000)} : result
  } catch {return {ok:false as const,reason:'storage-unavailable' as const}}
}
