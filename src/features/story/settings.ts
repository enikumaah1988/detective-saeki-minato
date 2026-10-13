export const MESSAGE_SPEEDS = [70, 35, 15, 0] as const
export const MESSAGE_SPEED_LABELS = ['ゆっくり', '標準', '速い', '一括表示'] as const
export type AudioSettings = { bgm: number; se: number }
const audioKey = 'detective-saeki-minato.audio'
export function loadAudioSettings(): AudioSettings {
  try {
    const value = JSON.parse(localStorage.getItem(audioKey) ?? '{}')
    const volume = (input: unknown) => typeof input === 'number' && Number.isFinite(input) && input >= 0 && input <= 100 ? Math.round(input / 10) * 10 : 70
    return { bgm: volume(value?.bgm), se: volume(value?.se) }
  } catch { return { bgm: 70, se: 70 } }
}
export function saveAudioSettings(value: AudioSettings) {
  try { localStorage.setItem(audioKey, JSON.stringify(value)) } catch { /* セッション中の設定は保持する。 */ }
}
