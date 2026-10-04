import type { GameState } from '../../types/gameState'
import type { Scenario } from '../../types/scenario'
import type { LoadResult, SaveData } from '../../types/saveData'

export const SAVE_DATA_VERSION = 1

export function createSaveData(state: GameState): SaveData {
  return { version: SAVE_DATA_VERSION, scenarioId: state.scenarioId, nodeId: state.nodeId }
}

export function restoreSaveData(input: unknown, scenarios: readonly Scenario[]): LoadResult {
  try {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return { ok: false, reason: 'invalid-format' }
    }
    // JSON の通常の値だけを読む。継承プロパティや getter は入力として認めない。
    const field = (name: string): unknown => {
      const descriptor = Object.getOwnPropertyDescriptor(input, name)
      return descriptor && 'value' in descriptor ? descriptor.value : undefined
    }
    const version = field('version')
    const scenarioId = field('scenarioId')
    const nodeId = field('nodeId')
    if (typeof version !== 'number' || !Number.isInteger(version) || version < 1
      || typeof scenarioId !== 'string' || scenarioId.trim().length === 0
      || typeof nodeId !== 'string' || nodeId.trim().length === 0) {
      return { ok: false, reason: 'invalid-format' }
    }
    if (version !== SAVE_DATA_VERSION) return { ok: false, reason: 'unsupported-version' }

    const scenario = scenarios.find((candidate) => candidate.id === scenarioId)
    if (!scenario) return { ok: false, reason: 'unknown-scenario' }
    if (!Object.hasOwn(scenario.nodes, nodeId)) return { ok: false, reason: 'unknown-node' }

    return { ok: true, state: { scenarioId, nodeId } }
  } catch {
    // Proxy など JSON 以外の未知入力でも、例外を呼び出し側へ漏らさない。
    return { ok: false, reason: 'invalid-format' }
  }
}

export function parseSaveData(json: string, scenarios: readonly Scenario[]): LoadResult {
  try {
    return restoreSaveData(JSON.parse(json), scenarios)
  } catch {
    return { ok: false, reason: 'invalid-format' }
  }
}
