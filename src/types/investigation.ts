export type RecordCategory = 'people' | 'evidence' | 'events' | 'belongings'
export type RecordSource =
  | { type: 'information'; ids: readonly string[] }
  | { type: 'inspection'; id: string }
  | { type: 'base' }

export type RecordFact = { source: RecordSource; text: string }
export type InvestigationEntry = {
  id: string
  category: RecordCategory
  title: string
  source: RecordSource
  description: string
  alternativeSources?: readonly RecordSource[]
  facts?: readonly RecordFact[]
  imageSrc?: string
  portraitSource?: RecordSource
  imageAlt?: string
  mediaKind?: 'photo'
  timeLabel?: string
  chronologicalOrder?: number
}
export type InvestigationRecord = Omit<InvestigationEntry, 'source' | 'alternativeSources' | 'facts' | 'portraitSource'> & { details: string[]; faceKnown?: boolean }
