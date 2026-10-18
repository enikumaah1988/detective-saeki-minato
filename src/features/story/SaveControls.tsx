import { UiIcon } from './UiIcon'
import { useRef, useState } from 'react'
import { SystemDialog } from './SystemDialog'
import type { GameState } from '../../types/gameState'
import type { Scenario } from '../../types/scenario'
import type { HistoryEntry } from './history'
import { readSlots, writeSlot, loadSlot } from './saveSlots'
import type { SaveSlot, SlotId } from './saveSlots'
import { SettingsSlider } from './SettingsSlider'
import { MESSAGE_SPEEDS, MESSAGE_SPEED_LABELS, loadAudioSettings, saveAudioSettings } from './settings'
import { displayText } from './displayText'
import { selectDateLabel } from './dateTime'

export function SaveControls({ state, scenario, history = [], onRestore, onMenuToggle, interval = 35, onIntervalChange, onReturnToTitle }: {
  state: GameState; scenario: Scenario; history?: HistoryEntry[];
  onRestore: (state: GameState, history: HistoryEntry[]) => void;
  onMenuToggle?: (open: boolean) => void; interval?: number; onIntervalChange?: (interval: number) => void; onReturnToTitle?: () => void
}) {
  const details=useRef<HTMLDetailsElement>(null)
  const [audio,setAudio]=useState(loadAudioSettings)
  const [saved,setSaved]=useState(false)
  const [message,setMessage]=useState('')
  const [slots,setSlots]=useState<{auto:SaveSlot|null;manual:SaveSlot[]}>()
  const [loaded,setLoaded]=useState<{state:GameState;history:HistoryEntry[]}>()
  const [confirmTitle,setConfirmTitle]=useState(false)
  const closeMenu=()=>{details.current!.open=false;onMenuToggle?.(false)}
  const save=()=>{
    const result=writeSlot(state,'manual',selectDateLabel(scenario,state),history)
    setMessage(result.ok?'':'保存できませんでした。ブラウザーの設定や空き容量をご確認ください。')
    if(result.ok)setSaved(true)
  }
  const openLoad=()=>{try{setSlots(readSlots());setMessage('')}catch{setMessage('保存データを確認できません。既存のデータは変更していません。')}}
  const load=(id:SlotId)=>{
    const result=loadSlot(id,[scenario])
    if(result.ok){setSlots(undefined);setLoaded(result)}
    else setMessage(result.reason==='no-save'?'この枠は空です。':'この保存データを読み込めません。')
  }
  return <details ref={details} className="save-controls" onToggle={event=>onMenuToggle?.(event.currentTarget.open)}>
    <summary aria-label="メニュー" onClick={event=>onMenuToggle?.(!(event.currentTarget.parentElement as HTMLDetailsElement).open)}><UiIcon name="menu"/><span className="menu-caption">MENU</span></summary>
    <div className="save-panel">
      <div className="save-actions" aria-label="保存操作">
        <button type="button" onClick={save}><UiIcon name="save"/>SAVE</button>
        <button type="button" onClick={openLoad}><UiIcon name="load"/>LOAD</button>
        {onReturnToTitle && <button type="button" onClick={()=>setConfirmTitle(true)}><UiIcon name="home"/>RETURN TO TITLE</button>}
      </div>
      <hr className="save-settings-divider"/>
      <SettingsSlider label="メッセージスピード" value={Math.max(0,MESSAGE_SPEEDS.indexOf(interval as typeof MESSAGE_SPEEDS[number]))} maximum={3} labels={MESSAGE_SPEED_LABELS} onChange={point=>onIntervalChange?.(MESSAGE_SPEEDS[point])}/>
      {(['bgm','se'] as const).map(kind=><SettingsSlider key={kind} label={kind==='bgm'?'BGM音量':'SE音量'} value={audio[kind]} maximum={100} onChange={value=>{const next={...audio,[kind]:value};setAudio(next);saveAudioSettings(next)}}/>)}
      {message&&<p role="status">{message}</p>}
    </div>
    {confirmTitle&&<SystemDialog title="タイトルに戻りますか？" label="戻らない" initialFocus="close" onClose={()=>setConfirmTitle(false)}>
      <p>保存していない進行は失われます。</p>
      <button type="button" onClick={()=>onReturnToTitle?.()}>タイトルに戻る</button>
    </SystemDialog>}
    {saved&&<SystemDialog title="セーブしました" dismissible={false} onClose={()=>{setSaved(false);setMessage('');closeMenu()}}/>}
    {slots&&<SystemDialog title="LOAD" label="戻る" onClose={()=>{setSlots(undefined);setMessage('')}}>
      <div className="save-slot-list">{(['auto',0,1,2] as const).map(id=>{
        const slot=id==='auto'?slots.auto:slots.manual[id],name=id==='auto'?'AUTO':`SAVE ${id+1}`
        return <button type="button" key={id} disabled={!slot} aria-label={displayText(name)} onClick={()=>load(id)}><strong>{displayText(name)}</strong><span>{slot?displayText(slot.label):'空き枠'}</span></button>
      })}</div>{message&&<p role="status">{message}</p>}
    </SystemDialog>}
    {loaded&&<SystemDialog title="ロードしました" dismissible={false} onClose={()=>{const restored=loaded;setLoaded(undefined);closeMenu();onRestore(restored.state,restored.history)}}/>}
  </details>
}
