import type { Scenario } from '../../types/scenario'

export type HistoryEntry = { speaker: string; text: string; nodeId: string }
export const MAX_HISTORY_ENTRIES = 2000

// 保存配列はそのまま保持し、現在のシナリオ位置から表示範囲だけを導出する。
export function selectVisibleHistory(scenario: Scenario, nodeId: string, entries: readonly HistoryEntry[]): readonly HistoryEntry[] {
  const scope = scenario.nodes[nodeId]?.historyScope
  const candidates = scenario.hiddenHistoryTexts?.length
    ? entries.filter(entry => !scenario.hiddenHistoryTexts?.includes(entry.text)) : entries
  if (scope === undefined) return candidates
  return candidates.filter(entry => typeof entry.nodeId === 'string' && scenario.nodes[entry.nodeId]?.historyScope === scope)
}

const key = 'detective-saeki-minato.history.v1'
export function saveHistory(scenarioId: string, nodeId: string, entries: HistoryEntry[]) {
  try { localStorage.setItem(key, JSON.stringify({ scenarioId, nodeId, entries: entries.slice(-MAX_HISTORY_ENTRIES) })) } catch { /* ゲームのセーブ成功を妨げない */ }
}
export function loadHistory(scenarioId: string, nodeId: string): HistoryEntry[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (value?.scenarioId !== scenarioId || value?.nodeId !== nodeId || !Array.isArray(value.entries)) return []
    return value.entries.filter((entry: HistoryEntry) => entry && typeof entry.speaker === 'string' && typeof entry.text === 'string' && typeof entry.nodeId === 'string').slice(-MAX_HISTORY_ENTRIES)
  } catch { return [] }
}
