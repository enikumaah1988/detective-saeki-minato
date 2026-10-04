import type { BackgroundDefinition, CharacterDefinition, ExpressionDefinition } from '../types/presentation'

// 検証用 SVG。本番画像へ差し替える際もシナリオの ID は変更しない。
export const backgrounds: Record<string, BackgroundDefinition> = {
  'office-afternoon': { id: 'office-afternoon', name: '探偵事務所・午後（仮背景）', imageSrc: new URL('../assets/backgrounds/office-afternoon.svg', import.meta.url).href },
}

export const characters: Record<string, CharacterDefinition> = {
  minato: {
    id: 'minato', name: '佐伯湊',
    expressions: {
      normal: { id: 'normal', name: '通常', imageSrc: new URL('../assets/characters/minato/normal.svg', import.meta.url).href },
      serious: { id: 'serious', name: '真剣', imageSrc: new URL('../assets/characters/minato/serious.svg', import.meta.url).href },
    },
  },
  mio: {
    id: 'mio', name: '相澤澪',
    expressions: { normal: { id: 'normal', name: '通常', imageSrc: new URL('../assets/characters/mio/normal.svg', import.meta.url).href } },
  },
}

export function resolveBackground(id: string): BackgroundDefinition {
  return Object.hasOwn(backgrounds, id) ? backgrounds[id] : { id, name: '未登録の背景' }
}

export function resolveCharacter(id: string): CharacterDefinition {
  return Object.hasOwn(characters, id) ? characters[id] : { id, name: '未登録の人物', expressions: {} }
}

export function resolveExpression(characterId: string, expressionId: string): ExpressionDefinition {
  const character = resolveCharacter(characterId)
  return Object.hasOwn(character.expressions, expressionId)
    ? character.expressions[expressionId]
    : { id: expressionId, name: '未登録の表情' }
}

export function resolveSpeakerName(speakerId: string): string {
  return resolveCharacter(speakerId).name
}
