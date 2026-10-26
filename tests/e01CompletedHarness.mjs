import assert from 'node:assert/strict'
import { createServer } from './viteServer.mjs'

export async function loadCompleted() {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { e01CompletedPart1: scenario } = await server.ssrLoadModule('/src/data/scenario/e01CompletedPart1.ts')
    const catalog = await server.ssrLoadModule('/src/data/scenario/catalog.ts')
    const state = await server.ssrLoadModule('/src/features/story/state.ts')
    const free = await server.ssrLoadModule('/src/features/story/freeAction.ts')
    const saves = await server.ssrLoadModule('/src/features/story/saveData.ts')
    const records = await server.ssrLoadModule('/src/features/story/investigation.ts')
    const dates = await server.ssrLoadModule('/src/features/story/dateTime.ts')
    const speaker = await server.ssrLoadModule('/src/features/story/speaker.ts')
    return { scenario, ...catalog, ...state, ...free, ...saves, ...records, ...dates, ...speaker }
  } finally { await server.close() }
}

// Deterministic playable witness using only visible choices and the real reducer.
// It also finishes from saved submenus, responses, questions, and retries.
export function playCompleted(api, { state = api.createInitialState(api.scenario), optional = false, reverse = false } = {}) {
  const { scenario, visibleChoices, reduceGameState } = api
  const operations = [], states = []
  for (let count = 0; count < 800; count++) {
    const node = scenario.nodes[state.nodeId]
    if (node.type === 'end') return { state, states: [...states, state], operations }
    let action
    if (node.type === 'dialogue') action = { type: 'advance' }
    else {
      const options = visibleChoices(node, state)
      let selected
      if (node.type === 'topic' || node.type === 'inspect') {
        const completed = node.type === 'topic' ? state.heardTopics : state.inspectedTargets
        let remaining = options.filter(option => option.id !== 'return' && !completed.includes(option.id) && (optional || option.required))
        if (reverse) remaining = remaining.reverse()
        selected = remaining[0] ?? options.find(option => option.id === 'return')
      } else if (node.mode === 'free-action') {
        const commands = options.filter(option => ['talk', 'look'].includes(option.id))
        if (reverse) commands.reverse()
        selected = commands.find(command => {
          const target = scenario.nodes[command.next]
          const completed = target.type === 'topic' ? state.heardTopics : state.inspectedTargets
          return visibleChoices(target, state).some(option => option.id !== 'return' && !completed.includes(option.id) && (optional || option.required))
        }) ?? options.find(option => ['proceed', 'organize', 'move'].includes(option.id))
      } else if (state.nodeId === 'S06-question1') selected = options.find(option => option.id === 'B')
      else if (state.nodeId === 'S06-question2') selected = options.find(option => option.id === 'C')
      else selected = options.find(option => option.id !== 'return')
      assert.ok(selected, `進行不能 ${state.nodeId}`)
      action = { type: 'choose', choiceId: selected.id }
    }
    states.push(state)
    const after = reduceGameState(scenario, state, action)
    assert.notDeepEqual(after, state, `操作が拒否された ${state.nodeId}`)
    operations.push({ before: state.nodeId, after: after.nodeId, action })
    state = after
  }
  throw new Error(`進行ループ ${state.nodeId}`)
}
