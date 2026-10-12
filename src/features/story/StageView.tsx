import { Component } from 'react'
import type { ReactNode } from 'react'
import type { Stage } from '../../types/scenario'
import { stageCharacters } from './scene'
import { resolveBackground, resolveCharacter, resolveExpression } from '../../data/presentation'

export class AssetImage extends Component<{ src: string; alt: string; className: string; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  render() {
    const { src, alt, className } = this.props
    return this.state.failed ? this.props.fallback ?? null : <img className={className} src={src} alt={alt} onError={() => this.setState({ failed: true })} />
  }
}

export function StageView({ stage }: { stage: Stage }) {
  const background = resolveBackground(stage.backgroundId)
  const backgroundFallback = <p className="background-label">{background.name}</p>

  return (
    <div className="stage" aria-label="背景領域" data-background-id={stage.backgroundId}>
      {background.imageSrc ? <AssetImage key={background.imageSrc} src={background.imageSrc} alt="" className="background-image" fallback={backgroundFallback} /> : backgroundFallback}
      {stageCharacters(stage).map(person => {
        const character = resolveCharacter(person.characterId)
        const expression = resolveExpression(person.characterId, person.expression)
        const fallback = <div className="character-silhouette" aria-label={character.name}><svg viewBox="0 0 400 650" aria-hidden="true"><ellipse cx="200" cy="120" rx="65" ry="85" /><path d="M105 230Q200 175 295 230L360 640H40Z" /></svg></div>
        return <div key={person.characterId} className={`character character--${person.position}`} aria-label="キャラクター領域" data-character-id={person.characterId} data-expression={person.expression}>
          {expression.imageSrc ? <AssetImage key={expression.imageSrc} src={expression.imageSrc} alt={`${character.name}・${expression.name}`} className="character-image" fallback={fallback} /> : fallback}
        </div>
      })}
    </div>
  )
}
