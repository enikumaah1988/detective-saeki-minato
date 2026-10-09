import { useEffect, useReducer, useRef, useState } from 'react'
import type { InvestigationRecord } from '../../types/investigation'
import type { Scenario } from '../../types/scenario'
import { selectCurrentNode } from './state'
import type { GameAction } from './state'
import { createPlayback, reducePlayback } from './playback'
import './story.css'
import { StageView } from './StageView'
import { StoryContent } from './StoryContent'
import { resolveBackground } from '../../data/presentation'
import { InvestigationRecords } from './InvestigationRecords'
import { SaveControls } from './SaveControls'

export function StoryPlayer({ scenario, preview }: { scenario: Scenario; preview?: { records: InvestigationRecord[]; label: string; invoker: HTMLElement } }) {
  const [playback, send] = useReducer(
    (state: ReturnType<typeof createPlayback>, action: Parameters<typeof reducePlayback>[2]) => reducePlayback(scenario, state, action),
    scenario, createPlayback,
  )
  const gameState = playback.game
  const dispatch = (action: GameAction) => send({ type: 'input', origin: { nodeId: gameState.nodeId, generation: playback.generation }, action })
  const node = selectCurrentNode(scenario, gameState)
  const menuOpen = playback.paused
  const [recordsOpen, setRecordsOpen] = useState(false)
  const [activePreview, setActivePreview] = useState<typeof preview>()
  useEffect(() => {
    if (import.meta.env.DEV && preview) {
      setActivePreview(preview); setRecordsOpen(true); send({ type: 'menu', open: true })
    }
  }, [preview])
  const recordsButton = useRef<HTMLButtonElement>(null)
  const [restoreRevision, setRestoreRevision] = useState(0)

  return (
    <section className={`${'options' in node ? 'story has-commands' : 'story'}${menuOpen ? ' menu-open' : ''}${recordsOpen ? ' records-open' : ''}`} aria-label="会話シーン">
      <header className="story-toolbar" inert={recordsOpen}>
        <span className="sr-only">{scenario.title}</span>
        <div className="toolbar-actions">
        <SaveControls state={gameState} scenario={scenario} onRestore={(state) => { send({ type: 'restore', state }); setRestoreRevision((value) => value + 1) }} onMenuToggle={(open) => send({ type: 'menu', open: open || recordsOpen })} />
        <button ref={recordsButton} type="button" disabled={menuOpen} onClick={() => { setActivePreview(undefined); setRecordsOpen(true); send({ type: 'menu', open: true }) }}>調査記録</button>
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
      {recordsOpen && <InvestigationRecords state={gameState} records={activePreview?.records} previewLabel={activePreview?.label} returnFocus={activePreview?.invoker ?? recordsButton.current} onClose={() => { setRecordsOpen(false); send({ type: 'menu', open: false }) }} />}
    </section>
  )
}
