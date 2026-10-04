export type Stage = {
  background: string
  character: string
}

export type Choice = { id: string; label: string; next: string }

export type ScenarioNode =
  | { type: 'dialogue'; stage: Stage; speaker: string; text: string; next: string }
  | { type: 'choice'; stage: Stage; prompt: string; options: Choice[] }
  | { type: 'end'; stage: Stage; text: string }

export type Scenario = {
  id: string
  title: string
  start: string
  nodes: Record<string, ScenarioNode>
}
