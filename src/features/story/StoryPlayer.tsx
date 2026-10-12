import { selectInvestigationRecords } from './investigation'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { InvestigationRecord } from '../../types/investigation'
import type { Scenario } from '../../types/scenario'
import { reduceGameState, selectCurrentNode } from './state'
import type { GameAction } from './state'
import { createPlayback, reducePlayback } from './playback'
import './story.css'
import './presentationFrames.css'
import { StageView, AssetImage } from './StageView'
import { StoryContent } from './StoryContent'
import { resolveBackground } from '../../data/presentation'
import { dialogueSpeaker } from './speaker'
import { selectDateLabel } from './dateTime'
import { SystemDialog } from './SystemDialog'
import { TravelMap } from './TravelMap'
import { matchesCondition, visibleChoices } from './freeAction'
import { loadHistory, saveHistory, MAX_HISTORY_ENTRIES } from './history'
import type { HistoryEntry } from './history'
import { InvestigationRecords } from './InvestigationRecords'
import { SaveControls } from './SaveControls'
import { DialogueWindow } from './DialogueWindow'
import { UiIcon } from './UiIcon'
import { selectSmokingPresentation } from './smoking'

const smokingCutIn = new URL('../../assets/cutins/minato-smoking.png', import.meta.url).href
const nonSmokingCutIn = new URL('../../assets/cutins/minato-non-smoking.png', import.meta.url).href

export function StoryPlayer({ scenario, preview, smokingAllowed, suspended = false }: { scenario: Scenario; preview?: { records: InvestigationRecord[]; label: string; invoker: HTMLElement }; smokingAllowed?: boolean; suspended?: boolean }) {
  const [playback, send] = useReducer(
    (state: ReturnType<typeof createPlayback>, action: Parameters<typeof reducePlayback>[2]) => reducePlayback(scenario, state, action),
    scenario, createPlayback,
  )
  const gameState = playback.game
  const node = selectCurrentNode(scenario, gameState)
  const records = useMemo(() => selectInvestigationRecords(gameState, scenario.records), [gameState, scenario.records])
  const previousRecords = useRef(records)
  const suppressRecordNotice = useRef(false)
  const [recordNotice, setRecordNotice] = useState('')
  const recordNoticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(recordNoticeTimer.current), [])
  useEffect(() => {
    const changed = records.filter(record => record.category === 'people' && JSON.stringify(record) !== JSON.stringify(previousRecords.current.find(previous => previous.id === record.id)))
    previousRecords.current = records
    if (suppressRecordNotice.current) { suppressRecordNotice.current = false; setRecordNotice(''); return }
    if (!changed.length) return
    setRecordNotice(`人物情報を更新：${changed.map(record => record.title).join('、')}`)
    clearTimeout(recordNoticeTimer.current)
    recordNoticeTimer.current = setTimeout(() => setRecordNotice(''), 3000)
  }, [records])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const historyList = useRef<HTMLDivElement>(null)
  useEffect(() => { if (historyOpen && historyList.current) historyList.current.scrollTop = historyList.current.scrollHeight }, [historyOpen])
  const [interval, setInterval] = useState(() => {
    try { const value = Number(localStorage.getItem('detective-saeki-minato.speed') ?? 35); return [0, 15, 35, 70].includes(value) ? value : 35 } catch { return 35 }
  })
  const dispatch = (action: GameAction) => {
    if (!playback.paused && action.type === 'advance' && node.type === 'dialogue') {
      setHistory(entries => [...entries, { speaker: dialogueSpeaker(node, gameState), text: node.text, nodeId: gameState.nodeId }].slice(-MAX_HISTORY_ENTRIES))
    }
    if (action.type === 'reset') { setHistory([]); suppressRecordNotice.current = true }
    send({ type: 'input', origin: { nodeId: gameState.nodeId, generation: playback.generation }, action })
  }
  const menuOpen = playback.paused || suspended
  const [recordsOpen, setRecordsOpen] = useState(false)
  const [activePreview, setActivePreview] = useState<typeof preview>()
  const [smoking, setSmoking] = useState<{ allowed: boolean; hint: string; phase: 'gesture' | 'hint'; imageFailed: boolean }>()
  const [itemSelection, setItemSelection] = useState<{ itemId: string; uses: NonNullable<Scenario['itemUses']> }>()
  const useItem = (itemId: string, useId?: string) => {
    setItemSelection(undefined); setRecordsOpen(false); send({ type: 'menu', open: false })
    send({ type: 'restore', state: reduceGameState(scenario, gameState, { type: 'use-item', itemId, useId }) })
    setRestoreRevision(value => value + 1)
  }
  useEffect(() => {
    if (import.meta.env.DEV && preview) {
      setActivePreview(preview); setRecordsOpen(true); send({ type: 'menu', open: true })
    }
  }, [preview])
  const recordsButton = useRef<HTMLButtonElement>(null)
  const smokingButton = useRef<HTMLButtonElement>(null)
  const dialogueRef = useRef<DialogueWindow>(null)
  const [restoreRevision, setRestoreRevision] = useState(0)
  const acquisition = node.type === 'dialogue' ? node.acquisition : undefined
  const illustration = scenario.nodes[gameState.nodeId].illustration

  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.repeat || event.altKey || event.ctrlKey || event.metaKey
        || menuOpen || recordsOpen || smoking || acquisition || node.type !== 'dialogue') return
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
  }, [menuOpen, recordsOpen, smoking, acquisition, node.type])

  const advanceFromStage = () => {
    if (!menuOpen && !recordsOpen && !smoking && !acquisition && node.type === 'dialogue') dialogueRef.current?.activate()
  }

  if (node.type === 'choice' && node.map) return <section className="story" data-node-id={gameState.nodeId} aria-label="会話シーン"><TravelMap
    key={gameState.nodeId} current={node.map.current} options={visibleChoices(node, gameState)}
    onBack={() => dispatch({ type: 'choose', choiceId: 'return' })} onMove={id => dispatch({ type: 'choose', choiceId: id })} /></section>

  return (
    <section className={`${'options' in node ? 'story has-commands' : 'story'}${menuOpen ? ' menu-open' : ''}${recordsOpen ? ' records-open' : ''}`} data-node-id={gameState.nodeId} aria-label="会話シーン">
      <header className="story-toolbar" inert={recordsOpen || Boolean(smoking) || Boolean(acquisition) || historyOpen}>
        <span className="sr-only">{scenario.title}</span>
        <div className="toolbar-actions">
        <SaveControls state={gameState} scenario={scenario} interval={interval} onIntervalChange={value => {
          setInterval(value); try { localStorage.setItem('detective-saeki-minato.speed', String(value)) } catch { /* 設定はセッション中保持 */ }
        }} onSaved={() => saveHistory(gameState.scenarioId, gameState.nodeId, history)} onRestore={(state) => {
          suppressRecordNotice.current = true
          send({ type: 'restore', state }); setHistory(loadHistory(state.scenarioId, state.nodeId)); setRestoreRevision((value) => value + 1)
        }} onMenuToggle={(open) => send({ type: 'menu', open: open || recordsOpen || historyOpen })} />
        <button ref={recordsButton} type="button" disabled={menuOpen} onClick={() => { setActivePreview(undefined); setRecordsOpen(true); send({ type: 'menu', open: true }) }}><UiIcon name="notebook" /><span>調査記録</span></button>
        <button type="button" disabled={menuOpen} onClick={() => { setHistoryOpen(true); send({ type: 'menu', open: true }) }}><UiIcon name="notebook" /><span>会話履歴</span></button>
        <button ref={smokingButton} type="button" disabled={menuOpen || recordsOpen || Boolean(smoking)} onClick={() => {
          const presentation = selectSmokingPresentation(scenario, gameState)
          setSmoking({ allowed: import.meta.env.DEV ? smokingAllowed ?? presentation.allowed : presentation.allowed, hint: presentation.hint, phase: 'gesture', imageFailed: false })
          send({ type: 'menu', open: true })
        }}><UiIcon name="smoking" /><span>タバコを吸う</span></button>
        </div>
        <div className="scene-context"><span>{resolveBackground(node.stage.backgroundId).name}</span><span>{selectDateLabel(scenario, gameState)}</span></div>
      </header>
      {recordNotice && <div className="record-notice" role="status">{recordNotice}</div>}
      <div className={scenario.nodes[gameState.nodeId].type === 'think' ? 'stage-wrapper is-thinking' : 'stage-wrapper'}>
        <div className="stage-input-area" onClick={advanceFromStage}>
          {illustration?.imageSrc
            ? <AssetImage key={illustration.imageSrc} src={illustration.imageSrc} alt={illustration.alt} className="chapter-illustration" fallback={<StageView stage={{ backgroundId: node.stage.backgroundId, characters: [] }} />} />
            : <StageView stage={illustration ? { backgroundId: node.stage.backgroundId, characters: [] } : node.stage} />}
          {illustration && <div className="chapter-heading" data-illustration-id={illustration.id}>{illustration.heading}</div>}
        </div>
      </div>
      <div className="story-content" inert={menuOpen || Boolean(acquisition)}>
      <StoryContent key={`${gameState.nodeId}:${restoreRevision}`} interval={interval} paused={menuOpen || Boolean(acquisition)} node={node} state={gameState} thinking={scenario.nodes[gameState.nodeId].type === 'think'} dispatch={dispatch} dialogueRef={dialogueRef} />
      </div>
      {smoking && <div className="smoking-overlay" role="dialog" aria-label="喫煙ヒント" aria-modal="true">
        {smoking.imageFailed
          ? <div className="smoking-cut-in-fallback" aria-hidden="true" />
          : <img className="smoking-cut-in" data-variant={smoking.allowed ? 'smoking' : 'non-smoking'}
              src={smoking.allowed ? smokingCutIn : nonSmokingCutIn} alt=""
              onError={() => setSmoking(current => current ? { ...current, imageFailed: true } : current)} />}
        <DialogueWindow key={`${smoking.allowed}:${smoking.phase}`} autoFocus thinking={false} interval={interval} speaker=""
          text={smoking.phase === 'gesture'
            ? smoking.allowed ? '佐伯は電子タバコを手に取り、ひと息ついた。' : '佐伯は口元に手をやり、ここでは吸えないと思い直した。'
            : smoking.hint}
          onAdvance={() => {
            if (smoking.phase === 'gesture') setSmoking(current => current ? { ...current, phase: 'hint' } : current)
            else { setSmoking(undefined); send({ type: 'menu', open: false }); requestAnimationFrame(() => smokingButton.current?.focus()) }
          }} />
      </div>}
      {acquisition && !menuOpen && <SystemDialog key={`${gameState.nodeId}:${restoreRevision}`} title={`${acquisition.title}を受け取った`} onClose={() => dispatch({ type: 'advance' })}>
        <div className="acquisition-photo"><img src={acquisition.imageSrc} alt={acquisition.title} /></div><p>持ち物に加えます。</p>
      </SystemDialog>}
      {historyOpen && <SystemDialog title="会話履歴" label="閉じる" onClose={() => { setHistoryOpen(false); send({ type: 'menu', open: false }) }}>
        <div ref={historyList} className="history-list">{history.length ? history.map((entry, index) => <article key={index}><strong>{entry.speaker || '地の文・心の声'}</strong><p>{entry.text}</p></article>) : <p>会話履歴はまだありません。</p>}</div>
      </SystemDialog>}
      {itemSelection && <SystemDialog title="使用する相手・目的" label="戻る" onClose={() => { setItemSelection(undefined); setRecordsOpen(true); send({ type: 'menu', open: true }) }}>
        <div className="item-use-choices">{itemSelection.uses.map(use => <button key={use.next} type="button" onClick={() => useItem(itemSelection.itemId, use.next)}>{use.label ?? '使用する'}</button>)}</div>
      </SystemDialog>}
      {recordsOpen && <InvestigationRecords state={gameState} records={activePreview?.records ?? records} previewLabel={activePreview?.label} returnFocus={activePreview?.invoker ?? recordsButton.current}
        usableItems={activePreview ? [] : (scenario.itemUses ?? []).filter(use => use.nodeIds.includes(gameState.nodeId) && matchesCondition(gameState, use.condition)).map(use => use.itemId)}
        onUse={itemId => {
          const uses = [...new Map((scenario.itemUses ?? []).filter(use => use.itemId === itemId && use.nodeIds.includes(gameState.nodeId) && matchesCondition(gameState, use.condition)).map(use => [use.next, use])).values()]
          if (uses.length > 1) { setRecordsOpen(false); setItemSelection({ itemId, uses }) }
          else useItem(itemId, uses[0]?.next)
        }}
        onClose={() => { setRecordsOpen(false); send({ type: 'menu', open: false }) }} />}
    </section>
  )
}
