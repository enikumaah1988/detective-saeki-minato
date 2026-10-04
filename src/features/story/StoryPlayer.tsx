import { useReducer } from 'react'
import type { Scenario } from '../../types/scenario'
import { createInitialState, reduceGameState, selectCurrentNode } from './state'
import type { GameAction } from './state'
import type { GameState } from '../../types/gameState'
import './story.css'
import { resolveSpeakerName } from '../../data/presentation'
import { StageView } from './StageView'
import { SaveControls } from './SaveControls'

export function StoryPlayer({ scenario }: { scenario: Scenario }) {
  const [gameState, dispatch] = useReducer(
    (state: GameState, action: GameAction) => reduceGameState(scenario, state, action),
    scenario,
    createInitialState,
  )
  const node = selectCurrentNode(scenario, gameState)

  return (
    <section className="story" aria-label="会話シーン">
      <p className="story-note">{scenario.title}</p>
      <StageView stage={node.stage} />
      <div className="message-window">
        <div aria-live="polite" aria-atomic="true">
          {node.type === 'dialogue' && <h2 className="speaker">{resolveSpeakerName(node.speakerId)}</h2>}
          <p className="dialogue">{node.type === 'choice' ? node.prompt : node.text}</p>
        </div>
        {node.type === 'dialogue' && (
          <button className="next" type="button" onClick={() => dispatch({ type: 'advance' })}>次へ ▸</button>
        )}
        {node.type === 'choice' && (
          <div className="choices" aria-label="選択肢">
            {node.options.map((option) => (
              <button key={option.id} type="button" onClick={() => dispatch({ type: 'choose', choiceId: option.id })}>
                {option.label}
              </button>
            ))}
          </div>
        )}
        {node.type === 'end' && (
          <button type="button" onClick={() => dispatch({ type: 'reset' })}>最初から</button>
        )}
      </div>
      <SaveControls state={gameState} scenario={scenario} onRestore={(state) => dispatch({ type: 'restore', state })} />
    </section>
  )
}
