import { loadCompleted, playCompleted } from './e01CompletedHarness.mjs'
import { createServer } from './viteServer.mjs'
import assert from 'node:assert/strict'
export async function loadEpisode() {
  const api = await loadCompleted()
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { e01CompletedEpisode: scenario } = await server.ssrLoadModule('/src/data/scenario/e01CompletedEpisode.ts')
    const { completedContinuationSource: source } = await server.ssrLoadModule('/src/data/scenario/e01CompletedContinuationSource.ts')
    const { selectVisibleHistory } = await server.ssrLoadModule('/src/features/story/history.ts')
    return { ...api, scenario, source, selectVisibleHistory, firstPart: api.scenario }
  } finally { await server.close() }
}
export function playEpisode(api, { state, optional = false, reverse = false, bar = false, wrong = false } = {}) {
  const first = !state || /^S0[1-6]-/.test(state.nodeId)
    ? playCompleted(api, { state, optional, reverse, stopAt: 'S06-end' })
    : { state, states: [], operations: [] }
  let current = { ...first.state, scenarioId: api.scenario.id }
  const operations = [...first.operations], states = first.states.slice(0, -1).map(value => ({ ...value, scenarioId: api.scenario.id }))
  const wrongDone = new Set(), barDone = new Set()
  const { scenario, visibleChoices, reduceGameState } = api
  for (let count = 0; count < 2000; count++) {
    const node = scenario.nodes[current.nodeId]
    states.push(current)
    if (node.type === 'end') return { state: current, states, operations }
    let action
    if (node.type === 'dialogue') action = { type: 'advance' }
    else {
      const options = visibleChoices(node, current)
      let selected
      const done = option => [...current.heardTopics, ...current.inspectedTargets].includes(option.id)
      if (node.type === 'topic' || node.type === 'inspect') {
        let candidates = options.filter(option => option.id !== 'return' && !done(option) && (optional || option.required))
        if (node.type === 'topic' && node.selection === 'person') candidates = options.filter(option => option.id !== 'return'
          && visibleChoices(scenario.nodes[option.next], current).some(topic => topic.id !== 'return' && !done(topic) && (optional || topic.required)))
        if (reverse) candidates.reverse()
        selected = candidates[0] ?? options.find(option => option.id === 'return')
      } else if (node.mode === 'free-action') {
        let commands = options.filter(option => ['talk', 'look', 'speak'].includes(option.id))
        if (reverse) commands.reverse()
        selected = commands.find(option => {
          const target = scenario.nodes[option.next]
          if (!['topic', 'inspect'].includes(target.type)) return optional && !done({ id: option.next }) && !barDone.has(option.next)
          if (target.type === 'topic' && target.selection === 'person') return visibleChoices(target, current).some(person => person.id !== 'return'
            && visibleChoices(scenario.nodes[person.next], current).some(topic => topic.id !== 'return' && !done(topic) && (optional || topic.required)))
          return visibleChoices(target, current).some(choice => choice.id !== 'return' && !done(choice) && (optional || choice.required))
        })
        if (!selected) selected = options.find(option => option.id === 'think' && (option.required || optional && !done({ id: option.next })))
        selected ??= options.find(option => ['proceed', 'organize'].includes(option.id)) ?? options.find(option => option.id === 'move')
      } else if (node.prompt && current.nodeId.includes('-question')) {
        const id = current.nodeId.slice(0, 3), index = Number(current.nodeId.match(/question(\d+)/)[1]) - 1
        const correct = id === 'S06' ? ['B', 'C'][index] : api.source.find(source => source.id === id).questions[index].correct
        if (wrong && !wrongDone.has(current.nodeId)) { wrongDone.add(current.nodeId); selected = options.find(option => option.id !== correct) }
        else selected = options.find(option => option.id === correct)
      } else if (bar && options.some(option => option.id === 'bar') && !barDone.has(current.nodeId)) {
        barDone.add(current.nodeId); selected = options.find(option => option.id === 'bar')
      } else selected = options.find(option => !['bar', 'return'].includes(option.id))
      assert.ok(selected, `進行不能 ${current.nodeId}`)
      if (current.nodeId.startsWith('BAR')) barDone.add(selected.next)
      action = { type: 'choose', choiceId: selected.id }
    }
    const after = reduceGameState(scenario, current, action)
    assert.notDeepEqual(after, current, current.nodeId)
    operations.push({ before: current.nodeId, after: after.nodeId, action })
    current = after
  }
  throw new Error(`進行ループ ${current.nodeId}`)
}
