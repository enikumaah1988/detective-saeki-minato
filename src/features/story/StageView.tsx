import { Component } from 'react'
import type { Stage } from '../../types/scenario'
import { resolveBackground, resolveCharacter, resolveExpression } from '../../data/presentation'

export class AssetImage extends Component<{ src: string; alt: string; className: string }, { failed: boolean }> {
  state = { failed: false }

  render() {
    const { src, alt, className } = this.props
    return this.state.failed ? null : <img className={className} src={src} alt={alt} onError={() => this.setState({ failed: true })} />
  }
}

export function StageView({ stage }: { stage: Stage }) {
  const background = resolveBackground(stage.backgroundId)
  const character = resolveCharacter(stage.characterId)
  const expression = resolveExpression(stage.characterId, stage.expression)

  return (
    <div className="stage" aria-label="背景領域" data-background-id={stage.backgroundId}>
      {background.imageSrc && <AssetImage key={background.imageSrc} src={background.imageSrc} alt="" className="background-image" />}
      <p className="background-label">{background.name}</p>
      <div className="character" aria-label="キャラクター領域" data-character-id={stage.characterId} data-expression={stage.expression}>
        <span>人物表示領域</span>
        <strong>{character.name}</strong>
        <span>表情: {expression.name}（{expression.id}）</span>
        {expression.imageSrc && <AssetImage key={expression.imageSrc} src={expression.imageSrc} alt={`${character.name}・${expression.name}`} className="character-image" />}
      </div>
    </div>
  )
}
