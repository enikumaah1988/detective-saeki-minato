import type { InvestigationEntry } from './investigation'
export type Stage = {
  characterPosition?: 'left' | 'center' | 'right'
  backgroundId: string
  // Legacy single-character stages remain readable; new scenes use characters.
  characterId?: string
  expression?: string
  characters?: { characterId: string; expression: string; position?: 'left' | 'center' | 'right' }[]
}

export type Condition =
  | { type: 'flag'; id: string; value?: boolean }
  | { type: 'heardTopic' | 'inspectedTarget' | 'hasInformation'; id: string }
  | { type: 'hasAllInformation'; ids: string[] }

export type StateUpdate =
  | { type: 'setFlag'; id: string; value: boolean }
  | { type: 'addHeardTopic' | 'addInspectedTarget' | 'addInformation'; id: string }

export type Choice = { id: string; label: string; next: string; implemented?: boolean; progressId?: string; condition?: Condition; updates?: StateUpdate[] }

export type ScenarioNode =
  | { type: 'dialogue'; stage: Stage; speakerId: string; text: string; next: string; updates?: StateUpdate[] }
  | { type: 'choice'; mode?: 'free-action'; implementedCommands?: readonly string[]; empty?: { label: string; next: string }; stage: Stage; prompt: string; options: Choice[] }
  | { type: 'topic' | 'inspect'; parent: { commandId: 'talk' | 'look'; nodeId: string }; stage: Stage; prompt: string; options: Choice[] }
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
  scenes?: Record<string, Scene>
  records?: readonly InvestigationEntry[]
  smokingHints?: { rules: SmokingHint[]; fallback: string }
  nodes: Record<string, ScenarioNode & { sceneId?: string }>
}
