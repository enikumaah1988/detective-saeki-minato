import { UiIcon } from './UiIcon'
import { useRef, useState } from 'react'
import { SystemDialog } from './SystemDialog'
import type { GameState } from '../../types/gameState'
import type { Scenario } from '../../types/scenario'
import { deleteSave, loadGame, saveGame } from './storage'
import type { StoredLoadResult } from './storage'
import { SettingsSlider } from './SettingsSlider'
import { MESSAGE_SPEEDS, MESSAGE_SPEED_LABELS, loadAudioSettings, saveAudioSettings } from './settings'

const loadMessages: Record<Extract<StoredLoadResult, { ok: false }>['reason'], string> = {
  'no-save': '保存データがありません。',
  'invalid-format': '保存データが壊れているため、読み込めません。',
  'unsupported-version': 'この保存データは現在のゲームでは読み込めません。',
  'unknown-scenario': '保存したシナリオが見つかりません。',
  'unknown-node': '保存した会話の位置が見つかりません。',
  'storage-unavailable': 'ブラウザーの保存機能を利用できません。設定をご確認ください。',
}

export function SaveControls({ state, scenario, onRestore, onMenuToggle, interval = 35, onIntervalChange, onSaved }: {
  state: GameState
  scenario: Scenario
  onRestore: (state: GameState) => void
  onMenuToggle?: (open: boolean) => void
  interval?: number
  onIntervalChange?: (interval: number) => void
  onSaved?: () => void
}) {
  const details = useRef<HTMLDetailsElement>(null)
  const [loaded, setLoaded] = useState<GameState>()
  const [audio, setAudio] = useState(loadAudioSettings)
  const changeVolume = (kind: 'bgm' | 'se', point: number) => {
    const next = { ...audio, [kind]: point * 10 }; setAudio(next); saveAudioSettings(next)
  }
  const [message, setMessage] = useState('セーブは１件です。セーブすると上書きされます。')
  const save = () => {
    const result = saveGame(state)
    if (result.ok) onSaved?.()
    setMessage(result.ok ? 'セーブしました。' : 'セーブできませんでした。ブラウザーの設定や空き容量をご確認ください。')
  }
  const load = () => {
    const result = loadGame([scenario])
    if (result.ok) {
      setLoaded(result.state)
    } else {
      setMessage(loadMessages[result.reason])
    }
  }
  const remove = () => {
    const result = deleteSave()
    setMessage(result.ok ? '削除しました。保存データはありません。' : '保存データを削除できませんでした。ブラウザーの設定をご確認ください。')
  }

  return (
    <details ref={details} className="save-controls" onToggle={(event) => onMenuToggle?.(event.currentTarget.open)}>
      <summary aria-label="メニュー" onClick={(event) => onMenuToggle?.(!(event.currentTarget.parentElement as HTMLDetailsElement).open)}><UiIcon name="menu" /><span className="menu-caption">MENU</span></summary>
      <div className="save-panel">
      <div className="save-actions" aria-label="セーブ操作">
        <button type="button" onClick={save}><UiIcon name="save" /><span>セーブ</span></button>
        <button type="button" onClick={load}><UiIcon name="load" /><span>ロード</span></button>
        <button type="button" onClick={remove}><UiIcon name="delete" /><span>セーブデータ削除</span></button>
      </div>
      <SettingsSlider label="メッセージスピード" value={Math.max(0, MESSAGE_SPEEDS.indexOf(interval as typeof MESSAGE_SPEEDS[number]))}
        maximum={3} labels={MESSAGE_SPEED_LABELS} onChange={point => onIntervalChange?.(MESSAGE_SPEEDS[point])} />
      <SettingsSlider label="BGM音量" value={audio.bgm / 10} maximum={10} onChange={point => changeVolume('bgm', point)} />
      <SettingsSlider label="SE音量" value={audio.se / 10} maximum={10} onChange={point => changeVolume('se', point)} />
      <p role="status">{message}</p>
      </div>
      {loaded && <SystemDialog title="ロードしました" dismissible={false} onClose={() => {
        const restored = loaded
        setLoaded(undefined)
        details.current!.open = false
        onMenuToggle?.(false)
        setMessage('セーブは１件です。セーブすると上書きされます。')
        onRestore(restored)
      }} />}
    </details>
  )
}
