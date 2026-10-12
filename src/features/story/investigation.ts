import { formatNames } from '../../data/displayNames'
import type { GameState } from '../../types/gameState'
import type { InvestigationEntry, InvestigationRecord, RecordSource } from '../../types/investigation'
import { basicBelongings, recordsByScenario } from '../../data/investigation'

export const RECORD_CATEGORIES = [
  { id: 'people', label: '人物' },
  { id: 'evidence', label: '証拠' },
  { id: 'events', label: '出来事' },
  { id: 'belongings', label: '持ち物' },
] as const

function hasSource(state: GameState, source: RecordSource): boolean {
  if (source.type === 'base') return true
  return source.type === 'inspection' ? state.inspectedTargets.includes(source.id)
    : source.ids.some(id => state.acquiredInformation.includes(id))
}

export function selectInvestigationRecords(state: GameState, definitions: readonly InvestigationEntry[] = recordsByScenario[state.scenarioId] ?? []): InvestigationRecord[] {
  // 一つの項目IDは一分類のみ。証拠を持ち物へ複製しない。
  const seen = new Set<string>()
  return [...definitions, ...basicBelongings].filter(entry => {
    const acquired = hasSource(state, entry.source) || (entry.alternativeSources ?? []).some(source => hasSource(state, source))
    if (!acquired || seen.has(entry.id)) return false
    seen.add(entry.id)
    return true
  }).map(({ source: _source, alternativeSources: _alternatives, facts, portraitSource, titleUpdates, ...entry }) => ({
    ...entry, title: formatNames(titleUpdates?.filter(update => hasSource(state, update.source)).at(-1)?.title ?? entry.title),
    imageSrc: portraitSource && !hasSource(state, portraitSource) ? undefined : entry.imageSrc,
    faceKnown: portraitSource ? hasSource(state, portraitSource) : Boolean(entry.imageSrc),
    details: [entry.description, ...(facts ?? []).filter(fact => hasSource(state, fact.source)).map(fact => fact.text)],
  })).sort((a, b) => {
    const categoryOrder = RECORD_CATEGORIES.findIndex(tab => tab.id === a.category) - RECORD_CATEGORIES.findIndex(tab => tab.id === b.category)
    return categoryOrder || (a.category === 'events' ? (a.chronologicalOrder ?? 0) - (b.chronologicalOrder ?? 0) : 0)
  })
}
