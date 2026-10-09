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
import { DialogueWindow } from './DialogueWindow'
import { UiIcon } from './UiIcon'

const smokingCutIn = new URL('../../assets/cutins/minato-smoking.png', import.meta.url).href
const nonSmokingCutIn = new URL('../../assets/cutins/minato-non-smoking.png', import.meta.url).href

export function StoryPlayer({ scenario, preview, smokingAllowed = false }: { scenario: Scenario; preview?: { records: InvestigationRecord[]; label: string; invoker: HTMLElement }; smokingAllowed?: boolean }) {
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
  const [smoking, setSmoking] = useState<{ allowed: boolean; phase: 'gesture' | 'hint'; imageFailed: boolean }>()
  useEffect(() => {
    if (import.meta.env.DEV && preview) {
      setActivePreview(preview); setRecordsOpen(true); send({ type: 'menu', open: true })
    }
  }, [preview])
  const recordsButton = useRef<HTMLButtonElement>(null)
  const smokingButton = useRef<HTMLButtonElement>(null)
  const dialogueRef = useRef<DialogueWindow>(null)
  const [restoreRevision, setRestoreRevision] = useState(0)

  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.repeat || event.altKey || event.ctrlKey || event.metaKey
        || menuOpen || recordsOpen || smoking || node.type !== 'dialogue') return
      const target = event.target
      if (target instanceof HTMLElement) {
        if (target.closest('input, textarea, select, [contenteditable="true"], summary, a, [role="button"], [role="dialog"], button:not(.dialogue-button)')) return
        // 会話ボタンのEnterも同じactivateへ集約し、ブラウザーの合成clickとの二重入力を防ぐ。
        if (!target.closest('.dialogue-button') && target.closest('button')) return
      }
      event.preventDefault()
      dialogueRef.current?.activate()
    }
    window.addEventListener('keydown', handleEnter)
    return () => window.removeEventListener('keydown', handleEnter)
  }, [menuOpen, recordsOpen, smoking, node.type])

  const advanceFromStage = () => {
    if (!menuOpen && !recordsOpen && !smoking && node.type === 'dialogue') dialogueRef.current?.activate()
  }

  return (
    <section className={`${'options' in node ? 'story has-commands' : 'story'}${menuOpen ? ' menu-open' : ''}${recordsOpen ? ' records-open' : ''}`} aria-label="会話シーン">
      <header className="story-toolbar" inert={recordsOpen || Boolean(smoking)}>
        <span className="sr-only">{scenario.title}</span>
        <div className="toolbar-actions">
        <SaveControls state={gameState} scenario={scenario} onRestore={(state) => { send({ type: 'restore', state }); setRestoreRevision((value) => value + 1) }} onMenuToggle={(open) => send({ type: 'menu', open: open || recordsOpen })} />
        <button ref={recordsButton} type="button" disabled={menuOpen} onClick={() => { setActivePreview(undefined); setRecordsOpen(true); send({ type: 'menu', open: true }) }}><UiIcon name="notebook" /><span>調査記録</span></button>
        <button ref={smokingButton} type="button" disabled={menuOpen || recordsOpen || Boolean(smoking)} onClick={() => { setSmoking({ allowed: smokingAllowed, phase: 'gesture', imageFailed: false }); send({ type: 'menu', open: true }) }}><UiIcon name="smoking" /><span>タバコを吸う</span></button>
        </div>
        <div className="scene-context"><span>{resolveBackground(node.stage.backgroundId).name}</span><span>日時未設定</span></div>
      </header>
      <div className={scenario.nodes[gameState.nodeId].type === 'think' ? 'stage-wrapper is-thinking' : 'stage-wrapper'}>
        <div className="stage-input-area" onClick={advanceFromStage}>
          <StageView stage={node.stage} />
        </div>
      </div>
      <div className="story-content" inert={menuOpen}>
      <StoryContent key={`${gameState.nodeId}:${restoreRevision}`} paused={menuOpen} node={node} state={gameState} thinking={scenario.nodes[gameState.nodeId].type === 'think'} dispatch={dispatch} dialogueRef={dialogueRef} />
      </div>
      {smoking && <div className="smoking-overlay" role="dialog" aria-label="喫煙ヒント" aria-modal="true">
        {smoking.imageFailed
          ? <div className="smoking-cut-in-fallback" aria-hidden="true" />
          : <img className="smoking-cut-in" data-variant={smoking.allowed ? 'smoking' : 'non-smoking'}
              src={smoking.allowed ? smokingCutIn : nonSmokingCutIn} alt=""
              onError={() => setSmoking(current => current ? { ...current, imageFailed: true } : current)} />}
        <DialogueWindow key={`${smoking.allowed}:${smoking.phase}`} autoFocus thinking={false} speaker=""
          text={smoking.phase === 'gesture'
            ? smoking.allowed ? '佐伯は電子タバコを手に取り、ひと息ついた。' : '佐伯は口元に手をやり、ここでは吸えないと思い直した。'
            : '手掛かりに迷ったら、澪から話を聞き直し、兄の写真も確かめてみよう。'}
          onAdvance={() => {
            if (smoking.phase === 'gesture') setSmoking(current => current ? { ...current, phase: 'hint' } : current)
            else { setSmoking(undefined); send({ type: 'menu', open: false }); requestAnimationFrame(() => smokingButton.current?.focus()) }
          }} />
      </div>}
      {recordsOpen && <InvestigationRecords state={gameState} records={activePreview?.records} previewLabel={activePreview?.label} returnFocus={activePreview?.invoker ?? recordsButton.current} onClose={() => { setRecordsOpen(false); send({ type: 'menu', open: false }) }} />}
    </section>
  )
}
