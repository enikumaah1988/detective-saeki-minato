import type { Scenario } from '../../types/scenario'
import type { GameState } from '../../types/gameState'
export function selectDateLabel(scenario: Scenario, state: GameState) {
  const current = scenario.nodeTimes?.[state.nodeId] ?? scenario.dateLabel ?? '午後'
  const stamps = state.acquiredInformation.filter(id => id.startsWith('clock:')).map(id => id.slice(6)).sort()
  const latest = stamps.at(-1)
  const key = (label: string) => {
    const match = label.match(/(\d{4})年(\d+)月(\d+)日.*?(\d{2}):(\d{2})/)
    return match ? `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}T${match[4]}:${match[5]}:00` : ''
  }
  if (latest && latest > key(current)) {
    const date = new Date(latest.slice(0, 10))
    return `${Number(latest.slice(5, 7))}月${Number(latest.slice(8, 10))}日（${'日月火水木金土'[date.getUTCDay()]}）${latest.slice(11, 16)}`
  }
  return current.replace(/^\d{4}年/, '')
}
