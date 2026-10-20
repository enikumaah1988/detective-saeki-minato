import { UiIcon } from './UiIcon'
import type { IconName } from './UiIcon'
import { displayText } from './displayText'
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { GameState } from '../../types/gameState'
import type { InvestigationRecord, RecordCategory } from '../../types/investigation'
import { RECORD_CATEGORIES, selectInvestigationRecords } from './investigation'
import { AssetImage } from './StageView'
import './recordsFrames.css'
import { layoutGamePanel } from './panelLayout'

export function InvestigationRecords({ state, onClose, returnFocus, returnFocusRef, previewLabel, records = selectInvestigationRecords(state), usableItems = [], onUse }: {
  state: GameState
  onClose: () => void
  returnFocus?: HTMLElement | null
  returnFocusRef?: RefObject<HTMLElement | null>
  previewLabel?: string
  records?: readonly InvestigationRecord[]
  usableItems?: string[]
  onUse?: (itemId: string) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const [category, setCategory] = useState<RecordCategory>('people')
  const [selectedId, setSelectedId] = useState<string>()
  const entries = records.filter(record => record.category === category)
  const selected = entries.find(entry => entry.id === selectedId) ?? entries[0]
  const selectTab = (index: number) => {
    setCategory(RECORD_CATEGORIES[index].id)
    setSelectedId(undefined)
    tabs.current[index]?.focus()
  }

  useEffect(() => {
    const element = dialog.current!
    const game = element.parentElement!
    const layout = () => {
      layoutGamePanel(element, game)
    }
    const invoker = returnFocus ?? returnFocusRef?.current ?? document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    layout()
    element.showModal() // ブラウザーのモーダルによりDEVやHUDへのフォーカス移動も止める。
    tabs.current[0]?.focus()
    const observer = new ResizeObserver(layout)
    observer.observe(game)
    window.addEventListener('resize', layout)
    return () => {
      observer.disconnect(); window.removeEventListener('resize', layout); element.close()
      document.body.style.overflow = previousOverflow
      if (invoker?.isConnected) invoker.focus()
    }
  }, [returnFocus, returnFocusRef])

  return <dialog ref={dialog} className="investigation-records" aria-labelledby="record-title" aria-modal="true"
    onKeyDown={event => {
      if (event.key !== 'Tab' || event.ctrlKey || event.altKey || event.metaKey) return
      const targets = [...event.currentTarget.querySelectorAll<HTMLElement>('button, [tabindex]')]
        .filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && element.getClientRects().length > 0)
      const index = targets.indexOf(document.activeElement as HTMLElement)
      if (event.shiftKey ? index <= 0 : index < 0 || index === targets.length - 1) {
        event.preventDefault()
        targets[event.shiftKey ? targets.length - 1 : 0]?.focus()
      }
    }} onCancel={event => { event.preventDefault(); onClose() }}>
    <header className="record-header"><h2 id="record-title"><UiIcon name="notebook"/>調査記録{previewLabel && <span className="record-preview-label">DEV・UI確認用：{previewLabel}</span>}</h2><button type="button" onClick={onClose} aria-label="調査記録を閉じる"><UiIcon name="close"/><span>閉じる</span></button></header>
    <div className="record-tabs" role="tablist" aria-label="調査記録の分類">
      {RECORD_CATEGORIES.map((tab, index) => <button key={tab.id} ref={element => { tabs.current[index] = element }} type="button" role="tab"
        id={`record-tab-${tab.id}`} aria-selected={category === tab.id} aria-controls="record-panel" tabIndex={category === tab.id ? 0 : -1}
        onClick={() => selectTab(index)} onKeyDown={event => {
          const next = event.key === 'ArrowRight' ? (index + 1) % RECORD_CATEGORIES.length
            : event.key === 'ArrowLeft' ? (index + RECORD_CATEGORIES.length - 1) % RECORD_CATEGORIES.length
            : event.key === 'Home' ? 0 : event.key === 'End' ? RECORD_CATEGORIES.length - 1 : undefined
          if (next !== undefined) { event.preventDefault(); selectTab(next) }
        }}><UiIcon name={({people: 'people', evidence: 'evidence', events: 'events', belongings: 'bag'} as Record<RecordCategory, IconName>)[tab.id]}/><span>{tab.label}</span></button>)}
    </div>
    <div id="record-panel" className="record-body" role="tabpanel" aria-labelledby={`record-tab-${category}`}>
      <section className="record-list" aria-label={`${RECORD_CATEGORIES.find(tab => tab.id === category)!.label}の一覧`} tabIndex={0}>
        {entries.length ? <ul>{entries.map(entry => <li key={entry.id}><button type="button" aria-pressed={selected?.id === entry.id} onClick={() => setSelectedId(entry.id)}>
          {entry.category === 'people' && <span className="record-portrait-thumb" aria-hidden="true">{entry.imageSrc ? <AssetImage className="record-portrait-crop" src={entry.imageSrc} alt="" /> : <span className="portrait-unknown">?</span>}</span>}
          {entry.timeLabel && <span className="record-time">{displayText(entry.timeLabel.replace(/^\d{4}年/, ''))}</span>}<span>{displayText(entry.title)}</span>
        </button></li>)}</ul> : <p className="record-empty">記録はありません</p>}
      </section>
      <section className="record-detail" aria-label="選択した記録の詳細" tabIndex={0}>
        {selected ? <>
          <h3>{displayText(selected.title)}</h3>
          {selected.timeLabel && <p className="record-time">{displayText(selected.timeLabel.replace(/^\d{4}年/, ''))}</p>}
          {selected.imageSrc && (selected.category === 'people'
            ? <div className="record-portrait"><AssetImage key={selected.imageSrc} className="record-portrait-crop" src={selected.imageSrc} alt={displayText(selected.imageAlt ?? selected.title)} /></div>
            : selected.mediaKind === 'photo' ? <div className="record-item-photo"><AssetImage key={selected.imageSrc} className="photo-image" src={selected.imageSrc} alt={displayText(selected.imageAlt ?? selected.title)} /></div>
            : <AssetImage key={selected.imageSrc} className="record-image" src={selected.imageSrc} alt={displayText(selected.imageAlt ?? selected.title)} />)}
          {selected.category === 'people' && !selected.imageSrc && <div className="record-portrait portrait-unknown" aria-label={displayText(selected.faceKnown ? selected.title : '顔は未確認')}>{selected.faceKnown ? '◉' : 'UNKNOWN'}</div>}
          {selected.details.map((text, index) => <p key={index}>{displayText(text)}</p>)}
          {selected.category === 'belongings' && usableItems.includes(selected.id) && <button className="use-item" type="button" onClick={() => onUse?.(selected.id)}><UiIcon name="use"/><span>使用する</span></button>}
        </> : null}
      </section>
    </div>
  </dialog>
}
