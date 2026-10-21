import { backgrounds, characters } from '../src/data/presentation.ts'
import { stageCharacters } from '../src/features/story/scene.ts'

// Test-side audit: runtime resolvers deliberately retain safe fallbacks for old saves.
export function auditPresentation(scenario) {
  const errors = []
  const registered = (table, id, path) => {
    if (Object.hasOwn(table, id)) return true
    errors.push(`${path}: unregistered ${id}`)
    return false
  }
  const expression = (person, mood, path) => {
    if (registered(characters, person, `${path}.characterId`)) registered(characters[person].expressions, mood, `${path}.expression`)
  }
  const stage = (value, path) => {
    registered(backgrounds, value.backgroundId, `${path}.backgroundId`)
    for (const [index, person] of stageCharacters(value).entries()) expression(person.characterId, person.expression, `${path}.cast[${index}]`)
  }
  for (const [id, value] of Object.entries(scenario.scenes ?? {})) stage(value, `scenes.${id}`)
  for (const [id, node] of Object.entries(scenario.nodes)) {
    const path = `nodes.${id}`
    stage(node.stage, `${path}.stage`)
    if (node.speakerId) registered(characters, node.speakerId, `${path}.speakerId`)
    let effective = node.stage
    if (node.sceneId) {
      if (registered(scenario.scenes ?? {}, node.sceneId, `${path}.sceneId`)) effective = scenario.scenes[node.sceneId]
      else continue
    }
    const cast = new Set(stageCharacters(effective).map(person => person.characterId))
    for (const [person, mood] of Object.entries(node.expressions ?? {})) {
      expression(person, mood, `${path}.expressions.${person}`)
      if (!cast.has(person)) errors.push(`${path}.expressions.${person}: absent from scene cast`)
    }
  }
  return errors
}

export function auditRevisionPresentation(data) {
  const errors = []
  const lines = (values, path) => {
    for (const [index, line] of (values ?? []).entries()) {
      const source = `${path}[${index}]`
      if (!Object.hasOwn(characters, line.speakerId)) errors.push(`${source}.speakerId: unregistered ${line.speakerId}`)
      if (line.backgroundId && !Object.hasOwn(backgrounds, line.backgroundId)) errors.push(`${source}.backgroundId: unregistered ${line.backgroundId}`)
      for (const [person, mood] of Object.entries(line.expressions ?? {})) {
        if (!Object.hasOwn(characters, person) || !Object.hasOwn(characters[person].expressions, mood)) errors.push(`${source}.expressions.${person}: unregistered ${mood}`)
      }
    }
  }
  for (const phase of data.scenes) {
    for (const person of phase.people) if (!Object.hasOwn(characters, person)) errors.push(`${phase.id}.people: unregistered ${person}`)
    lines(phase.intro, `${phase.id}.intro`)
    lines(phase.ending, `${phase.id}.ending`)
    for (const field of ['ask', 'speak', 'inspect', 'think', 'organize', 'topicTransitions']) {
      for (const action of phase[field] ?? []) {
        if (action.personId && !Object.hasOwn(characters, action.personId)) errors.push(`${phase.id}.${action.id}.personId: unregistered ${action.personId}`)
        lines(action.lines, `${phase.id}.${action.id}.lines`)
        lines(action.successLines, `${phase.id}.${action.id}.successLines`)
      }
    }
  }
  return errors
}
