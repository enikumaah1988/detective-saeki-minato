import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import type { Scenario } from '../types/scenario'
import type { GameState } from '../types/gameState'
import type { HistoryEntry } from '../features/story/history'
import { readSlots, loadSlot } from '../features/story/saveSlots'
import type { SlotId } from '../features/story/saveSlots'
import { SystemDialog } from '../features/story/SystemDialog'
import { SettingsSlider } from '../features/story/SettingsSlider'
import { MESSAGE_SPEEDS, MESSAGE_SPEED_LABELS, loadAudioSettings, saveAudioSettings } from '../features/story/settings'
import { displayText } from '../features/story/displayText'
import { UiIcon } from '../features/story/UiIcon'
import './titleScreen.css'

export type TitleSession = { state: GameState; history: HistoryEntry[] }
const background = new URL('../assets/images/ui/title-office-night.png', import.meta.url).href

export function TitleScreen({ scenario, onStart, logoSrc }: { scenario: Scenario; onStart: (session?: TitleSession) => void; logoSrc?: string }) {
  const [dialog, setDialog] = useState<'load' | 'settings'>()
  const invoker = useRef<HTMLButtonElement>(null)
  const [message, setMessage] = useState('')
  const [slots, setSlots] = useState<ReturnType<typeof readSlots>>()
  const [audio, setAudio] = useState(loadAudioSettings)
  const [speed, setSpeed] = useState(() => {
    try { const value = Number(localStorage.getItem('detective-saeki-minato.speed') ?? 35); return MESSAGE_SPEEDS.includes(value as typeof MESSAGE_SPEEDS[number]) ? value : 35 } catch { return 35 }
  })
  const close = () => { setDialog(undefined); setMessage(''); requestAnimationFrame(() => invoker.current?.focus()) }
  const openLoad = (event: MouseEvent<HTMLButtonElement>) => {
    invoker.current = event.currentTarget
    setDialog('load'); setMessage('')
    try { setSlots(readSlots()) } catch { setSlots(undefined); setMessage('保存データを確認できません。') }
  }
  const load = (id: SlotId) => {
    const result = loadSlot(id, [scenario])
    if (result.ok) onStart({ state: result.state, history: result.history })
    else setMessage('この保存データを読み込めません。')
  }
  return <section className="story title-screen" aria-label="タイトル画面">
    <img className="title-screen-background" src={background} alt="ブラインド越しに新宿の夜景が見える探偵事務所" />
    <div className="title-screen-shade" aria-hidden="true" />
    <div className="title-screen-content" inert={Boolean(dialog)}>
      <header className="title-screen-brand">
        {logoSrc ? <h1><img className="title-screen-logo" src={logoSrc} alt="探偵 佐伯湊" /></h1> : <>
          <h1><span className="title-screen-prefix">探偵</span> 佐伯湊</h1>
          <p className="title-screen-english">DETECTIVE SAEKI MINATO</p>
        </>}
      </header>
      <nav className="title-screen-menu" aria-label="タイトルメニュー">
        <button type="button" aria-label="NEW GAME" onClick={() => onStart()}><UiIcon name="play" /><span>NEW GAME</span></button>
        <button type="button" aria-label="CONTINUE" onClick={openLoad}><UiIcon name="load" /><span>CONTINUE</span></button>
        <button type="button" aria-label="SETTINGS" onClick={event => { invoker.current = event.currentTarget; setDialog('settings') }}><UiIcon name="settings" /><span>SETTINGS</span></button>
      </nav>
    </div>
    {dialog === 'load' && <SystemDialog title="CONTINUE" label="戻る" onClose={close}>
      <div className="save-slot-list">{(['auto', 0, 1, 2] as const).map(id => {
        const slot = id === 'auto' ? slots?.auto : slots?.manual[id]
        const name = id === 'auto' ? 'AUTO' : `SAVE ${id + 1}`
        return <button key={id} type="button" disabled={!slot} aria-label={displayText(name)} onClick={() => load(id)}><strong>{displayText(name)}</strong><span>{slot ? displayText(slot.label) : '空き枠'}</span></button>
      })}</div>
      {slots && !slots.auto && !slots.manual.length && <p>保存データはありません。</p>}
      {message && <p role="status">{message}</p>}
    </SystemDialog>}
    {dialog === 'settings' && <SystemDialog title="SETTINGS" label="戻る" onClose={close}>
      <SettingsSlider label="メッセージスピード" value={MESSAGE_SPEEDS.indexOf(speed as typeof MESSAGE_SPEEDS[number])} maximum={3} labels={MESSAGE_SPEED_LABELS} onChange={point => {
        const value = MESSAGE_SPEEDS[point]; setSpeed(value)
        try { localStorage.setItem('detective-saeki-minato.speed', String(value)) } catch { /* セッション中は保持 */ }
      }} />
      {(['bgm', 'se'] as const).map(kind => <SettingsSlider key={kind} label={kind === 'bgm' ? 'BGM音量' : 'SE音量'} value={audio[kind]} maximum={100} onChange={value => {
        const next = { ...audio, [kind]: value }; setAudio(next); saveAudioSettings(next)
      }} />)}
    </SystemDialog>}
  </section>
}
