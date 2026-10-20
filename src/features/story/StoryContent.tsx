import { DialogueWindow } from './DialogueWindow'
import { SelectionMenu } from './SelectionMenu'
import { CommandButton } from './CommandButton'
import type { GameState } from '../../types/gameState'
import type { ScenarioNode } from '../../types/scenario'
import type { GameAction } from './state'
import { choiceStatus, emptyContinuation, isFreeAction, menuTitle, visibleChoices } from './freeAction'
import { UiIcon } from './UiIcon'
import type { IconName } from './UiIcon'
import { dialogueSpeaker } from './speaker'
import type { Ref } from 'react'
import { displayText } from './displayText'

export { choiceStatus } from './freeAction'

export function StoryContent({ node, state, thinking, dispatch, paused, dialogueRef, interval }: {
  node: Exclude<ScenarioNode, { type: 'think' }>
  state: GameState
  thinking: boolean
  paused?: boolean
  interval?: number
  dispatch: (action: GameAction) => void
  dialogueRef?: Ref<DialogueWindow>
}) {
  if (node.type === 'dialogue') {
    return <DialogueWindow ref={dialogueRef} speaker={thinking ? '' : dialogueSpeaker(node, state)} text={node.text}
      thinking={thinking} interval={interval} paused={paused} onAdvance={() => dispatch({ type: 'advance' })} />
  }
  if ('options' in node) {
    const icons: Record<string, IconName> = { talk: 'talk', speak: 'talk', look: 'look', investigate: 'look', think: 'think', organize:'notebook', move:'move', map:'move', enter:'move', proceed:'move', return:'return' }
    const freeAction = isFreeAction(node)
    const options = visibleChoices(node, state)
    if (options.length === 0) {
      const continuation = emptyContinuation(node, state)
      return continuation ? <nav className="command-panel" aria-label="進行"><SelectionMenu paused={paused}><CommandButton paused={paused} onSelect={() => dispatch({ type: 'continue' })}><UiIcon name="move"/><span className="command-name">{displayText(continuation.label)}</span></CommandButton></SelectionMenu></nav> : null
    }
    return (
      <nav className={`command-panel${freeAction ? ' free-action-panel' : ''}`} aria-label={node.type === 'topic' ? node.selection === 'person' ? '相手を選ぶ' : node.parent.commandId === 'speak' ? '話す話題' : '聞く話題' : node.type === 'inspect' ? '調査対象' : '選択肢'}>
        {(menuTitle(node, state) || !freeAction) && <p className="command-heading">{displayText(menuTitle(node, state) ?? node.prompt)}</p>}
        <span className="sr-only">{displayText(node.prompt)}</span>
        <SelectionMenu paused={paused} className={`choices ${node.type === 'topic' || node.type === 'inspect' ? 'item-list' : 'command-list'}`}>
          {options.map((option) => {
            const status = choiceStatus(node, option, state)
            const icon = icons[option.id] ?? (node.type === 'topic' ? node.selection === 'person' ? 'people' : 'talk' : node.type === 'inspect' ? 'look' : 'move')
            return (
              <CommandButton key={option.id} paused={paused} onSelect={() => dispatch({ type: 'choose', choiceId: option.id })}>
                {icon && <UiIcon name={icon} />}
                <span className="command-name">{displayText(option.label)}</span>
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
      <p className="dialogue" aria-live="polite">{displayText(node.text)}</p>
      <button type="button" onClick={() => dispatch({ type: 'reset' })}><UiIcon name="return"/><span>最初から</span></button>
    </div>
  )
}
