import { DialogueWindow } from './DialogueWindow'
import { CommandButton } from './CommandButton'
import type { GameState } from '../../types/gameState'
import type { Choice, ScenarioNode } from '../../types/scenario'
import type { GameAction } from './state'
import { visibleChoices } from './freeAction'
import { UiIcon } from './UiIcon'
import type { IconName } from './UiIcon'
import { resolveSpeakerName } from '../../data/presentation'

export function choiceStatus(node: ScenarioNode, option: Choice, state: GameState): string | undefined {
  if (option.id === 'return') return undefined
  const done = node.type === 'topic' ? state.heardTopics.includes(option.id)
    : node.type === 'inspect' ? state.inspectedTargets.includes(option.id) : undefined
  if (done === undefined) return undefined
  return done ? (node.type === 'topic' ? '既読' : '調査済み') : option.condition ? 'NEW' : '未実行'
}

export function StoryContent({ node, state, thinking, dispatch, paused }: {
  node: Exclude<ScenarioNode, { type: 'think' }>
  state: GameState
  thinking: boolean
  paused?: boolean
  dispatch: (action: GameAction) => void
}) {
  if (node.type === 'dialogue') {
    return <DialogueWindow speaker={thinking ? '佐伯の思考 ─ 心の声' : resolveSpeakerName(node.speakerId)} text={node.text}
      thinking={thinking} paused={paused} onAdvance={() => dispatch({ type: 'advance' })} />
  }
  if ('options' in node) {
    const icons: Record<string, IconName> = { talk: 'talk', look: 'look', think: 'think' }
    const freeAction = node.type === 'choice' && ['talk', 'look', 'think'].every((id) => node.options.some((option) => option.id === id))
    return (
      <nav className="command-panel" aria-label={node.type === 'topic' ? '聞く話題' : node.type === 'inspect' ? '調査対象' : '選択肢'}>
        {node.type !== 'choice' && <p className="command-heading">{node.type === 'topic' ? '聞く' : '調べる'}</p>}
        <span className="sr-only">{node.prompt}</span>
        <div className={`choices ${node.type === 'topic' || node.type === 'inspect' ? 'item-list' : 'command-list'}`}>
          {visibleChoices(node, state).map((option) => {
            const status = choiceStatus(node, option, state)
            const icon = icons[option.id]
            return (
              <CommandButton key={option.id} paused={paused} onSelect={() => dispatch({ type: 'choose', choiceId: option.id })}>
                {node.type === 'choice' && icon && <UiIcon name={icon} />}
                <span className="command-name">{node.type === 'choice' && option.id === 'look' ? '調べる' : option.label}</span>
                {status && <span className={`item-status${status === 'NEW' ? ' is-new' : ''}`}>{status}</span>}
                {!status && <span className="command-arrow" aria-hidden="true">›</span>}
              </CommandButton>
            )
          })}
          {freeAction && ['整理する', '移動'].map((label) => <button key={label} type="button" disabled title="未実装"><span className="command-name">{label}</span><span className="item-status">未実装</span></button>)}
        </div>
      </nav>
    )
  }
  return (
    <div className="message-window end-window">
      <p className="window-label">シーン終了</p>
      <p className="dialogue" aria-live="polite">{node.text}</p>
      <button type="button" onClick={() => dispatch({ type: 'reset' })}>最初から</button>
    </div>
  )
}
