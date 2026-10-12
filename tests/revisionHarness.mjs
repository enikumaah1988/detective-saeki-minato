import { createServer } from './viteServer.mjs'
export async function loadRevision() {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { episode1Part1: scenario } = await server.ssrLoadModule('/src/data/scenario/episode1Part1.ts')
    const { revisionData } = await server.ssrLoadModule('/src/data/scenario/revisionData.ts')
    const state = await server.ssrLoadModule('/src/features/story/state.ts')
    const free = await server.ssrLoadModule('/src/features/story/freeAction.ts')
    const saves = await server.ssrLoadModule('/src/features/story/saveData.ts')
    const records = await server.ssrLoadModule('/src/features/story/investigation.ts')
    const commands = await server.ssrLoadModule('/src/data/scenario/revisionCommands.ts')
    const dates = await server.ssrLoadModule('/src/features/story/dateTime.ts')
    return { scenario, revisionData, ...state, ...free, ...saves, ...records, ...dates, ...commands }
  } finally { await server.close() }
}
export function buildPlaythrough(api, requiredOnly = false) {
  const { scenario, revisionData, createInitialState, reduceGameState, selectCurrentNode, visibleChoices, matchesCondition } = api
  let state = createInitialState(scenario), count = 0
  const operations = [], checkpoints = [], boundaries = []
  const input = action => {
    const option = action.type === 'choose' ? visibleChoices(scenario.nodes[state.nodeId], state).find(option => option.id === action.choiceId) : undefined
    const before = state, after = reduceGameState(scenario, state, action)
    if (after === before) throw new Error(`拒否された操作 ${state.nodeId} ${JSON.stringify(action)}`)
    operations.push({ before: before.nodeId, after: after.nodeId, action, label: option?.label, map: Boolean(scenario.nodes[before.nodeId].map) })
    state = after; if (++count > 4000) throw new Error('進行ループ')
  }
  const read = () => { while (selectCurrentNode(scenario, state).type === 'dialogue') { if (scenario.nodes[state.nodeId].illustration) boundaries.push(scenario.nodes[state.nodeId].illustration.id); input({ type: 'advance' }) } }
  const choose = id => input({ type: 'choose', choiceId: id })
  read()
  for (const phase of revisionData.scenes) {
    if (state.nodeId !== `${phase.id}-menu`) throw new Error(`場面開始不一致 ${phase.id}: ${state.nodeId}`)
    const executed = new Set()
    for (let round = 0; round < 20; round++) {
      let count = 0
      for (const [command, actions] of [['talk', phase.ask], ['speak', phase.speak], ['look', phase.inspect], ['think', phase.think], ['organize', phase.organize ?? []]]) for (const action of actions) {
        if (action.triggerMode || executed.has(action.id) || requiredOnly && !action.required || !matchesCondition(state, { type: 'hasAllInformation', ids: action.requires })) continue
        const actualCommand = action.interaction === 'organize' ? 'organize' : ['talk','speak','look'].includes(command) ? api.revisionCommand(({talk:'ask',speak:'speak',look:'inspect'})[command],action.id) : command
        choose(actualCommand)
        if (actualCommand === 'talk' || actualCommand === 'speak') {
          const person = visibleChoices(scenario.nodes[state.nodeId], state).find(option => scenario.nodes[option.next]?.options?.some(option => option.id === action.id))
          if (!person) throw new Error(`相手未解放 ${action.id}`)
          choose(person.id)
        }
        if (['talk', 'speak', 'look', 'investigate'].includes(actualCommand)) choose(action.id)
        read()
        while (state.nodeId !== `${phase.id}-menu` && selectCurrentNode(scenario, state).type === 'choice') {
          const correct = scenario.nodes[state.nodeId].options.find(option => option.updates?.some(update => update.type === 'setFlag'))
          if (!correct) throw new Error(`未知の問 ${state.nodeId}`)
          choose(correct.id); read()
        }
        if (state.nodeId !== `${phase.id}-menu`) throw new Error(`復帰先不一致 ${action.id}`)
        executed.add(action.id); count++
      }
      if (!count) break
    }
    const missing = phase.exit.requires.filter(id => !state.acquiredInformation.includes(id))
    if (missing.length) throw new Error(`必要情報未取得 ${phase.id}: ${missing.join(',')}`)
    checkpoints.push({ phase: phase.id, state, actions: [...executed] })
    const exit = visibleChoices(scenario.nodes[state.nodeId], state).find(option => ['move', 'proceed'].includes(option.id))
    if (!exit) throw new Error(`出口なし ${phase.id}`)
    choose(exit.id); choose('proceed'); read()
    while (state.nodeId.includes('-outside') || state.nodeId.includes('-map') || state.nodeId.includes('-destination')) {
      const node = scenario.nodes[state.nodeId]
      choose(node.map ? node.options.find(option => option.id !== 'return').id : node.options.find(option => option.id === 'map' || option.id === 'enter').id)
      read()
    }
  }
  return { state, operations, checkpoints, boundaries }
}
