import { useReducer, useState } from 'react'
import type { Scenario } from '../../types/scenario'
import { createInitialState, reduceGameState, selectCurrentNode } from './state'
import type { GameAction } from './state'
import type { GameState } from '../../types/gameState'
import './story.css'
import { StageView } from './StageView'
import { StoryContent } from './StoryContent'
import { resolveBackground } from '../../data/presentation'
import { SaveControls } from './SaveControls'

export function StoryPlayer({ scenario }: { scenario: Scenario }) {
  const [gameState, dispatch] = useReducer(
    (state: GameState, action: GameAction) => reduceGameState(scenario, state, action),
    scenario,
    createInitialState,
  )
  const node = selectCurrentNode(scenario, gameState)
  const [menuOpen, setMenuOpen] = useState(false)
  const [restoreRevision, setRestoreRevision] = useState(0)

  return (
    <section className={`${'options' in node ? 'story has-commands' : 'story'}${menuOpen ? ' menu-open' : ''}`} aria-label="会話シーン">
      <header className="story-toolbar">
        <span className="sr-only">{scenario.title}</span>
        <div className="toolbar-actions">
        <SaveControls state={gameState} scenario={scenario} onRestore={(state) => { dispatch({ type: 'restore', state }); setRestoreRevision((value) => value + 1) }} onMenuToggle={setMenuOpen} />
        <button type="button" disabled title="未実装">調査記録</button>
        <button type="button" disabled title="未実装">タバコを吸う</button>
        </div>
        <div className="scene-context"><span>{resolveBackground(node.stage.backgroundId).name}</span><span>日時未設定</span></div>
      </header>
      <div className={scenario.nodes[gameState.nodeId].type === 'think' ? 'stage-wrapper is-thinking' : 'stage-wrapper'}>
        <StageView stage={node.stage} />
      </div>
      <div className="story-content" inert={menuOpen}>
      <StoryContent key={`${gameState.nodeId}:${restoreRevision}`} paused={menuOpen} node={node} state={gameState} thinking={scenario.nodes[gameState.nodeId].type === 'think'} dispatch={dispatch} />
      </div>
    </section>
  )
}
