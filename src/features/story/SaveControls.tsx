import { useState } from 'react'
import type { GameState } from '../../types/gameState'
import type { Scenario } from '../../types/scenario'
import { deleteSave, loadGame, saveGame } from './storage'
import type { StoredLoadResult } from './storage'

const loadMessages: Record<Extract<StoredLoadResult, { ok: false }>['reason'], string> = {
  'no-save': '保存データがありません。',
  'invalid-format': '保存データが壊れているため、読み込めません。',
  'unsupported-version': 'この保存データは現在のゲームでは読み込めません。',
  'unknown-scenario': '保存したシナリオが見つかりません。',
  'unknown-node': '保存した会話の位置が見つかりません。',
  'storage-unavailable': 'ブラウザーの保存機能を利用できません。設定をご確認ください。',
}

export function SaveControls({ state, scenario, onRestore }: {
  state: GameState
  scenario: Scenario
  onRestore: (state: GameState) => void
}) {
  const [message, setMessage] = useState('セーブは1件です。セーブすると上書きされます。')
  const save = () => {
    const result = saveGame(state)
    setMessage(result.ok ? 'セーブしました。' : 'セーブできませんでした。ブラウザーの設定や空き容量をご確認ください。')
  }
  const load = () => {
    const result = loadGame([scenario])
    if (result.ok) {
      onRestore(result.state)
      setMessage('ロードしました。')
    } else {
      setMessage(loadMessages[result.reason])
    }
  }
  const remove = () => {
    const result = deleteSave()
    setMessage(result.ok ? '削除しました。保存データはありません。' : '保存データを削除できませんでした。ブラウザーの設定をご確認ください。')
  }

  return (
    <div className="save-controls">
      <div className="save-actions" aria-label="セーブ操作">
        <button type="button" onClick={save}>セーブ</button>
        <button type="button" onClick={load}>ロード</button>
        <button type="button" onClick={remove}>セーブデータ削除</button>
      </div>
      <p role="status">{message}</p>
    </div>
  )
}
