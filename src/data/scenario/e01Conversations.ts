import type { Choice, Condition, Scenario } from '../../types/scenario'
import { resolveSpeakerName } from '../presentation'

// Explicit addressees from the confirmed 30-scene dialogue, not the stage cast.
// Police-only scenes, BAR, observations and fixed story dialogue are unchanged.
const conversations: Record<string, Record<string, string[]>> = {
  'S01-topic': { akari: ['S01-last-seen', 'S01-work', 'S01-recent', 'S01-friends', 'S01-family'] },
  'S02-topic': { mio: ['S02-company'] },
  'S03-topic': { miyahara: ['S03-work', 'S03-search', 'S03-personality', 'S03-fujii'] },
  'S04-topic': { 'building-manager': ['S04-route'] },
  'S07-talk': { 'night-manager': ['S07-action-0'] },
  'S08-talk': { 'night-manager': ['S08-action-1'] },
  'S10-talk': { mio: ['S10-action-2'] },
  'S11-talk': { akari: ['S11-action-0', 'S11-action-1'] },
  'S12-talk': { miyahara: ['S12-action-0'], kuroda: ['S12-action-1'] },
  'S13-talk': { miyahara: ['S13-action-0', 'S13-action-1', 'S13-action-2'] },
  'S14-talk': { mio: ['S14-action-1'] },
  'S15-talk': { technician: ['S15-action-0'] },
  'S16-talk': { 'company-reviewer': ['S16-action-0', 'S16-action-1', 'S16-action-2'] },
  'S18-talk': { 'company-reviewer': ['S18-action-0', 'S18-action-1', 'S18-action-2'] },
  'S19-talk': { mio: ['S19-action-1'] },
  'S20-talk': { 'building-manager': ['S20-action-1'] },
  'S21-talk': { okumura: ['S21-action-0'], segawa: ['S21-action-1'] },
  'S26-talk': { mio: ['S26-action-1'] },
  'S29-talk': { okumura: ['S29-action-0', 'S29-action-1'] },
  'S30-talk': { mio: ['S30-action-0'] },
}

export function withEpisode01Conversations(scenario: Scenario): Scenario {
  const nodes = { ...scenario.nodes }
  const nodeTimes = { ...scenario.nodeTimes }
  for (const [peopleId, people] of Object.entries(conversations)) {
    const original = nodes[peopleId]
    if (original.type !== 'topic') throw new Error(`会話一覧がありません: ${peopleId}`)
    const menuId = original.parent.nodeId
    const menu = nodes[menuId]
    if (menu.type !== 'choice') throw new Error(`会話の親が不正です: ${menuId}`)
    nodes[menuId] = { ...menu,
      implementedCommands: menu.implementedCommands?.map(id => id === 'talk' ? 'speak' : id),
      options: menu.options.map(option => option.id === 'talk' ? { ...option, id: 'speak', label: '話す' } : option),
    }
    const peopleChoices: Choice[] = []
    for (const [person, ids] of Object.entries(people)) {
      const topicsId = `${peopleId}-${person}`
      const present = scenario.scenes?.[original.sceneId ?? '']?.characters?.find(character => character.characterId === person)?.condition
      const options = ids.map(id => {
        const option = original.options.find(option => option.id === id)
        if (!option) throw new Error(`話題がありません: ${id}`)
        // Preserve initial/repeat dialogue IDs and updates, changing only their return.
        for (const start of [option.next, option.repeatNext]) {
          let current = start
          const visited = new Set<string>()
          while (current && nodes[current]?.type === 'dialogue' && !visited.has(current)) {
            visited.add(current)
            const node = nodes[current]
            if (node.type !== 'dialogue') break
            if (node.next === menuId) { nodes[current] = { ...node, next: topicsId }; break }
            current = node.next
          }
        }
        return present ? { ...option, condition: option.condition
          ? { type: 'all' as const, conditions: [present, option.condition] } : present } : option
      })
      nodes[topicsId] = { ...original, heading: '話す', prompt: '話題を選ぶ', options,
        parent: { commandId: 'speak', nodeId: peopleId } }
      nodeTimes[topicsId] = nodeTimes[peopleId]
      const available: Condition = { type: 'any', conditions: options.map(option => option.condition ?? { type: 'all', conditions: [] }) }
      peopleChoices.push({ id: person, label: resolveSpeakerName(person), next: topicsId, condition: available })
    }
    if (Object.values(people).flat().length !== original.options.length) throw new Error(`未分類の話題: ${peopleId}`)
    // Keep the former flat-menu save ID: LOAD resumes at person selection without
    // granting information or replaying a conversation. One-person scenes use it too.
    nodes[peopleId] = { ...original, selection: 'person', heading: '話す', prompt: '相手を選ぶ',
      parent: { commandId: 'speak', nodeId: menuId }, options: peopleChoices }
    const available: Condition = { type: 'any', conditions: peopleChoices.map(option => option.condition ?? { type: 'all', conditions: [] }) }
    const updatedMenu = nodes[menuId]
    if (updatedMenu.type === 'choice') nodes[menuId] = { ...updatedMenu, options: updatedMenu.options.map(option => option.id === 'speak'
      ? { ...option, condition: option.condition ? { type: 'all', conditions: [option.condition, available] } : available } : option) }
  }
  return { ...scenario, nodes, nodeTimes }
}
