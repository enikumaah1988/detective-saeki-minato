import type { GameState } from '../../types/gameState'
import type { Scenario } from '../../types/scenario'
import type { LoadResult, SaveData } from '../../types/saveData'

export const SAVE_DATA_VERSION = 2

export function createSaveData(state: GameState): SaveData {
  return { version: SAVE_DATA_VERSION, scenarioId: state.scenarioId, nodeId: state.nodeId, flags: { ...state.flags }, heardTopics: [...state.heardTopics], inspectedTargets: [...state.inspectedTargets], acquiredInformation: [...state.acquiredInformation] }
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
    if (version !== 1 && version !== SAVE_DATA_VERSION) return { ok: false, reason: 'unsupported-version' }

    const scenario = scenarios.find((candidate) => candidate.id === scenarioId)
    if (!scenario) return { ok: false, reason: 'unknown-scenario' }
    if (!Object.hasOwn(scenario.nodes, nodeId)) return { ok: false, reason: 'unknown-node' }

    if (version === 1) {
      return { ok: true, state: { scenarioId, nodeId, flags: {}, heardTopics: [], inspectedTargets: [], acquiredInformation: [] } }
    }
    const flags = field('flags')
    const heardTopics = field('heardTopics')
    const inspectedTargets = field('inspectedTargets')
    const acquiredInformation = field('acquiredInformation')
    const isIds = (value: unknown): value is string[] => Array.isArray(value)
      && Array.from(value).every((id) => typeof id === 'string' && id.trim().length > 0)
    if (typeof flags !== 'object' || flags === null || Array.isArray(flags)
      || Object.entries(flags).some(([id, value]) => !id.trim() || typeof value !== 'boolean')
      || !isIds(heardTopics) || !isIds(inspectedTargets) || !isIds(acquiredInformation)) {
      return { ok: false, reason: 'invalid-format' }
    }
    return { ok: true, state: {
      scenarioId, nodeId, flags: Object.fromEntries(Object.entries(flags)),
      heardTopics: [...new Set(heardTopics)], inspectedTargets: [...new Set(inspectedTargets)],
      acquiredInformation: [...new Set(acquiredInformation)],
    } }
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
