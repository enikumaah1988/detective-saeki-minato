import type { InvestigationEntry } from './investigation'
export type Stage = {
  characterPosition?: 'left' | 'center' | 'right'
  backgroundId: string
  // Legacy single-character stages remain readable; new scenes use characters.
  characterId?: string
  expression?: string
  characters?: { characterId: string; expression: string; position?: 'left' | 'center' | 'right'; condition?: Condition }[]
}

export type Condition =
  | { type: 'not'; condition: Condition }
  | { type: 'any' | 'all'; conditions: Condition[] }
  | { type: 'flag'; id: string; value?: boolean }
  | { type: 'heardTopic' | 'inspectedTarget' | 'hasInformation'; id: string }
  | { type: 'hasAllInformation'; ids: string[] }

export type StateUpdate =
  | { type: 'setFlag'; id: string; value: boolean }
  | { type: 'addHeardTopic' | 'addInspectedTarget' | 'addInformation'; id: string }

export type Choice = { id: string; label: string; labelWhen?: { condition: Condition; label: string }; next: string; repeatNext?: string; implemented?: boolean; required?: boolean; progressId?: string; condition?: Condition; updates?: StateUpdate[] }

export type ScenarioNode =
  | { type: 'dialogue'; stage: Stage; speakerId: string; speakerName?: string; speakerNameCondition?: Condition; expressions?: Record<string, string>; text: string; next: string; nextWhen?: { condition: Condition; next: string }; conditionalNext?: { condition: Condition; next: string }[]; acquisition?: { itemId: string; title: string; imageSrc: string }; updates?: StateUpdate[] }
  | { type: 'choice'; mode?: 'free-action'; keepQuestions?: boolean; map?: { current: string; back: string }; implementedCommands?: readonly string[]; empty?: { label: string; next: string }; stage: Stage; prompt: string; options: Choice[] }
  | { type: 'topic' | 'inspect'; selection?: 'person'; appendUnlockedTopics?: boolean; heading?: string; headingWhen?: { condition: Condition; heading: string }; parent: { commandId: 'talk' | 'speak' | 'look' | 'investigate'; nodeId: string }; stage: Stage; prompt: string; options: Choice[] }
  | { type: 'end'; stage: Stage; text: string }
  | {
    type: 'think'
    stage: Stage
    speakerId: string
    requiredInformation: { id: string; summary: string }[]
    insufficient: { text: string; next: string }
    partial: { text: string; next: string }
    complete: { text: string; next: string }
  }

export type Scene = Stage & { smokingAllowed?: boolean }

export type SmokingHint = {
  id: string
  text: string
  nodeIds?: string[]
  condition?: Condition
  missingInformation?: string[]
}

export type Scenario = {
  id: string
  title: string
  start: string
  dateLabel?: string
  nodeTimes?: Record<string, string>
  itemUses?: { itemId: string; label?: string; nodeIds: string[]; next: string; condition?: Condition }[]
  milestones?: { id: string; required: string[] }[]
  saveAliases?: { heardTopic: string; information: string[]; ifInformation?: string }[]
  saveNodeAliases?: Record<string, string>
  informationAliases?: { information: string; grants: string[] }[]
  // 移動完了後に条件を評価する。通常の到着先へはイベントの終了ノードから戻す。
  arrivalEvents?: { arrivalNodeId: string; eventNodeId: string; condition?: Condition; onceFlag?: string }[]
  scenes?: Record<string, Scene>
  records?: readonly InvestigationEntry[]
  smokingHints?: { rules: SmokingHint[]; fallback: string }
  nodes: Record<string, ScenarioNode & { savePhaseId?: string; savePhaseMarkers?: string[]; sceneId?: string; autoAdvance?: boolean; automaticNext?: { condition: Condition; next: string }[]; entryUpdates?: StateUpdate[]; illustration?: { id: string; imageSrc?: string; alt: string; heading: string; subtitle?: string; provisional?: boolean } }>
}
