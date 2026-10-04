export type BackgroundDefinition = { id: string; name: string; imageSrc?: string }
export type ExpressionDefinition = { id: string; name: string; imageSrc?: string }
export type CharacterDefinition = {
  id: string
  name: string
  expressions: Record<string, ExpressionDefinition>
}
