export type Stage = {
  characterPosition?: 'left' | 'center' | 'right'
  backgroundId: string
  characterId: string
  expression: string
}

export type Condition =
  | { type: 'flag'; id: string; value?: boolean }
  | { type: 'heardTopic' | 'inspectedTarget' | 'hasInformation'; id: string }
  | { type: 'hasAllInformation'; ids: string[] }

export type StateUpdate =
  | { type: 'setFlag'; id: string; value: boolean }
  | { type: 'addHeardTopic' | 'addInspectedTarget' | 'addInformation'; id: string }

export type Choice = { id: string; label: string; next: string; condition?: Condition; updates?: StateUpdate[] }

export type ScenarioNode =
  | { type: 'dialogue'; stage: Stage; speakerId: string; text: string; next: string; updates?: StateUpdate[] }
  | { type: 'choice' | 'topic' | 'inspect'; stage: Stage; prompt: string; options: Choice[] }
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

export type Scenario = {
  id: string
  title: string
  start: string
  nodes: Record<string, ScenarioNode>
}
