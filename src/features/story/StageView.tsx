import { displayText } from './displayText'
import { Component } from 'react'
import type { ReactNode } from 'react'
import type { Stage } from '../../types/scenario'
import { stageCharacters } from './scene'
import { resolveBackground, resolveCharacter, resolveExpression } from '../../data/presentation'

type AssetImageProps = { src: string; alt: string; className: string; fallback?: ReactNode }

export class AssetImage extends Component<AssetImageProps, { failed: boolean }> {
  state = { failed: false }

  render() {
    const { src, alt, className } = this.props
    return this.state.failed ? this.props.fallback ?? null : <img className={className} src={src} alt={alt} onError={() => this.setState({ failed: true })} />
  }
}

type StageImageState = { requestedSrc: string; ready: { src: string; alt: string } | null; failed: boolean }

export class StageImage extends Component<AssetImageProps, StageImageState> {
  state: StageImageState = { requestedSrc: this.props.src, ready: null, failed: false }

  static getDerivedStateFromProps(props: AssetImageProps, state: StageImageState) {
    return props.src === state.requestedSrc ? null : { requestedSrc: props.src, failed: false }
  }

  render() {
    const { src, alt, className } = this.props
    if (this.state.failed) return this.props.fallback ?? null
    const { ready } = this.state
    const fail = (image: HTMLImageElement) => { if (image.isConnected && this.props.src === src) this.setState({ failed: true }) }
    return <>
      {ready ? <img className={className} src={ready.src} alt={ready.alt} /> : this.props.fallback ?? null}
      {ready?.src !== src && <img key={src} style={{ display: 'none' }} aria-hidden="true" src={src} alt="" onError={event => fail(event.currentTarget)} onLoad={event => {
        const image = event.currentTarget
        // 同一人物の表情だけは直前の画像を残す。場面・人物の変更は親のkeyでリセットする。
        void image.decode().then(() => {
          if (image.isConnected && this.props.src === src) this.setState({ ready: { src, alt }, failed: false })
        }).catch(() => fail(image))
      }} />}
    </>
  }
}

export function StageView({ stage }: { stage: Stage }) {
  const background = resolveBackground(stage.backgroundId)
  const backgroundFallback = <p className="background-label">{displayText(background.name)}</p>

  return (
    <div className={`stage${stageCharacters(stage).length === 3 ? ' stage--three' : ''}`} aria-label="背景領域" data-background-id={stage.backgroundId}>
      {background.imageSrc ? <StageImage key={stage.backgroundId} src={background.imageSrc} alt="" className="background-image" fallback={backgroundFallback} /> : stage.backgroundId === 'prologue' ? null : backgroundFallback}
      {stageCharacters(stage).map(person => {
        const character = resolveCharacter(person.characterId)
        const expression = resolveExpression(person.characterId, person.expression)
        const fallback = <div className="character-silhouette" aria-label={displayText(character.name)}><svg viewBox="0 0 400 650" aria-hidden="true"><ellipse cx="200" cy="120" rx="65" ry="85" /><path d="M105 230Q200 175 295 230L360 640H40Z" /></svg></div>
        return <div key={person.characterId} className={`character character--${person.position}${['mio', 'akari', 'saori', 'building-manager', 'rescue-worker', 'company-reviewer', 'reiko', 'anna'].includes(person.characterId) ? ' character--female' : ''}`} aria-label="キャラクター領域" data-character-id={person.characterId} data-expression={person.expression}>
          {expression.imageSrc ? <StageImage src={expression.imageSrc} alt={displayText(`${character.name}・${expression.name}`)} className="character-image" fallback={fallback} /> : fallback}
        </div>
      })}
    </div>
  )
}
