import { DialogueWindow } from './DialogueWindow'
import { SelectionMenu } from './SelectionMenu'
import { CommandButton } from './CommandButton'
import type { GameState } from '../../types/gameState'
import type { ScenarioNode } from '../../types/scenario'
import type { GameAction } from './state'
import { choiceStatus, emptyContinuation, isFreeAction, menuTitle, visibleChoices } from './freeAction'
import { UiIcon } from './UiIcon'
import type { IconName } from './UiIcon'
import { resolveSpeakerName } from '../../data/presentation'

export { choiceStatus } from './freeAction'

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
    const freeAction = isFreeAction(node)
    const options = visibleChoices(node, state)
    if (options.length === 0) {
      const continuation = emptyContinuation(node, state)
      return continuation ? <nav className="command-panel" aria-label="進行"><SelectionMenu paused={paused}><CommandButton paused={paused} onSelect={() => dispatch({ type: 'continue' })}><span className="command-name">{continuation.label}</span></CommandButton></SelectionMenu></nav> : null
    }
    return (
      <nav className={`command-panel${freeAction ? ' free-action-panel' : ''}`} aria-label={node.type === 'topic' ? '聞く話題' : node.type === 'inspect' ? '調査対象' : '選択肢'}>
        {menuTitle(node) && <p className="command-heading">{menuTitle(node)}</p>}
        <span className="sr-only">{node.prompt}</span>
        <SelectionMenu paused={paused} className={`choices ${node.type === 'topic' || node.type === 'inspect' ? 'item-list' : 'command-list'}`}>
          {options.map((option) => {
            const status = choiceStatus(node, option, state)
            const icon = freeAction ? icons[option.id] : undefined
            return (
              <CommandButton key={option.id} paused={paused} onSelect={() => dispatch({ type: 'choose', choiceId: option.id })}>
                {icon && <UiIcon name={icon} />}
                <span className="command-name">{option.label}</span>
                {status && <span className={`item-status${status === 'NEW' ? ' is-new' : ''}`}>{status}</span>}
                {!status && <span className="command-arrow" aria-hidden="true">›</span>}
              </CommandButton>
            )
          })}
        </SelectionMenu>
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
