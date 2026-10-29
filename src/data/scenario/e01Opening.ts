import type { Scenario } from '../../types/scenario'
import { episodePrologue } from './episodePrologue'
import { revisionData } from './revisionData'
import { e01CompletedPart1Lines } from './e01CompletedPart1Lines'

// Restore the established opening around the frozen 30-scene script. Existing
// S01 nodes stay intact so saves resume where they were made, without a replay.
export function withEpisode01Opening(scenario: Scenario): Scenario {
  const nodes = { ...scenario.nodes }
  const office = 'S01-opening-office'
  const prologue = 'S01-opening-prologue'
  const menu = 'S01-opening-menu'
  const scenes = { ...scenario.scenes,
    [prologue]: { backgroundId: 'prologue', characters: [], smokingAllowed: false },
    [office]: { backgroundId: 'office-before-noon', characters: [
      { characterId: 'minato', expression: 'normal', position: 'left' as const },
      { characterId: 'mio', expression: 'normal', position: 'right' as const },
    ] },
  }
  const meta = { stage: scenes[office], sceneId: office, historyScope: 'S01', savePhaseId: 'S01' }
  const daily = revisionData.scenes.find(scene => scene.id === 'P1-01')
  if (!daily) throw new Error('既存の日常場面P1-01がありません')
  const schedule = daily.speak.find(action => action.id === 'p1-schedule')
  if (!schedule) throw new Error('既存の日常会話「今日の予定」がありません')
  const dialogue = (id: string, lines: readonly { speakerId: string; text: string }[], next: string, update?: 'addHeardTopic' | 'addInspectedTarget') => {
    lines.forEach((line, index) => {
      nodes[index ? `${id}-${index}` : id] = { ...meta, type: 'dialogue', ...line,
        next: index === lines.length - 1 ? next : `${id}-${index + 1}`,
        ...(update && index === lines.length - 1 ? { updates: [{ type: update, id }] } : {}),
      }
    })
  }
  episodePrologue.forEach((text, index) => {
    nodes[`${prologue}-${index + 1}`] = { ...meta, stage: scenes[prologue], sceneId: prologue,
      historyScope: 'prologue', hideConversationToolbar: true, type: 'dialogue', speakerId: 'narrator', text,
      next: index === episodePrologue.length - 1 ? 'S01-opening-cover' : `${prologue}-${index + 2}` }
  })
  nodes['S01-opening-cover'] = { ...meta, stage: scenes[prologue], sceneId: prologue,
    hideConversationToolbar: true, type: 'dialogue', speakerId: 'narrator', text: '第1部　消えた男', next: 'S01-opening-daily',
    illustration: { id: 'E01-C1-IN', alt: 'Episode 01 第1部の仮扉絵', heading: '探偵 佐伯湊',
      subtitle: 'Episode 01　消された記録 — 第1部　消えた男', provisional: true } }
  // Only the compatible establishing narration and schedule topic are reused.
  // The old light-roast coffee and intercom arrival are not mixed into the new script.
  dialogue('S01-opening-daily', daily.intro.slice(0, 2), menu)
  dialogue('S01-opening-schedule', schedule.lines, 'S01-opening-topics', 'addHeardTopic')
  dialogue('S01-opening-window', e01CompletedPart1Lines['S01-調べる：窓'], 'S01-opening-targets', 'addInspectedTarget')
  nodes[menu] = { ...meta, type: 'choice', mode: 'free-action', keepQuestions: true,
    implementedCommands: ['speak', 'look'], prompt: '何をしますか？',
    options: [{ id: 'speak', label: '話す', next: 'S01-opening-people' },
      { id: 'look', label: '調べる', next: 'S01-opening-targets' }],
    empty: { label: '会話に戻る', next: 'S01-intro' } }
  nodes['S01-opening-people'] = { ...meta, type: 'topic', selection: 'person', heading: '話す', prompt: '相手を選ぶ',
    parent: { commandId: 'speak', nodeId: menu }, options: [{ id: 'mio', label: '澪', next: 'S01-opening-topics' }] }
  nodes['S01-opening-topics'] = { ...meta, type: 'topic', heading: '話す', prompt: '話題を選ぶ',
    parent: { commandId: 'speak', nodeId: 'S01-opening-people' },
    options: [{ id: 'S01-opening-schedule', label: '今日の予定', next: 'S01-opening-schedule' },
      { id: 'S01-opening-coffee', label: 'コーヒー', next: 'S01-intro', required: true }] }
  nodes['S01-opening-targets'] = { ...meta, type: 'inspect', prompt: 'どこを調べますか？',
    parent: { commandId: 'look', nodeId: menu }, options: [{ id: 'S01-opening-window', label: '窓', next: 'S01-opening-window' }] }
  return { ...scenario, start: `${prologue}-1`, nodes, scenes,
    nodeTimes: { ...scenario.nodeTimes, ...Object.fromEntries(Object.keys(nodes).filter(id => id.startsWith('S01-opening-'))
      .map(id => [id, '2026年10月7日（水）午前'])) } }
}
