import { buildPlaythrough } from './revisionHarness.mjs'

// Structural over-approximation only: conditions and branch priority are deliberately
// ignored here. Playable reachability is checked separately using the real reducer.
export function auditReferences(scenario) {
  const edges = [], missing = []
  const reference = (from, field, to) => {
    if (!Object.hasOwn(scenario.nodes, to)) missing.push(`${from}.${field} -> ${to}`)
    else edges.push({ from, field, to })
  }
  reference('$scenario', 'start', scenario.start)
  for (const [id, node] of Object.entries(scenario.nodes)) {
    if (node.next) reference(id, 'next', node.next)
    if (node.nextWhen) reference(id, 'nextWhen', node.nextWhen.next)
    for (const field of ['conditionalNext', 'automaticNext']) {
      for (const [index, branch] of (node[field] ?? []).entries()) reference(id, `${field}[${index}]`, branch.next)
    }
    for (const option of node.options ?? []) {
      reference(id, `options[${option.id}].next`, option.next)
      if (option.repeatNext) reference(id, `options[${option.id}].repeatNext`, option.repeatNext)
    }
    if (node.parent) reference(id, 'parent', node.parent.nodeId)
    if (node.empty) reference(id, 'empty', node.empty.next)
    if (node.map) reference(id, 'map.back', node.map.back)
    if (node.type === 'think') for (const field of ['insufficient', 'partial', 'complete']) reference(id, field, node[field].next)
  }
  for (const [index, use] of (scenario.itemUses ?? []).entries()) {
    reference('$scenario', `itemUses[${index}].next`, use.next)
    for (const source of use.nodeIds) {
      reference('$scenario', `itemUses[${index}].nodeIds`, source)
      reference(source, `itemUses[${index}].next`, use.next)
    }
  }
  for (const [index, event] of (scenario.arrivalEvents ?? []).entries()) {
    reference('$scenario', `arrivalEvents[${index}].arrivalNodeId`, event.arrivalNodeId)
    reference(event.arrivalNodeId, `arrivalEvents[${index}].eventNodeId`, event.eventNodeId)
  }
  for (const [source, target] of Object.entries(scenario.saveNodeAliases ?? {})) {
    // Historical input IDs may intentionally no longer exist in current nodes.
    // Save aliases are not normal gameplay edges.
    reference('$scenario', `saveNodeAliases[${source}]`, target)
  }
  const reverse = new Map(), forward = new Map()
  for (const { from, to } of edges) {
    if (!reverse.has(to)) reverse.set(to, [])
    reverse.get(to).push(from)
    if (!forward.has(from)) forward.set(from, [])
    forward.get(from).push(to)
  }
  const canReachEnd = new Set(Object.keys(scenario.nodes).filter(id => scenario.nodes[id].type === 'end'))
  const queue = [...canReachEnd]
  for (let i = 0; i < queue.length; i++) for (const source of reverse.get(queue[i]) ?? []) {
    if (!canReachEnd.has(source)) { canReachEnd.add(source); queue.push(source) }
  }
  const reachableFromStart = new Set([scenario.start]), pending = [scenario.start]
  for (let i = 0; i < pending.length; i++) for (const target of forward.get(pending[i]) ?? []) {
    if (!reachableFromStart.has(target)) { reachableFromStart.add(target); pending.push(target) }
  }
  return { missing, edges, canReachEnd, reachableFromStart }
}

// A bounded deterministic witness, not an exhaustive state-space proof. Keep the
// origin in errors so a failed alternate branch is actionable in CI.
export function finishFrom(api, state, config = {}) {
  try {
    return buildPlaythrough(api, config.requiredOnly ?? true, { state, ...config })
  } catch (error) {
    throw new Error(`進行検証 ${state.nodeId}${config.origin ? ` (${config.origin})` : ''}: ${error.message}`, { cause: error })
  }
}
